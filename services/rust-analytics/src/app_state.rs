use std::sync::Arc;

use crate::{config::Config, repository::AnalyticsRepository};

#[derive(Clone)]
pub struct AppState {
    pub config: Arc<Config>,
    pub repository: AnalyticsRepository,
}

impl AppState {
    pub fn new(config: Arc<Config>, repository: AnalyticsRepository) -> Self {
        Self { config, repository }
    }
}
