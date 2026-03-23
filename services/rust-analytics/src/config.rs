use std::env;

use crate::error::{AppError, Result};

#[derive(Debug, Clone)]
pub struct Config {
    pub host: String,
    pub port: u16,
    pub mongo_uri: String,
    pub mongo_db_name: String,
    pub mongo_collection: String,
    pub mongo_state_doc_id: String,
    pub snapshot_collection: String,
    pub auth_token: Option<String>,
    pub recent_activity_limit: usize,
    pub login_series_days: usize,
    pub etl_enabled: bool,
    pub etl_interval_secs: u64,
    pub etl_retention_days: u64,
    pub mongo_max_pool_size: u32,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        Ok(Self {
            host: read_string("RUST_ANALYTICS_HOST", "0.0.0.0"),
            port: read_number("RUST_ANALYTICS_PORT", 8081_u16)?,
            mongo_uri: read_required("MONGODB_URI")?,
            mongo_db_name: read_string("MONGODB_DB_NAME", "whitleos"),
            mongo_collection: read_string("MONGODB_COLLECTION", "appState"),
            mongo_state_doc_id: read_string("MONGODB_STATE_DOC_ID", "whitleos-state-v1"),
            snapshot_collection: read_string("RUST_ANALYTICS_SNAPSHOT_COLLECTION", "analyticsSnapshots"),
            auth_token: read_optional("RUST_ANALYTICS_TOKEN"),
            recent_activity_limit: read_number("RUST_ANALYTICS_RECENT_ACTIVITY_LIMIT", 20_usize)?,
            login_series_days: read_number("RUST_ANALYTICS_LOGIN_SERIES_DAYS", 14_usize)?,
            etl_enabled: read_bool("RUST_ANALYTICS_ETL_ENABLED", true),
            etl_interval_secs: read_number("RUST_ANALYTICS_ETL_INTERVAL_SECS", 300_u64)?,
            etl_retention_days: read_number("RUST_ANALYTICS_ETL_RETENTION_DAYS", 30_u64)?,
            mongo_max_pool_size: read_number("RUST_ANALYTICS_MONGO_MAX_POOL_SIZE", 20_u32)?,
        })
    }

    pub fn bind_addr(&self) -> String {
        format!("{}:{}", self.host, self.port)
    }
}

fn read_string(key: &str, default: &str) -> String {
    env::var(key)
        .ok()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| default.to_string())
}

fn read_optional(key: &str) -> Option<String> {
    env::var(key)
        .ok()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

fn read_required(key: &str) -> Result<String> {
    read_optional(key).ok_or_else(|| AppError::Config(format!("{key} must be set")))
}

fn read_bool(key: &str, default: bool) -> bool {
    match env::var(key) {
        Ok(value) => matches!(value.trim().to_ascii_lowercase().as_str(), "1" | "true" | "yes" | "on"),
        Err(_) => default,
    }
}

fn read_number<T>(key: &str, default: T) -> Result<T>
where
    T: std::str::FromStr + Copy,
{
    match env::var(key) {
        Ok(value) => value
            .trim()
            .parse::<T>()
            .map_err(|_| AppError::Config(format!("{key} must be a valid number"))),
        Err(_) => Ok(default),
    }
}
