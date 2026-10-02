# AI Support Hub

AI Support Hub is a multi-tenant AI assistant platform that allows
businesses and organizations to create, customize, and deploy AI
assistants on their websites.

## Core Features

- Multi-tenant organizations
- AI assistant management
- Knowledge bases
- RAG-powered responses
- Website chatbot widget
- Human support escalation
- Ticket management
- Lead collection
- Analytics
- Integrations
- API access

## Technology Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic

### AI
- LLM
- Embeddings
- RAG
- pgvector

### Infrastructure
- Docker
- Redis
- Nginx
- GitHub Actions

## application architecture
                    AI SUPPORT HUB
                          │
             ┌────────────┴────────────┐
             │                         │
       Public Website             Authenticated App
             │                         │
       ┌─────┴─────┐             ┌─────┴─────┐
       │           │             │           │
   AI Chatbot   Login/Register  Dashboard  Workspace
       │                         │
   No account                  Role-based
   required                    navigation
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
              Owner            Admin            Agent
                │                │                │
          Organization       Management       Conversations
          settings            members         customers
          billing             settings        assigned work
                │
             Member
                │
          Personal/workspace
          access only