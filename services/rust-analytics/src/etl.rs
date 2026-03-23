use chrono::{Duration, Utc};
use tokio::time::{interval, MissedTickBehavior};
use tracing::{error, info};

use crate::{
    app_state::AppState,
    error::Result,
    service::{generate_analytics, AnalyticsOptions},
};

pub fn spawn_etl_loop(state: AppState) {
    if !state.config.etl_enabled {
        info!("etl loop disabled");
        return;
    }

    tokio::spawn(async move {
        let mut ticker = interval(std::time::Duration::from_secs(state.config.etl_interval_secs));
        ticker.set_missed_tick_behavior(MissedTickBehavior::Skip);

        loop {
            ticker.tick().await;

            if let Err(err) = run_once(&state).await {
                error!(error = %err, "etl snapshot run failed");
            }
        }
    });
}

async fn run_once(state: &AppState) -> Result<()> {
    let options = AnalyticsOptions {
        recent_activity_limit: state.config.recent_activity_limit,
        login_series_days: state.config.login_series_days,
    };
    let analytics = generate_analytics(&state.repository, &state.config, options).await?;

    state.repository.store_snapshot(&analytics).await?;

    if state.config.etl_retention_days > 0 {
        let cutoff = Utc::now() - Duration::days(state.config.etl_retention_days as i64);
        state.repository.delete_snapshots_older_than(cutoff).await?;
    }

    info!("etl snapshot stored");
    Ok(())
}
