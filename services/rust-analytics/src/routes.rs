use axum::{
    extract::{Query, State},
    http::HeaderMap,
    routing::get,
    Json, Router,
};
use serde::Deserialize;
use tower_http::{cors::CorsLayer, trace::TraceLayer};

use crate::{
    app_state::AppState,
    error::{AppError, Result},
    service::{generate_analytics, AnalyticsOptions},
};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalyticsQuery {
    limit: Option<usize>,
    window_days: Option<usize>,
}

pub fn build_router(state: AppState) -> Router {
    Router::new()
        .route("/healthz", get(healthz))
        .route("/analytics", get(analytics))
        .with_state(state)
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
}

async fn healthz(State(state): State<AppState>) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "ok": true,
        "service": "rust-analytics",
        "etlEnabled": state.config.etl_enabled,
        "stateCollection": state.config.mongo_collection,
        "snapshotCollection": state.config.snapshot_collection,
    }))
}

async fn analytics(
    State(state): State<AppState>,
    headers: HeaderMap,
    Query(query): Query<AnalyticsQuery>,
) -> Result<Json<crate::models::AnalyticsResponse>> {
    authorize_request(&headers, state.config.auth_token.as_deref())?;

    let options = AnalyticsOptions {
        recent_activity_limit: query
            .limit
            .unwrap_or(state.config.recent_activity_limit)
            .clamp(1, 100),
        login_series_days: query
            .window_days
            .unwrap_or(state.config.login_series_days)
            .clamp(1, 90),
    };

    let payload = generate_analytics(&state.repository, &state.config, options).await?;
    Ok(Json(payload))
}

fn authorize_request(headers: &HeaderMap, expected_token: Option<&str>) -> Result<()> {
    let Some(expected_token) = expected_token else {
        return Ok(());
    };

    let provided_token = headers
        .get("x-analytics-token")
        .and_then(|value| value.to_str().ok())
        .map(str::trim)
        .filter(|value| !value.is_empty());

    if provided_token == Some(expected_token) {
        Ok(())
    } else {
        Err(AppError::Unauthorized)
    }
}
