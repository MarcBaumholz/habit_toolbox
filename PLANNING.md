# HabitLink - Planning

## Vision
A social habit-building platform with accountability groups, AI-powered discovery, and personal Lifebook guidance. Emphasis on simple daily tracking, community accountability (weekly proofs), and a high-signal insights feed via a Trust network.

## Core Features (Phase 1)
- Authentication (email/password)
- User profiles with Lifebook
- Habits: CRUD, weekly tracker, streaks, 66-day progress
- Groups: discover, join, create; weekly proofs; chat; learnings
- Global learnings feed
- Summary page with weekly stats and trusted insights
- Toolbox: browse, view, add techniques

## Architecture
- Frontend: Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui
- Backend: FastAPI (Python), PostgreSQL via SQLModel, Redis for sessions/queues
- Realtime: WebSockets (FastAPI) or Pusher-compatible service
- AI: OpenAI/Groq model abstraction; server-side tool suggestions
- Storage: S3-compatible (e.g., Cloudflare R2) for images (proofs, avatars)
- Auth: JWT (access+refresh) with email/password; optional OAuth later
- Infra: Docker Compose for local; future: Fly.io/Render/Railway

## Data Model (initial)
- users(id, email, password_hash, display_name, photo_url, lifebook: JSON, created_at)
- trusts(truster_id, trustee_id, created_at)
- habits(id, user_id, title, why, identity_goal, loop JSON, minimal_dose, impl_intentions, reminders JSON, created_at)
- habit_logs(id, habit_id, date, completed: bool, created_at)
- groups(id, name, is_public, owner_id, created_at)
- group_members(group_id, user_id, role, created_at)
- proofs(id, group_id, user_id, date, image_url, created_at)
- messages(id, group_id, user_id, content, type: ['chat','learning'], created_at, likes_count)
- message_reactions(id, message_id, user_id, created_at)
- tools(id, title, keywords[], steps[], description, created_at, author_id)

## API (high-level)
- Auth: register, login, refresh, me, update_profile
- Habits: CRUD, weekly tracker, mark complete, stats
- Groups: list/discover, my, create, join/leave, details
- Proofs: upload, list weekly
- Chat: ws connect, send message, list
- Learnings: list global, like
- Toolbox: list, create, detail

## Non-Functional
- Files < 500 lines; split into modules
- Type hints, PEP8, black
- Pydantic v2 models
- Unit tests with pytest
- Rate limiting and input validation
- Observability: structured logging

## Milestones
1. Scaffolding + Auth + Health
2. Users+Lifebook
3. Habits + Weekly tracker
4. Groups + Membership
5. Proofs upload + Weekly board
6. Chat + Learnings (+ trust + likes)
7. Toolbox + AI tool finder
8. Summary page
9. Polish, tests, docs, docker
