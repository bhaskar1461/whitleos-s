use std::{collections::HashMap, sync::Arc};

use chrono::{DateTime, Days, NaiveDate, TimeZone, Utc};
use tokio::task;

use crate::{
    config::Config,
    error::Result,
    models::{
        AnalyticsResponse, AnalyticsSource, ConnectionEntry, HealthDataEntry, JournalEntry, LoginAnalytics,
        LoginSeriesPoint, MealEntry, PersistedState, RecentActivity, RecordCounts, StepEntry,
        StoredStateDocument, UserAnalytics, UserRecord, WorkoutEntry,
    },
    repository::AnalyticsRepository,
};

#[derive(Debug, Clone, Copy)]
pub struct AnalyticsOptions {
    pub recent_activity_limit: usize,
    pub login_series_days: usize,
}

#[derive(Debug, Clone)]
struct UserSummary {
    label: String,
    provider: String,
}

#[derive(Debug, Clone)]
struct ActivityCandidate {
    at: String,
    kind: String,
    collection: String,
    user_id: Option<String>,
    provider: Option<String>,
    summary: String,
    sort_at_millis: i64,
}

pub async fn generate_analytics(
    repository: &AnalyticsRepository,
    config: &Config,
    options: AnalyticsOptions,
) -> Result<AnalyticsResponse> {
    let state_document = repository.fetch_state_document().await?;
    build_analytics(state_document, config, options).await
}

async fn build_analytics(
    state_document: StoredStateDocument,
    config: &Config,
    options: AnalyticsOptions,
) -> Result<AnalyticsResponse> {
    let generated_at = Utc::now().to_rfc3339();
    let updated_at = state_document.updated_at.clone();
    let state = Arc::new(state_document.state);

    let user_state = Arc::clone(&state);
    let login_state = Arc::clone(&state);
    let record_state = Arc::clone(&state);
    let recent_state = Arc::clone(&state);

    let users_task = task::spawn_blocking(move || build_user_analytics(&user_state));
    let logins_task =
        task::spawn_blocking(move || build_login_analytics(&login_state, options.login_series_days));
    let records_task = task::spawn_blocking(move || build_record_counts(&record_state));
    let recent_activity_task = task::spawn_blocking(move || {
        build_recent_activity(&recent_state, options.recent_activity_limit)
    });

    let users = users_task.await?;
    let logins = logins_task.await?;
    let records = records_task.await?;
    let recent_activity = recent_activity_task.await?;

    Ok(AnalyticsResponse {
        generated_at,
        source: AnalyticsSource {
            service: "rust-analytics".to_string(),
            mode: "live".to_string(),
            storage: "mongo".to_string(),
            state_collection: config.mongo_collection.clone(),
            state_doc_id: config.mongo_state_doc_id.clone(),
            state_updated_at: updated_at,
            snapshot_collection: config.snapshot_collection.clone(),
        },
        users,
        logins,
        records,
        recent_activity,
    })
}

fn build_user_analytics(state: &PersistedState) -> UserAnalytics {
    let now = Utc::now();
    let users = &state.users;

    let mut by_provider = HashMap::new();
    let mut new_users_last_7d = 0_usize;

    for user in users {
        let provider = normalize_provider(&user.provider);
        *by_provider.entry(provider).or_insert(0) += 1;

        if user
            .first_seen_at
            .as_deref()
            .and_then(parse_timestamp)
            .is_some_and(|timestamp| timestamp >= now - chrono::Duration::days(7))
        {
            new_users_last_7d += 1;
        }
    }

    UserAnalytics {
        total: users.len(),
        active24h: count_active_users(users, now - chrono::Duration::hours(24)),
        active7d: count_active_users(users, now - chrono::Duration::days(7)),
        active30d: count_active_users(users, now - chrono::Duration::days(30)),
        new_users_last7d: new_users_last_7d,
        total_logins: users.iter().map(|user| user.login_count).sum(),
        by_provider,
    }
}

fn build_login_analytics(state: &PersistedState, window_days: usize) -> LoginAnalytics {
    let mut by_provider = HashMap::new();

    for user in &state.users {
        let provider = normalize_provider(&user.provider);
        *by_provider.entry(provider).or_insert(0) += user.login_count;
    }

    let total = by_provider.values().copied().sum::<u64>();
    let today_key = Utc::now().format("%Y-%m-%d").to_string();
    let today = state.analytics.logins_by_date.get(&today_key).copied().unwrap_or(0);
    let series = build_login_series(&state.analytics.logins_by_date, window_days);

    LoginAnalytics {
        total,
        today,
        by_provider,
        window_days,
        series,
    }
}

fn build_record_counts(state: &PersistedState) -> RecordCounts {
    RecordCounts {
        journal: state.journal.len(),
        meals: state.meals.len(),
        workouts: state.workouts.len(),
        steps: state.steps.len(),
        health_data: state.health_data.len(),
        connections: state.connections.len(),
        webhooks: state.webhooks.len(),
    }
}

fn build_recent_activity(state: &PersistedState, limit: usize) -> Vec<RecentActivity> {
    let user_lookup = build_user_lookup(&state.users);
    let mut candidates = Vec::new();

    for user in &state.users {
        if let Some(timestamp) = user.last_login_at.as_deref().and_then(parse_timestamp) {
            let summary = format!(
                "{} logged in via {}",
                lookup_user_label(Some(user.id.as_str()), &user_lookup),
                normalize_provider(&user.provider)
            );
            candidates.push(ActivityCandidate {
                at: timestamp.to_rfc3339(),
                kind: "login".to_string(),
                collection: "users".to_string(),
                user_id: Some(user.id.clone()),
                provider: Some(normalize_provider(&user.provider)),
                summary,
                sort_at_millis: timestamp.timestamp_millis(),
            });
        }
    }

    append_connection_activity(&mut candidates, &state.connections, &user_lookup);
    append_journal_activity(&mut candidates, &state.journal, &user_lookup);
    append_meal_activity(&mut candidates, &state.meals, &user_lookup);
    append_workout_activity(&mut candidates, &state.workouts, &user_lookup);
    append_step_activity(&mut candidates, &state.steps, &user_lookup);
    append_health_activity(&mut candidates, &state.health_data, &user_lookup);

    candidates.sort_by(|left, right| right.sort_at_millis.cmp(&left.sort_at_millis));
    candidates.truncate(limit);

    candidates
        .into_iter()
        .map(|candidate| RecentActivity {
            at: candidate.at,
            kind: candidate.kind,
            collection: candidate.collection,
            user_id: candidate.user_id,
            provider: candidate.provider,
            summary: candidate.summary,
        })
        .collect()
}

fn append_connection_activity(
    candidates: &mut Vec<ActivityCandidate>,
    items: &[ConnectionEntry],
    user_lookup: &HashMap<String, UserSummary>,
) {
    for item in items {
        let Some(timestamp) = item.updated_at.as_deref().and_then(parse_timestamp) else {
            continue;
        };
        let provider = item.provider.clone();
        let summary = format!(
            "{} refreshed {} connection",
            lookup_user_label(item.uid.as_deref(), user_lookup),
            provider.clone().unwrap_or_else(|| "an external".to_string())
        );

        candidates.push(ActivityCandidate {
            at: timestamp.to_rfc3339(),
            kind: "connection_refresh".to_string(),
            collection: "connections".to_string(),
            user_id: item.uid.clone(),
            provider,
            summary,
            sort_at_millis: timestamp.timestamp_millis(),
        });
    }
}

fn append_journal_activity(
    candidates: &mut Vec<ActivityCandidate>,
    items: &[JournalEntry],
    user_lookup: &HashMap<String, UserSummary>,
) {
    for item in items {
        let Some(timestamp) = item
            .created
            .as_deref()
            .and_then(parse_timestamp)
            .or_else(|| item.date.as_deref().and_then(parse_timestamp))
        else {
            continue;
        };

        let summary = format!(
            "{} wrote \"{}\"",
            lookup_user_label(item.uid.as_deref(), user_lookup),
            item.title.as_deref().unwrap_or("Journal entry")
        );

        candidates.push(ActivityCandidate {
            at: timestamp.to_rfc3339(),
            kind: "journal_entry".to_string(),
            collection: "journal".to_string(),
            user_id: item.uid.clone(),
            provider: lookup_provider(item.uid.as_deref(), user_lookup),
            summary,
            sort_at_millis: timestamp.timestamp_millis(),
        });
    }
}

fn append_meal_activity(
    candidates: &mut Vec<ActivityCandidate>,
    items: &[MealEntry],
    user_lookup: &HashMap<String, UserSummary>,
) {
    for item in items {
        let Some(timestamp) = item
            .created
            .as_deref()
            .and_then(parse_timestamp)
            .or_else(|| item.date.as_deref().and_then(parse_timestamp))
        else {
            continue;
        };

        let meal_name = item.name.as_deref().unwrap_or("a meal");
        let calories = item
            .calories
            .map(|value| format!("{} kcal", value.round() as i64))
            .unwrap_or_else(|| "calories n/a".to_string());
        let summary = format!(
            "{} logged {} ({})",
            lookup_user_label(item.uid.as_deref(), user_lookup),
            meal_name,
            calories
        );

        candidates.push(ActivityCandidate {
            at: timestamp.to_rfc3339(),
            kind: "meal_logged".to_string(),
            collection: "meals".to_string(),
            user_id: item.uid.clone(),
            provider: lookup_provider(item.uid.as_deref(), user_lookup),
            summary,
            sort_at_millis: timestamp.timestamp_millis(),
        });
    }
}

fn append_workout_activity(
    candidates: &mut Vec<ActivityCandidate>,
    items: &[WorkoutEntry],
    user_lookup: &HashMap<String, UserSummary>,
) {
    for item in items {
        let Some(timestamp) = item
            .created
            .as_deref()
            .and_then(parse_timestamp)
            .or_else(|| item.date.as_deref().and_then(parse_timestamp))
        else {
            continue;
        };

        let duration = item
            .duration
            .map(|value| format!("{} min", value.round() as i64))
            .unwrap_or_else(|| "duration n/a".to_string());
        let summary = format!(
            "{} logged {} ({})",
            lookup_user_label(item.uid.as_deref(), user_lookup),
            item.exercise.as_deref().unwrap_or("a workout"),
            duration
        );

        candidates.push(ActivityCandidate {
            at: timestamp.to_rfc3339(),
            kind: "workout_logged".to_string(),
            collection: "workouts".to_string(),
            user_id: item.uid.clone(),
            provider: lookup_provider(item.uid.as_deref(), user_lookup)
                .or_else(|| item.source.clone()),
            summary,
            sort_at_millis: timestamp.timestamp_millis(),
        });
    }
}

fn append_step_activity(
    candidates: &mut Vec<ActivityCandidate>,
    items: &[StepEntry],
    user_lookup: &HashMap<String, UserSummary>,
) {
    for item in items {
        let Some(timestamp) = item
            .created
            .as_deref()
            .and_then(parse_timestamp)
            .or_else(|| item.date.as_deref().and_then(parse_timestamp))
        else {
            continue;
        };

        let step_count = item
            .count
            .map(|value| format!("{} steps", value.round() as i64))
            .unwrap_or_else(|| "steps".to_string());
        let summary = format!(
            "{} recorded {}",
            lookup_user_label(item.uid.as_deref(), user_lookup),
            step_count
        );

        candidates.push(ActivityCandidate {
            at: timestamp.to_rfc3339(),
            kind: "steps_logged".to_string(),
            collection: "steps".to_string(),
            user_id: item.uid.clone(),
            provider: lookup_provider(item.uid.as_deref(), user_lookup)
                .or_else(|| item.source.clone()),
            summary,
            sort_at_millis: timestamp.timestamp_millis(),
        });
    }
}

fn append_health_activity(
    candidates: &mut Vec<ActivityCandidate>,
    items: &[HealthDataEntry],
    user_lookup: &HashMap<String, UserSummary>,
) {
    for item in items {
        let Some(timestamp) = item
            .created
            .as_deref()
            .and_then(parse_timestamp)
            .or_else(|| item.date.as_deref().and_then(parse_timestamp))
        else {
            continue;
        };

        let summary = format!(
            "{} synced health data",
            lookup_user_label(item.uid.as_deref(), user_lookup)
        );

        candidates.push(ActivityCandidate {
            at: timestamp.to_rfc3339(),
            kind: "health_sync".to_string(),
            collection: "healthData".to_string(),
            user_id: item.uid.clone(),
            provider: lookup_provider(item.uid.as_deref(), user_lookup)
                .or_else(|| item.source.clone()),
            summary,
            sort_at_millis: timestamp.timestamp_millis(),
        });
    }
}

fn build_user_lookup(users: &[UserRecord]) -> HashMap<String, UserSummary> {
    users.iter()
        .map(|user| {
            let label = user
                .username
                .clone()
                .or_else(|| user.email.clone())
                .unwrap_or_else(|| user.id.clone());
            (
                user.id.clone(),
                UserSummary {
                    label,
                    provider: normalize_provider(&user.provider),
                },
            )
        })
        .collect()
}

fn lookup_user_label(user_id: Option<&str>, lookup: &HashMap<String, UserSummary>) -> String {
    user_id
        .and_then(|id| lookup.get(id))
        .map(|summary| summary.label.clone())
        .unwrap_or_else(|| "Unknown user".to_string())
}

fn lookup_provider(user_id: Option<&str>, lookup: &HashMap<String, UserSummary>) -> Option<String> {
    user_id
        .and_then(|id| lookup.get(id))
        .map(|summary| summary.provider.clone())
}

fn count_active_users(users: &[UserRecord], since: DateTime<Utc>) -> usize {
    users.iter()
        .filter(|user| {
            user.last_seen_at
                .as_deref()
                .and_then(parse_timestamp)
                .or_else(|| user.last_login_at.as_deref().and_then(parse_timestamp))
                .or_else(|| user.first_seen_at.as_deref().and_then(parse_timestamp))
                .map(|timestamp| timestamp >= since)
                .unwrap_or(false)
        })
        .count()
}

fn build_login_series(logins_by_date: &HashMap<String, u64>, window_days: usize) -> Vec<LoginSeriesPoint> {
    let mut result = Vec::with_capacity(window_days);
    let today = Utc::now().date_naive();

    for offset in (0..window_days).rev() {
        let day = today - Days::new(offset as u64);
        let key = day.format("%Y-%m-%d").to_string();
        result.push(LoginSeriesPoint {
            date: key.clone(),
            logins: logins_by_date.get(&key).copied().unwrap_or(0),
        });
    }

    result
}

fn normalize_provider(provider: &str) -> String {
    let trimmed = provider.trim().to_ascii_lowercase();
    if trimmed.is_empty() {
        "unknown".to_string()
    } else {
        trimmed
    }
}

fn parse_timestamp(value: &str) -> Option<DateTime<Utc>> {
    DateTime::parse_from_rfc3339(value)
        .map(|timestamp| timestamp.with_timezone(&Utc))
        .ok()
        .or_else(|| {
            NaiveDate::parse_from_str(value, "%Y-%m-%d")
                .ok()
                .and_then(|date| date.and_hms_opt(0, 0, 0))
                .map(|timestamp| Utc.from_utc_datetime(&timestamp))
        })
}
