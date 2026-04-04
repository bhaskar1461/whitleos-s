FROM rust:1.82 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists*

# IMPORTANT: binary name = project name
COPY --from=builder /app/target/release/rust-analytics /usr/local/bin/rust-analytics

ENV RUST_ANALYTICS_HOST=0.0.0.0
ENV RUST_ANALYTICS_PORT=8081

EXPOSE 8081

CMD ["rust-analytics"]