# DJED Deployment & Release Procedure

## 1. Environment Topology

| Environment | Host (Render) | Database (Neon) | Data Policy |
| :--- | :--- | :--- | :--- |
| **Development** | Local / Preview | Neon Dev Branch | Synthetic test fixtures & artisan personas |
| **Staging** | `djed-staging` | Neon Staging Branch | Pre-release candidate testing & soak tests |
| **Production** | `djed-production` | Neon Production Branch | Live user data, strict manual migration review |

## 2. Migration Protocol
1. Migrations are drafted under `src/db/migrations/*.sql`.
2. Migrations must be verified in development and staging before touching production.
3. Production migrations are executed strictly through one-off deployment jobs (`djed-db-migrate-production`), never during regular server start.

## 3. Render Deployment
- Render services are defined in `render.yaml`.
- Health check path is `/api/v1/health`.
- WebSocket upgrades are routed automatically over port 3000 to `/ws`.
