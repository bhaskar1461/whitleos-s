use std::sync::Arc;

use chrono::{DateTime, Utc};
use mongodb::{
    bson::{doc, to_document},
    options::{ClientOptions, IndexOptions, UpdateOptions},
    Client, Collection, IndexModel,
};

use crate::{
    config::Config,
    error::Result,
    models::{AnalyticsResponse, AnalyticsSnapshotDocument, PersistedState, StoredStateDocument},
};

#[derive(Clone)]
pub struct AnalyticsRepository {
    state_collection: Collection<StoredStateDocument>,
    snapshot_collection: Collection<AnalyticsSnapshotDocument>,
    config: Arc<Config>,
    _client: Client,
}

impl AnalyticsRepository {
    pub async fn connect(config: Arc<Config>) -> Result<Self> {
        let mut options = ClientOptions::parse(&config.mongo_uri).await?;
        options.max_pool_size = Some(config.mongo_max_pool_size);

        let client = Client::with_options(options)?;
        let database = client.database(&config.mongo_db_name);
        let state_collection = database.collection::<StoredStateDocument>(&config.mongo_collection);
        let snapshot_collection =
            database.collection::<AnalyticsSnapshotDocument>(&config.snapshot_collection);

        Ok(Self {
            state_collection,
            snapshot_collection,
            config,
            _client: client,
        })
    }

    pub async fn ensure_indexes(&self) -> Result<()> {
        let options = IndexOptions::builder()
            .name(Some("generatedAt_desc".to_string()))
            .build();
        let index = IndexModel::builder()
            .keys(doc! { "generatedAt": -1_i32 })
            .options(options)
            .build();

        self.snapshot_collection.create_index(index, None).await?;
        Ok(())
    }

    pub async fn fetch_state_document(&self) -> Result<StoredStateDocument> {
        let doc = self
            .state_collection
            .find_one(doc! { "_id": &self.config.mongo_state_doc_id }, None)
            .await?;

        Ok(doc.unwrap_or(StoredStateDocument {
            id: self.config.mongo_state_doc_id.clone(),
            state: PersistedState::default(),
            updated_at: None,
        }))
    }

    pub async fn store_snapshot(&self, analytics: &AnalyticsResponse) -> Result<()> {
        let snapshot = AnalyticsSnapshotDocument {
            id: format!("analytics:{}", analytics.generated_at),
            generated_at: analytics.generated_at.clone(),
            analytics: analytics.clone(),
        };

        let update = doc! { "$set": to_document(&snapshot)? };
        let options = UpdateOptions::builder().upsert(true).build();
        self.snapshot_collection
            .update_one(doc! { "_id": &snapshot.id }, update, options)
            .await?;

        Ok(())
    }

    pub async fn delete_snapshots_older_than(&self, cutoff: DateTime<Utc>) -> Result<()> {
        self.snapshot_collection
            .delete_many(doc! { "generatedAt": { "$lt": cutoff.to_rfc3339() } }, None)
            .await?;
        Ok(())
    }
}
