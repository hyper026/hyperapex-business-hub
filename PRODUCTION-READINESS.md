# Hyperapex Business Hub — Production Readiness Checklist

## Application
- [ ] Deploy the intended `main` commit.
- [ ] Set Node.js 20 or newer.
- [ ] Run `npm install` in `backend` during deployment.
- [ ] Start with `npm start`.
- [ ] Confirm `/api/health` returns the expected service status.

## Secrets and environment
- [ ] Set a strong `JWT_SECRET` of at least 32 characters.
- [ ] Configure `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` and `DB_PASSWORD`.
- [ ] Configure `CORS_ORIGIN` to the exact production frontend origin.
- [ ] Never commit `.env` files, passwords, private keys or backup files.

## HTTPS and network
- [ ] Serve the frontend and API over HTTPS.
- [ ] Configure reverse-proxy/TLS termination correctly.
- [ ] Confirm secure CORS behavior from the production frontend.
- [ ] Restrict database network access to trusted application infrastructure.

## Database
- [ ] Run all migrations in order.
- [ ] Confirm the application can connect to MySQL.
- [ ] Configure daily backups using `backend/scripts/backup-db.sh`.
- [ ] Store a second encrypted copy in private/off-site storage.
- [ ] Test restoration periodically using `backend/scripts/restore-db.sh`.

## Documents
- [ ] Configure private document storage.
- [ ] Confirm uploaded files are not publicly accessible by URL.
- [ ] Confirm authenticated users can access only authorized matter documents.
- [ ] Apply file-size/type limits appropriate to the production environment.

## Security
- [ ] Confirm rate limiting is active.
- [ ] Confirm Helmet/security headers are active.
- [ ] Confirm role-based authorization for Admin, Staff, Specialist and Client.
- [ ] Confirm client ownership checks on matters, quotations, invoices, payments and documents.
- [ ] Review GitHub Actions status before production deployment.

## Operations
- [ ] Configure application logs and alerting.
- [ ] Configure backup monitoring/failure alerts.
- [ ] Record the production release commit.
- [ ] Keep a tested rollback procedure.
- [ ] Perform a smoke test: login → service request → quotation → approval → invoice → payment → receipt.

## Important
Passing this checklist is a deployment procedure, not a guarantee of security or regulatory compliance. Perform an appropriate security review and confirm applicable Kenyan legal, tax, privacy and records-retention requirements before production use.