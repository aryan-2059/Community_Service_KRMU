# Principal account setup

Principal credentials are secrets: do not commit them to source control or send
them in chat.

## Vercel deployment

In the Vercel project that hosts the Express API, open **Settings → Environment
Variables** and add these variables for the environments where the API is
deployed:

- `JWT_SECRET`: a long, random signing secret.
- `PRINCIPAL_EMAIL`: the principal's email address.
- `PRINCIPAL_PASSWORD`: a new, unique password with at least 12 characters.
- `PRINCIPAL_NAME`: optional display name.

Redeploy the API after adding or changing these variables. On the first
successful principal sign-in, the API creates the configured account if it
doesn't already exist. The principal then signs in at `/principal-login`.

If the configured email already belongs to a non-principal account, change the
environment variable to a different email. Existing principal accounts are not
silently overwritten when the environment password changes.

## Local development

Copy `.env.example` to `.env` in the `server` directory, then replace the
principal placeholders and `JWT_SECRET` with local values. `.env` is ignored by
Git and must not be committed.

## Storage warning

The current JSON store is temporary and instance-local on Vercel. The
environment-configured principal can be provisioned in each running function,
but other app records are not durable or shared across instances. Connect a
shared database before using the application for persistent school records.
