# PocketBase emulator

This folder contains files related to a local PocketBase emulator used for the project's "cloud" experiment.

Primary locations:

- [`packages/cloud/pocketbase`](packages/cloud/pocketbase:1)
- [`packages/cloud/pb_bin`](packages/cloud/pb_bin:1)
- Docker compose: [`packages/cloud/docker/docker-compose.pocketbase.yml:1`](packages/cloud/docker/docker-compose.pocketbase.yml:1)

How to run (local):
docker compose -f packages/cloud/docker/docker-compose.pocketbase.yml --profile cloud up -d

If you want these files removed or moved, I can perform the requested file moves on a new branch and commit the changes.
