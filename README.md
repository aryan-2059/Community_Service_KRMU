# Reelearn

Reelearn is a Vite/React client and Express API deployed together as one Vercel
project.

## Deploy to Vercel

1. Import this repository into Vercel and leave **Root Directory** set to the
   repository root.
2. Keep the build settings from `vercel.json`: dependencies are installed for
   `client` and `server`, the client is built into `client/dist`, and
   `api/[...path].js` routes `/api/*` requests to Express.
3. Add `DATABASE_URL` for a PostgreSQL database, preferably a pooled/serverless
   connection string. Vercel `/tmp` storage is not persistent.
4. Add `JWT_SECRET` as a Vercel environment variable. Use a long, random value.
5. Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
   `CLOUDINARY_API_SECRET` if revision-post media uploads are needed.
6. Deploy. The client uses the same-origin `/api` path, so `VITE_API_URL` and
   `CLIENT_URL` are not required for the normal single-domain deployment.

Set `CLIENT_URL` only when allowing a separate frontend origin. Add the
appropriate value for each Vercel environment (Production, Preview, and
Development) if those origins must call the API directly.

## Local development

Install dependencies and start the API and client in separate terminals:

```sh
npm run install:all
npm run dev:server
npm run dev:client
```

Vite proxies local `/api` requests to the API on port 5000.

## Deployment limitations

The PostgreSQL adapter currently stores the dataset as one JSONB document to
preserve the app's existing data interface. It provides shared persistence and
serializes writes, but reads and writes the full dataset per operation. For
larger deployments, migrate to normalized PostgreSQL tables.

Revision media uploads go through the API and are limited by Vercel's function
request-size limits. For larger media, use direct-to-Cloudinary uploads rather
than sending the full file through the function.
