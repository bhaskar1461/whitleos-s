use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct StoredStateDocument {
    #[serde(rename = "_id")]
    pub id: String,
    #[serde(default)]
    pub state: PersistedState,
    #[serde(rename = "updatedAt", default)]
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PersistedState {
    #[serde(default)]
    pub journal: Vec<JournalEntry>,
    #[serde(default)]
    pub steps: Vec<StepEntry>,
    #[serde(default)]
    pub meals: Vec<MealEntry>,
    #[serde(default)]
    pub workouts: Vec<WorkoutEntry>,
    #[serde(default)]
    pub health_data: Vec<HealthDataEntry>,
    #[serde(default)]
    pub webhooks: Vec<WebhookEntry>,
    #[serde(default)]
    pub connections: Vec<ConnectionEntry>,
    #[serde(default)]
    pub users: Vec<UserRecord>,
    #[serde(default)]
    pub analytics: AnalyticsState,
}

#[derive(Debug, Clone, Deserialize, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AnalyticsState {
    #[serde(default)]
    pub logins_by_date: HashMap<String, u64>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct UserRecord {
    pub id: String,
    #[serde(default)]
    pub provider: String,
    #[serde(default)]
    pub username: Option<String>,
    #[serde(default)]
    pub email: Option<String>,
    #[serde(default)]
    pub avatar: Option<String>,
    #[serde(default)]
    pub first_seen_at: Option<String>,
    #[serde(default)]
    pub last_seen_at: Option<String>,
    #[serde(default)]
    pub last_login_at: Option<String>,
    #[serde(default)]
    pub login_count: u64,
}

#[derive(Debug, Clone, Deserialize, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct JournalEntry {
    #[serde(default)]
    pub id: Option<String>,
    #[serde(default)]
    pub uid: Option<String>,
    #[serde(default)]
    pub title: Option<String>,
    #[serde(default)]
    pub date: Option<String>,
    #[serde(default)]
    pub created: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MealEntry {
    #[serde(default)]
    pub id: Option<String>,
    #[serde(default)]
    pub uid: Option<String>,
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub calories: Option<f64>,
    #[serde(default)]
    pub date: Option<String>,
    #[serde(default)]
    pub created: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct WorkoutEntry {
    #[serde(default)]
    pub id: Option<String>,
    #[serde(default)]
    pub uid: Option<String>,
    #[serde(default)]
    pub exercise: Option<String>,
    #[serde(default)]
    pub duration: Option<f64>,
    #[serde(default)]
    pub source: Option<String>,
    #[serde(default)]
    pub date: Option<String>,
    #[serde(default)]
    pub created: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct StepEntry {
    #[serde(default)]
    pub id: Option<String>,
    #[serde(default)]
    pub uid: Option<String>,
    #[serde(default)]
    pub count: Option<f64>,
    #[serde(default)]
    pub source: Option<String>,
    #[serde(default)]
    pub date: Option<String>,
    #[serde(default)]
    pub created: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct HealthDataEntry {
    #[serde(default)]
    pub id: Option<String>,
    #[serde(default)]
    pub uid: Option<String>,
    #[serde(default)]
    pub source: Option<String>,
    #[serde(default)]
    pub date: Option<String>,
    #[serde(default)]
    pub created: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ConnectionEntry {
    #[serde(default)]
    pub id: Option<String>,
    #[serde(default)]
    pub uid: Option<String>,
    #[serde(default)]
    pub provider: Option<String>,
    #[serde(default)]
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct WebhookEntry {
    #[serde(default)]
    pub id: Option<String>,
    #[serde(default)]
    pub event: Option<String>,
    #[serde(default)]
    pub received_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalyticsResponse {
    pub generated_at: String,
    pub source: AnalyticsSource,
    pub users: UserAnalytics,
    pub logins: LoginAnalytics,
    pub records: RecordCounts,
    pub recent_activity: Vec<RecentActivity>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalyticsSource {
    pub service: String,
    pub mode: String,
    pub storage: String,
    pub state_collection: String,
    pub state_doc_id: String,
    pub state_updated_at: Option<String>,
    pub snapshot_collection: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserAnalytics {
    pub total: usize,
    pub active24h: usize,
    pub active7d: usize,
    pub active30d: usize,
    pub new_users_last7d: usize,
    pub total_logins: u64,
    pub by_provider: HashMap<String, u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginAnalytics {
    pub total: u64,
    pub today: u64,
    pub by_provider: HashMap<String, u64>,
    pub window_days: usize,
    pub series: Vec<LoginSeriesPoint>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginSeriesPoint {
    pub date: String,
    pub logins: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecordCounts {
    pub journal: usize,
    pub meals: usize,
    pub workouts: usize,
    pub steps: usize,
    pub health_data: usize,
    pub connections: usize,
    pub webhooks: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecentActivity {
    pub at: String,
    pub kind: String,
    pub collection: String,
    pub user_id: Option<String>,
    pub provider: Option<String>,
    pub summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalyticsSnapshotDocument {
    #[serde(rename = "_id")]
    pub id: String,
    pub generated_at: String,
    pub analytics: AnalyticsResponse,
}
