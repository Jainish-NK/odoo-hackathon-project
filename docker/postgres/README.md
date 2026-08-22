# PostgreSQL

No custom init scripts are required for the hackathon skeleton — Prisma migrations
(`npm run prisma:migrate`) own schema creation. This directory is reserved for future
init/backup scripts if the project needs them (e.g. `initdb.d` SQL files mounted into
the `postgres` service in `docker-compose.yml`).
