use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Serialize;
use thiserror::Error;

pub type Result<T> = std::result::Result<T, AppError>;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("configuration error: {0}")]
    Config(String),
    #[error("database error: {0}")]
    Mongo(#[from] mongodb::error::Error),
    #[error("bson serialization error: {0}")]
    BsonSerialization(#[from] mongodb::bson::ser::Error),
    #[error("bson deserialization error: {0}")]
    BsonDeserialization(#[from] mongodb::bson::de::Error),
    #[error("background task failure: {0}")]
    Join(#[from] tokio::task::JoinError),
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
    #[error("unauthorized")]
    Unauthorized,
    #[error("invalid request: {0}")]
    InvalidRequest(String),
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ErrorPayload {
    error: &'static str,
    message: String,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let message = self.to_string();
        let (status, error_code) = match &self {
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, "unauthorized"),
            AppError::InvalidRequest(_) => (StatusCode::BAD_REQUEST, "invalid_request"),
            AppError::Config(_) => (StatusCode::INTERNAL_SERVER_ERROR, "configuration_error"),
            AppError::Mongo(_)
            | AppError::BsonSerialization(_)
            | AppError::BsonDeserialization(_)
            | AppError::Join(_)
            | AppError::Io(_) => (StatusCode::INTERNAL_SERVER_ERROR, "internal_error"),
        };

        let payload = ErrorPayload {
            error: error_code,
            message,
        };

        (status, Json(payload)).into_response()
    }
}
