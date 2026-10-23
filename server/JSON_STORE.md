# Temporary JSON storage

The server stores application records in one JSON file. Set `JSON_STORE_PATH` to an absolute or working-directory-relative path to select the file. Without it, local runs use `server/data/reelearn.json`; Vercel runs use `/tmp/reelearn-stage.json`.

This backend is intended for temporary staging checks, not production data. Vercel's `/tmp` storage is instance-local and may be cleared at any time. Render's local filesystem is ephemeral unless a persistent disk is configured. Concurrent server instances do not share or coordinate JSON writes, and there is no migration from the old SQL database. Use a shared database before relying on persistent or multi-instance data.

Run `npm run seed --prefix server` to reset the JSON file and load sample data. Run `npm run principal:create --prefix server` to create a principal using `PRINCIPAL_EMAIL`, `PRINCIPAL_PASSWORD`, and optionally `PRINCIPAL_NAME`.
