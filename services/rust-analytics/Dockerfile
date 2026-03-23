FROM rust:1.82-bookworm AS builder

WORKDIR /app

COPY Cargo.toml Cargo.lock ./
COPY src ./src

RUN cargo build --release --locked

FROM debian:bookworm-slim AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV RUST_ANALYTICS_HOST=0.0.0.0
ENV RUST_ANALYTICS_PORT=8081

COPY --from=builder /app/target/release/rust-analytics /usr/local/bin/rust-analytics

EXPOSE 8081

CMD ["rust-analytics"]
