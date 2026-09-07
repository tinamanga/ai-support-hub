# AI Support Hub — Backend

A production-oriented REST API backend for **AI Support Hub**, a multi-organization customer support platform built with **FastAPI, PostgreSQL, SQLAlchemy, Alembic, JWT authentication, and Pytest**.

The backend provides the foundation for user authentication, organization management, role-based access control, customer management, support conversations, and messaging.

---

## Table of Contents

* [Overview](#overview)
* [Key Features](#key-features)
* [Technology Stack](#technology-stack)
* [Architecture](#architecture)
* [Project Structure](#project-structure)
* [Core Domain Model](#core-domain-model)
* [Authentication](#authentication)
* [Authorization and Roles](#authorization-and-roles)
* [Organizations](#organizations)
* [Customers](#customers)
* [Conversations](#conversations)
* [Messages](#messages)
* [Database](#database)
* [Database Migrations](#database-migrations)
* [Environment Configuration](#environment-configuration)
* [API Documentation](#api-documentation)
* [Running the Backend](#running-the-backend)
* [Running Tests](#running-tests)
* [Test Database](#test-database)
* [Dependency Management](#dependency-management)
* [Security](#security)
* [Error Handling](#error-handling)
* [Development Workflow](#development-workflow)
* [Current Backend Status](#current-backend-status)
* [Future Improvements](#future-improvements)
* [Author](#author)

---

# Overview

AI Support Hub is designed as a multi-tenant customer support platform.

The backend exposes REST APIs that allow authenticated users to:

* Register and authenticate accounts
* Access their authenticated profile
* Create and manage organizations
* Belong to multiple organizations
* Manage organization members
* Assign organization roles
* Manage customers
* Create and manage support conversations
* Assign conversations to agents
* Change conversation priority
* Update conversation status
* Send and retrieve support messages
* Enforce organization-level access control

The system is structured so that users belonging to one organization cannot access resources belonging to another organization without the appropriate membership.

The backend is built as an independent API service and is intended to be consumed by a frontend application such as a Next.js web application.

---

# Key Features

## Authentication

* User registration
* Secure password hashing
* User login
* JWT access tokens
* Authenticated user retrieval
* Active-user validation
* Invalid credential protection
* Duplicate email protection

## Authorization

* Organization-based access control
* Organization membership validation
* Role-based permissions
* Owner, admin, agent, and member roles
* Owner protection
* Organization-scoped resource access

## Organization Management

* Create organizations
* Generate URL-friendly organization slugs
* Automatically generate unique slugs
* Retrieve organizations
* Retrieve organizations belonging to a user
* Update organization details
* Activate/deactivate organizations
* Delete organizations
* Add organization members
* Update member roles
* Remove members
* Protect organization owners from removal/demotion

## Customer Management

* Create customers
* Retrieve customers
* Update customers
* Delete customers
* Associate customers with support conversations
* Preserve conversations when customers are deleted

## Conversation Management

* Create conversations
* Retrieve conversations
* List organization conversations
* Assign conversations to agents
* Update conversation priority
* Update conversation status
* Track resolution timestamps
* Track closure timestamps

## Messaging

* Create messages
* Retrieve conversation messages
* Associate messages with conversations
* Associate messages with users/agents
* Enforce organization-level access

## Testing

* Pytest test suite
* Dedicated test database
* Automatic test database cleanup
* Authentication tests
* Authorization tests
* API endpoint tests
* Database isolation from development data

---

# Technology Stack

| Technology        | Purpose                          |
| ----------------- | -------------------------------- |
| Python 3.12       | Backend programming language     |
| FastAPI           | REST API framework               |
| Uvicorn           | ASGI application server          |
| PostgreSQL        | Relational database              |
| SQLAlchemy        | ORM and database interaction     |
| Alembic           | Database migrations              |
| Pydantic          | Request/response validation      |
| Pydantic Settings | Environment configuration        |
| python-jose       | JWT handling                     |
| pwdlib            | Secure password hashing          |
| Pytest            | Automated testing                |
| HTTPX / HTTPX2    | HTTP testing/client support      |
| Starlette         | FastAPI underlying web framework |

---

# Architecture

The backend follows a layered architecture that separates responsibilities between API routing, business logic, data models, configuration, authentication, and database access.

```text
Client / Frontend
       |
       v
    FastAPI
       |
       +----------------------+
       |                      |
       v                      v
     Routers              Dependencies
       |                      |
       v                      v
   Services             Authentication
       |                 Authorization
       |
       v
     Models
       |
       v
   SQLAlchemy
       |
       v
 PostgreSQL
```

## Architectural Layers

### API Layer

Responsible for:

* HTTP routes
* Request validation
* Response serialization
* HTTP status codes
* Dependency injection
* Authentication dependencies

Located primarily under:

```text
app/api/
```

### Service Layer

Responsible for:

* Business logic
* Database operations
* Organization management
* Membership management
* Conversation operations
* Authentication logic

Located under:

```text
app/services/
```

### Model Layer

Responsible for:

* Database table definitions
* Relationships
* Constraints
* Enumerations
* SQLAlchemy mappings

Located under:

```text
app/models/
```

### Schema Layer

Responsible for:

* Request validation
* Response serialization
* API contracts
* Pydantic models

Located under:

```text
app/schemas/
```

### Security Layer

Responsible for:

* Password hashing
* Password verification
* JWT creation
* JWT decoding
* Authenticated-user dependencies
* Authorization support

Located under:

```text
app/core/security/
```

### Database Layer

Responsible for:

* SQLAlchemy engine
* Sessions
* Declarative base
* Database dependencies

Located under:

```text
app/database/
```

---

# Project Structure

The backend currently follows this structure:

```text
backend/
│
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── organizations.py
│   │   │   ├── customers.py
│   │   │   ├── conversations.py
│   │   │   └── messages.py
│   │   │
│   │   └── ...
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── enums/
│   │   │   ├── roles.py
│   │   │   └── conversation.py
│   │   │
│   │   └── security/
│   │       ├── auth.py
│   │       ├── dependencies.py
│   │       └── ...
│   │
│   ├── database/
│   │   ├── base.py
│   │   └── session.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── organization.py
│   │   ├── organization_member.py
│   │   ├── customer.py
│   │   ├── conversation.py
│   │   └── message.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── organization.py
│   │   ├── customer.py
│   │   ├── conversation.py
│   │   └── message.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── organization_service.py
│   │   ├── customer_service.py
│   │   ├── conversation_service.py
│   │   └── message_service.py
│   │
│   └── main.py
│
├── migrations/
│   ├── versions/
│   ├── env.py
│   └── script.py.mako
│
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_organizations.py
│   ├── test_customers.py
│   ├── test_conversations.py
│   └── test_messages.py
│
├── .env
├── .env.example
├── .gitignore
├── alembic.ini
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

> The exact file list may evolve as additional features are added.

---

# Core Domain Model

The backend is centered around several core entities.

```text
User
 │
 ├──────────────┐
 │              │
 ▼              ▼
Organization   OrganizationMember
 │              │
 │              └── Role
 │
 ├─────────────── Customers
 │
 └─────────────── Conversations
                       │
                       └── Messages
```

## User

Represents an authenticated account.

Important fields include:

* `id`
* `email`
* `hashed_password`
* `full_name`
* `is_active`
* `created_at`
* `updated_at`

Passwords are never stored in plaintext.

---

## Organization

Represents a tenant/workspace in the support system.

Important fields include:

* `id`
* `name`
* `slug`
* `is_active`
* `created_at`
* `updated_at`

Each organization has its own members, customers, conversations, and messages.

---

## Organization Member

Connects users to organizations.

Important fields include:

* `id`
* `organization_id`
* `user_id`
* `role`
* `created_at`

A unique constraint prevents the same user from being added to the same organization more than once.

---

## Customer

Represents an external customer receiving support.

Customers are associated with organizations and can have conversations.

---

## Conversation

Represents a support interaction between the organization and a customer.

Conversations contain information such as:

* Organization
* Customer
* Subject
* Assigned agent
* Priority
* Status
* Resolution timestamp
* Closure timestamp
* Creation timestamp

---

## Message

Represents an individual message inside a conversation.

Messages are associated with:

* Conversation
* Sender/user
* Sender type
* Message content
* Creation timestamp

---

# Authentication

Authentication is implemented using JWT access tokens.

## Registration Flow

```text
Client
  |
  | POST /auth/register
  v
FastAPI
  |
  +--> Validate request
  |
  +--> Check existing email
  |
  +--> Hash password
  |
  +--> Create User
  |
  +--> Create Organization
  |
  +--> Create Owner Membership
  |
  v
Database
  |
  v
Registration Response
```

When a user registers:

1. The email is checked for an existing account.
2. The password is securely hashed.
3. A user is created.
4. An organization is created.
5. The registering user is added as the organization owner.
6. The transaction is committed.
7. The created resources are returned.

---

# Password Security

Passwords are never stored directly.

The backend uses `pwdlib` for password hashing and verification.

The authentication flow is:

```text
Plain Password
      |
      v
Password Hashing
      |
      v
Stored Hash
```

During login:

```text
Submitted Password
       |
       v
Verify Against Hash
       |
       +---- invalid ---> Authentication failure
       |
       v
Valid
       |
       v
Create JWT
```

---

# JWT Authentication

After successful authentication, the backend creates a JWT access token.

The token is used by authenticated API requests.

Typical authorization header:

```http
Authorization: Bearer <access_token>
```

The backend decodes and validates the token before allowing access to protected resources.

---

# Authorization and Roles

The organization role system contains four roles:

```text
OWNER
ADMIN
AGENT
MEMBER
```

The database stores the corresponding lowercase enum values:

```text
owner
admin
agent
member
```

## Owner

The owner has the highest organization-level privileges.

The owner can:

* Manage the organization
* Manage members
* Change member roles
* Remove members
* Delete the organization

The owner cannot be removed or demoted through normal member management.

---

## Admin

Administrators can perform organization-management operations allowed by the authorization rules.

They can manage members and organization resources without having owner-level destructive privileges.

---

## Agent

Agents are support staff responsible primarily for handling customer conversations and messages.

---

## Member

Members have basic organization access according to the permissions provided by the API.

---

# Organization Access Control

Every organization-scoped operation verifies membership.

Conceptually:

```text
Authenticated User
        |
        v
Organization ID
        |
        v
Check Membership
        |
    +---+---+
    |       |
    v       v
 Member   Not Member
    |       |
    v       v
 Allow    403 Forbidden
```

This prevents users from accessing resources belonging to organizations they do not belong to.

---

# Organizations

The organization service supports:

### Create

Creates an organization and generates a URL-friendly slug.

For example:

```text
Acme Support Team
```

becomes:

```text
acme-support-team
```

If the slug already exists, a suffix is added:

```text
acme-support-team
acme-support-team-2
acme-support-team-3
```

### Retrieve

Organizations can be retrieved by ID and users can retrieve organizations they belong to.

### Update

Organizations support updating:

* Name
* Active status

Changing the organization name regenerates the organization slug.

### Delete

Deleting an organization removes its organization memberships through database cascading.

---

# Organization Membership Management

The backend supports:

* Adding members
* Listing members
* Updating member roles
* Removing members
* Checking current membership

A user cannot be added twice to the same organization.

The owner role cannot be assigned through ordinary member management.

The organization owner also cannot be:

* Removed
* Demoted

through normal membership operations.

---

# Customers

Customers are organization-scoped.

A customer belongs to an organization and can have support conversations.

Customer operations include:

* Create
* Retrieve
* List
* Update
* Delete

The customer relationship with conversations is designed so that deleting a customer does not unnecessarily destroy historical conversations.

Conversation customer references can be set to `NULL` when the customer is deleted.

---

# Conversations

Conversations are organization-scoped support cases.

A conversation can contain:

```text
Organization
Customer
Subject
Assigned Agent
Priority
Status
Created At
Resolved At
Closed At
```

---

# Conversation Priority

Supported priorities:

```text
LOW
MEDIUM
HIGH
URGENT
```

These allow support teams to prioritize customer requests.

---

# Conversation Status

Supported statuses:

```text
OPEN
PENDING
RESOLVED
CLOSED
```

A conversation can transition between these states through the conversation API.

When a conversation becomes:

```text
RESOLVED
```

the backend records the resolution timestamp.

When it becomes:

```text
CLOSED
```

the backend records the closure timestamp.

The timestamps use UTC-aware Python datetimes.

---

# Conversation Assignment

Conversations can be assigned to support agents.

The assigned agent is represented by the appropriate user reference.

This allows the frontend to build agent queues and support workflows.

---

# Messages

Messages belong to conversations.

A message can contain:

* Conversation ID
* Sender user ID
* Sender type
* Message content
* Creation timestamp

Messages are organization-scoped through their conversation.

This ensures that users cannot access messages from another organization simply by knowing a message or conversation ID.

---

# Database

The backend uses PostgreSQL as its primary relational database.

The development database is:

```text
ai_support_hub
```

The dedicated testing database is:

```text
ai_support_hub_test
```

The application connects to PostgreSQL using SQLAlchemy.

---

# SQLAlchemy

SQLAlchemy is used as the ORM.

Models use SQLAlchemy's modern typed mapping style:

```python
Mapped[T]
mapped_column(...)
```

The project also uses:

* Foreign keys
* Unique constraints
* Database indexes
* PostgreSQL enums
* Cascading deletes
* Nullable foreign keys where appropriate

---

# Database Relationships

The major relationships are:

```text
User
 |
 +---- OrganizationMember
              |
              +---- Organization

Organization
 |
 +---- Customers
 |
 +---- Conversations
              |
              +---- Messages
```

Foreign-key behavior is used to preserve referential integrity.

Examples include:

```text
Organization -> Members
ON DELETE CASCADE
```

and:

```text
User -> Organization Membership
ON DELETE CASCADE
```

Message sender references can be nullable so historical messages can remain available even if the associated user is removed.

---

# Database Migrations

Alembic is used for database schema migrations.

The migration directory is:

```text
migrations/
```

## Check Current Migration

```bash
alembic current
```

## Check Migration History

```bash
alembic history
```

## Upgrade Database

```bash
alembic upgrade head
```

## Create a Migration

```bash
alembic revision --autogenerate -m "describe change"
```

Always review autogenerated migrations before applying them.

---

# Environment Configuration

Sensitive configuration is stored in `.env`.

The `.env` file is intentionally ignored by Git.

Example configuration:

```env
APP_NAME=AI Support Hub
APP_VERSION=0.1.0
DEBUG=True

DATABASE_URL=postgresql+psycopg://ai_support_user:password@localhost:5432/ai_support_hub

TEST_DATABASE_URL=postgresql+psycopg://ai_support_user:password@localhost:5432/ai_support_hub_test

SECRET_KEY=change-this-in-production

ACCESS_TOKEN_EXPIRE_MINUTES=60

ALGORITHM=HS256

CORS_ORIGINS=http://localhost:3000
```

The real `.env` file must never be committed to Git.

The repository contains `.env.example` as a safe template.

---

# Environment Settings

Application settings are loaded using Pydantic Settings.

The configuration includes:

* Application name
* Application version
* Debug mode
* Database URL
* Test database URL
* JWT secret key
* JWT expiration
* JWT algorithm
* CORS origins

The application reads configuration from environment variables and `.env`.

---

# API Documentation

FastAPI automatically provides interactive API documentation.

After starting the server, visit:

```text
http://127.0.0.1:8000/docs
```

This provides Swagger UI.

Alternative documentation:

```text
http://127.0.0.1:8000/redoc
```

OpenAPI schema:

```text
http://127.0.0.1:8000/openapi.json
```

---

# Running the Backend

## 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-support-hub/backend
```

---

## 2. Create a Virtual Environment

```bash
python3 -m venv venv
```

Activate it:

```bash
source venv/bin/activate
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then update `.env` with the appropriate PostgreSQL credentials and secret key.

---

## 5. Apply Database Migrations

```bash
alembic upgrade head
```

---

## 6. Start the Development Server

```bash
uvicorn app.main:app --reload
```

The API will normally be available at:

```text
http://127.0.0.1:8000
```

---

# Health Check

The backend provides a health endpoint.

Example:

```http
GET /health
```

A successful response indicates that the application is running.

The root endpoint is also available:

```http
GET /
```

---

# Running Tests

The project uses Pytest.

Run the complete test suite:

```bash
python -m pytest -q
```

For verbose output:

```bash
python -m pytest -vv
```

For a specific test file:

```bash
python -m pytest tests/test_auth.py -vv
```

---

# Test Database

Tests use a dedicated PostgreSQL database:

```text
ai_support_hub_test
```

This prevents automated tests from modifying development data.

The test database is configured using:

```env
TEST_DATABASE_URL=...
```

The test configuration uses the test database session instead of the normal application database.

---

# Automatic Test Database Cleanup

The Pytest configuration automatically resets test data at the beginning of each test session.

The schema is preserved while test records are removed.

Tables are truncated using:

```sql
TRUNCATE TABLE
    organization_members,
    conversations,
    customers,
    messages,
    organizations,
    users
RESTART IDENTITY CASCADE
```

This provides predictable test execution without requiring manual database cleanup between test runs.

---

# Test Coverage

The current automated test suite covers important backend functionality including:

## Authentication

* Registration
* Login
* Duplicate registration
* Invalid passwords
* Unknown users
* Protected endpoints
* Authenticated user retrieval

## Organizations

* Organization creation
* Organization access
* Membership operations
* Role restrictions
* Owner protection

## Customers

* Customer creation
* Customer retrieval
* Organization access restrictions
* Customer deletion behavior

## Conversations

* Conversation creation
* Conversation retrieval
* Organization filtering
* Agent assignment
* Priority changes
* Status changes

## Messages

* Message creation
* Message retrieval
* Organization authorization
* Sender handling

The current test suite successfully passes:

```text
16 passed
```

with:

```text
0 warnings
```

---

# Dependency Management

Dependencies are pinned in:

```text
requirements.txt
```

This improves reproducibility between development and deployment environments.

The project currently uses the modern HTTP testing dependency required by the installed Starlette/FastAPI environment.

The test suite currently completes without the previous Starlette HTTPX deprecation warning.

---

# Security

Security considerations implemented in the backend include:

## Password Hashing

Passwords are hashed before storage.

Plaintext passwords are never persisted.

## JWT Authentication

Protected endpoints require valid authentication tokens.

## Active User Validation

Inactive users cannot authenticate successfully.

## Organization Isolation

Organization-scoped resources verify the authenticated user's membership.

## Role Restrictions

Sensitive organization operations are restricted according to organization roles.

## Owner Protection

The organization owner cannot be removed or demoted through ordinary membership management.

## Environment Secrets

Secrets such as:

* Database passwords
* JWT secret keys

are stored in `.env` and excluded from Git.

---

# Error Handling

The API uses FastAPI `HTTPException` responses with appropriate HTTP status codes.

Common responses include:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
```

Examples:

### Unauthorized

```json
{
  "detail": "Not authenticated"
}
```

### Forbidden

```json
{
  "detail": "You do not have access to this organization."
}
```

### Not Found

```json
{
  "detail": "Organization not found."
}
```

### Conflict

```json
{
  "detail": "A user with this email already exists."
}
```

---

# UTC Date and Time Handling

The backend uses timezone-aware UTC datetimes.

The preferred pattern is:

```python
from datetime import UTC, datetime

datetime.now(UTC)
```

This is used for model timestamps such as:

```text
created_at
updated_at
resolved_at
closed_at
```

This avoids the deprecated `datetime.utcnow()` pattern and provides explicit UTC-aware timestamps.

---

# Development Workflow

The project follows an incremental development workflow.

## 1. Create a feature

Implement the required models, schemas, services, routes, and tests.

## 2. Run the test suite

```bash
python -m pytest -q
```

## 3. Check Git

```bash
git status
```

## 4. Review changes

```bash
git diff
```

## 5. Check staged changes

```bash
git diff --cached --check
```

## 6. Commit

Use descriptive conventional commit messages.

Examples:

```text
feat: add organization management
feat: add conversation messaging
fix: standardize UTC datetime handling
test: add organization authorization tests
refactor: improve authentication service
```

## 7. Push

```bash
git push origin main
```

---

# Git Safety

The repository intentionally excludes sensitive environment files.

`.gitignore` includes:

```text
.env
.env.*
!.env.example
```

Therefore:

```text
.env
```

must never be committed.

Before pushing changes, verify:

```bash
git status
```

and:

```bash
git ls-files .env
```

The second command should return no output.

---

# API Design Principles

The backend follows several principles:

### Separation of Concerns

Routes handle HTTP concerns while services handle business logic.

### Validation

Pydantic schemas validate incoming API requests.

### Database Integrity

Foreign keys and unique constraints protect data consistency.

### Organization Isolation

Organization resources are scoped to authenticated memberships.

### Explicit Permissions

Sensitive operations verify appropriate roles.

### Testability

Database access is injected through FastAPI dependencies, allowing the test suite to override the database session.

### Reproducibility

Dependencies and database migrations are version controlled.

---

# Current Backend Status

The backend has completed its initial MVP foundation.

Current status:

```text
Backend
├── FastAPI                         ✅
├── PostgreSQL                      ✅
├── SQLAlchemy                      ✅
├── Alembic                         ✅
├── Environment configuration       ✅
├── JWT authentication              ✅
├── Password hashing                ✅
├── User management                 ✅
├── Organizations                   ✅
├── Organization memberships        ✅
├── Role-based authorization        ✅
├── Customers                       ✅
├── Conversations                   ✅
├── Conversation assignment         ✅
├── Conversation priority           ✅
├── Conversation status             ✅
├── Messages                        ✅
├── Organization isolation          ✅
├── Test database                   ✅
├── Automated tests                 ✅
├── Test cleanup                    ✅
├── Dependency configuration        ✅
└── Warning-free test suite         ✅
```

Current test result:

```text
16 passed
0 warnings
```

---

# Frontend Integration

The backend is designed to be consumed by a separate frontend application.

The planned frontend stack is:

```text
Next.js
TypeScript
Tailwind CSS
```

The frontend will communicate with this FastAPI backend through REST APIs.

Conceptually:

```text
┌──────────────────────────┐
│       Next.js Frontend   │
│                          │
│  Dashboard               │
│  Organizations           │
│  Customers               │
│  Conversations           │
│  Messages                │
│  Authentication          │
└────────────┬─────────────┘
             │
             │ REST / JSON
             │
             ▼
┌──────────────────────────┐
│       FastAPI Backend    │
│                          │
│ Authentication           │
│ Authorization            │
│ Organizations            │
│ Customers                │
│ Conversations            │
│ Messages                 │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│       PostgreSQL         │
└──────────────────────────┘
```

The frontend should consume the backend's actual API contracts rather than duplicating business logic.

---

# Future Improvements

The current backend provides the foundation for the application. Potential future improvements include:

## Authentication

* Refresh tokens
* Token revocation
* Password reset
* Email verification
* Multi-factor authentication

## Organizations

* Organization invitations
* Owner transfer
* More granular permissions
* Organization settings

## Conversations

* Strict status-transition validation
* Pagination
* Search
* Filtering
* Sorting
* Conversation tags
* Internal notes
* Conversation history/audit trail

## Customers

* Customer profiles
* Customer search
* Customer filtering
* Customer activity history

## Messaging

* Real-time messaging
* WebSocket support
* Typing indicators
* Message delivery status
* Attachments

## Platform

* Structured application logging
* Audit logging
* Rate limiting
* Monitoring
* Metrics
* Production CORS configuration
* Production deployment configuration
* CI/CD improvements

## Testing

* Increased unit-test coverage
* More authorization edge cases
* Integration testing
* End-to-end testing
* Performance testing

---

# Production Considerations

Before production deployment, the following should be reviewed:

* Use a strong production `SECRET_KEY`
* Disable debug mode
* Restrict CORS origins
* Use production PostgreSQL credentials
* Configure HTTPS
* Configure secure token handling
* Add rate limiting
* Add application logging
* Add monitoring
* Review database connection pooling
* Review migration strategy
* Configure production server workers
* Add CI/CD deployment checks
* Review database timezone consistency

---

# Contributing

When contributing:

1. Create a feature branch.
2. Implement the change.
3. Add or update tests.
4. Run the full test suite.
5. Review the Git diff.
6. Verify no secrets are staged.
7. Commit using a descriptive message.
8. Push the branch.
9. Open a pull request.

Example:

```bash
git checkout -b feature/conversation-search
```

Run:

```bash
python -m pytest -q
```

Then commit:

```bash
git commit -m "feat: add conversation search"
```

---

# Author

**Christina Manga**

Software Engineer

Nairobi, Kenya

GitHub:

https://github.com/tinamanga

LinkedIn:

https://linkedin.com/in/christina-manga-aa314a370

---

# License

This project is currently a private/development project unless a separate license is added to the repository.
