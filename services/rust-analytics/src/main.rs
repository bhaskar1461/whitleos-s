mod app_state;
mod config;
mod error;
mod etl;
mod models;
mod repository;
mod routes;
mod service;

use std::sync::Arc;

use app_state::AppState;
use config::Config;
use error::Result;
use repository::AnalyticsRepository;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> Result<()> {
    dotenvy::dotenv().ok();
    init_tracing();

    let config = Arc::new(Config::from_env()?);
    let repository = AnalyticsRepository::connect(config.clone()).await?;
    repository.ensure_indexes().await?;

    let app_state = AppState::new(config.clone(), repository);
    etl::spawn_etl_loop(app_state.clone());

    let router = routes::build_router(app_state);
    let listener = tokio::net::TcpListener::bind(config.bind_addr()).await?;

    info!("rust analytics listening on {}", config.bind_addr());
    axum::serve(listener, router).await?;

    Ok(())
}

fn init_tracing() {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| {
            "rust_analytics=info,tower_http=info,axum=info".into()
        }))
        .with(tracing_subscriber::fmt::layer())
        .init();
}
