# Hyperapex Business Hub MVP Architecture

## Application layers

1. Frontend dashboard: `frontend/`
2. REST API: `backend/`
3. MySQL data layer: `database/schema.sql`

## Core workflows

Client -> Service Request -> Assigned Specialist -> Tasks -> Documents -> Completion

## Roles

- ADMIN: full system administration
- STAFF: operational client and request management
- SPECIALIST: assigned service matters and tasks
- CLIENT: own profile, requests and documents

## Security principles

- Never store plaintext passwords.
- Keep credentials in environment variables.
- Keep client files outside the source repository.
- Enforce role-based authorization on every protected API route.
- Log material changes in `activity_logs`.
- Use HTTPS in production.
- Validate and constrain uploaded files before storage.
