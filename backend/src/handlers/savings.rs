use axum::{extract::State, http::StatusCode, Json};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;

use crate::middleware::auth::Claims;

#[derive(Serialize)]
pub struct SavingsResponse {
    pub savings: f64,
}

#[derive(Deserialize)]
pub struct UpdateSavings {
    pub savings: f64,
}

#[derive(Serialize)]
pub struct RothIraResponse {
    pub roth_ira: f64,
}

#[derive(Deserialize)]
pub struct UpdateRothIra {
    pub roth_ira: f64,
}

pub async fn get_savings(
    State(pool): State<SqlitePool>,
    axum::Extension(claims): axum::Extension<Claims>,
) -> Result<Json<SavingsResponse>, StatusCode> {
    let savings: f64 = sqlx::query_scalar("SELECT savings FROM users WHERE id = ?")
        .bind(claims.sub)
        .fetch_one(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(SavingsResponse { savings }))
}

pub async fn update_savings(
    State(pool): State<SqlitePool>,
    axum::Extension(claims): axum::Extension<Claims>,
    Json(payload): Json<UpdateSavings>,
) -> Result<Json<SavingsResponse>, StatusCode> {
    sqlx::query("UPDATE users SET savings = ? WHERE id = ?")
        .bind(payload.savings)
        .bind(claims.sub)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(SavingsResponse {
        savings: payload.savings,
    }))
}

pub async fn get_roth_ira(
    State(pool): State<SqlitePool>,
    axum::Extension(claims): axum::Extension<Claims>,
) -> Result<Json<RothIraResponse>, StatusCode> {
    let roth_ira: f64 = sqlx::query_scalar("SELECT roth_ira FROM users WHERE id = ?")
        .bind(claims.sub)
        .fetch_one(&pool)
        .await
        .unwrap_or(0.0);

    Ok(Json(RothIraResponse { roth_ira }))
}

pub async fn update_roth_ira(
    State(pool): State<SqlitePool>,
    axum::Extension(claims): axum::Extension<Claims>,
    Json(payload): Json<UpdateRothIra>,
) -> Result<Json<RothIraResponse>, StatusCode> {
    sqlx::query("UPDATE users SET roth_ira = ? WHERE id = ?")
        .bind(payload.roth_ira)
        .bind(claims.sub)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(RothIraResponse {
        roth_ira: payload.roth_ira,
    }))
}
