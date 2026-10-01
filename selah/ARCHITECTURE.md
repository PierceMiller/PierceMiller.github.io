# Selah Architecture

## Purpose

Selah is a Bible-learning web application built around a repeatable study loop:

**Read → Observe → Context → Interpret → Connect → Respond → Remember → Review**

The application should help people understand Scripture without replacing the work of reading and reasoning for themselves.

## Current deployment model

- Frontend: static HTML/CSS/JavaScript
- Hosting: GitHub Pages
- Current Selah path: `/selah/`
- Repository: `PierceMiller/PierceMiller.github.io`
- Branch: `master`
- Bible text: World English Bible (WEB) data loaded lazily by book
- Current browser persistence: `localStorage`

The frontend must remain deployable as a static site.

## Target architecture

```
                         ┌─────────────────────┐
                         │    GitHub Pages     │
                         │  Selah Frontend     │
                         └──────────┬──────────┘
                                    │
                         HTTPS / Supabase JS
                                    │
                         ┌──────────▼──────────┐
                         │   Supabase Auth     │
                         │                     │
                         │ Sign up / Login     │
                         │ Sessions            │
                         │ Password reset      │
                         │ Email verification  │
                         └──────────┬──────────┘
                                    │ auth.uid()
                                    │
                         ┌──────────▼──────────┐
                         │ Supabase Postgres   │
                         │ + Row Level Security│
                         └──────────┬──────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
        User profile          Bible study data       Review data
             │                      │                      │
             ├─ preferences         ├─ notes              ├─ review items
             ├─ display name        ├─ highlights         ├─ review history
             └─ created_at          ├─ studies            └─ scheduling
                                    ├─ answers
                                    ├─ bookmarks
                                    └─ reading progress
```

## Authentication

Supabase Auth is the authentication boundary.

Initial implementation:

1. Email/password sign-up
2. Email verification
3. Login
4. Logout
5. Password reset
6. Persistent browser session
7. Auth state listener
8. Account/profile menu

Future:

- Google OAuth
- Apple OAuth
- Passkeys if appropriate
- Optional anonymous/local-only mode

Never put a Supabase secret/service-role key in the frontend.

The GitHub Pages application may contain only the Supabase project URL and browser-safe publishable/anon key.

## Database model

### profiles

One row per authenticated user.

Fields:

- `id` UUID — references `auth.users.id`
- `display_name`
- `avatar_url`
- `created_at`
- `updated_at`

### user_notes

Verse or passage notes.

Fields:

- `id` UUID
- `user_id` UUID
- `book_osis`
- `chapter`
- `verse`
- `note`
- `created_at`
- `updated_at`

Recommended uniqueness:

`user_id + book_osis + chapter + verse`

### user_highlights

Verse highlighting/bookmark state.

Fields:

- `id`
- `user_id`
- `book_osis`
- `chapter`
- `verse`
- `highlight_style`
- `created_at`
- `updated_at`

### saved_passages

User-selected passages.

Fields:

- `id`
- `user_id`
- `book_osis`
- `chapter`
- `start_verse`
- `end_verse`
- `title`
- `created_at`
- `updated_at`

### studies

A study session attached to a passage.

Fields:

- `id`
- `user_id`
- `book_osis`
- `chapter`
- `start_verse`
- `end_verse`
- `title`
- `status`
- `current_step`
- `created_at`
- `updated_at`
- `completed_at`

Status values should be constrained to:

- `in_progress`
- `completed`
- `archived`

### study_answers

Answers for the six Selah stages.

Fields:

- `id`
- `study_id`
- `user_id`
- `step`
- `answer`
- `created_at`
- `updated_at`

Steps:

1. Observe
2. Context
3. Interpret
4. Connect
5. Respond
6. Remember

Recommended uniqueness:

`study_id + step`

### review_items

Spaced retrieval prompts generated from completed studies.

Fields:

- `id`
- `user_id`
- `study_id`
- `prompt`
- `answer_reference`
- `next_review_at`
- `interval_days`
- `review_count`
- `last_reviewed_at`
- `created_at`

### review_history

Records completed retrieval attempts.

Fields:

- `id`
- `review_item_id`
- `user_id`
- `response`
- `reviewed_at`
- `result`

Do not store unnecessary personal information.

### reading_progress

Tracks Bible reading progress.

Fields:

- `id`
- `user_id`
- `book_osis`
- `chapter`
- `completed`
- `last_read_at`

Recommended uniqueness:

`user_id + book_osis + chapter`

## Security model

Every user-owned table must have Row Level Security enabled.

The fundamental rule is:

```
auth.uid() = user_id
```

Users may:

- SELECT their own records
- INSERT records for their own user ID
- UPDATE their own records
- DELETE their own records

Users must never be able to query another user's private data.

The `profiles.id` column should correspond to `auth.users.id`.

The frontend must never trust a client-supplied user ID as an authorization mechanism. PostgreSQL RLS is the security boundary.

## Frontend data layer

Selah should eventually separate UI from persistence.

Recommended structure:

```
UI
 │
 ▼
Selah state
 │
 ├──────── Local cache
 │
 └──────── Supabase data layer
```

The data layer should expose functions such as:

- `getCurrentUser()`
- `saveNote()`
- `deleteNote()`
- `saveHighlight()`
- `saveStudy()`
- `saveStudyAnswer()`
- `completeStudy()`
- `getReviewsDue()`
- `completeReview()`
- `saveReadingProgress()`

The UI should not contain raw SQL or duplicate database logic.

## Local-first migration

Existing Selah data currently lives in localStorage.

Migration strategy:

1. User logs in.
2. Selah checks for existing local data.
3. If local data exists, show an import prompt.
4. Convert local records into the database schema.
5. Preserve timestamps where possible.
6. Mark migration as completed.
7. Continue using cloud storage for authenticated users.

Example:

```
localStorage
   │
   ▼
Migration layer
   │
   ▼
Supabase
```

Do not silently overwrite cloud data.

If local and cloud records conflict, prefer an explicit user choice or deterministic latest-update handling.

## Offline / resilience strategy

The app should continue to function when temporarily offline.

For authenticated users:

- Read Bible text from the existing Bible data source/cache.
- Cache unsent notes/study changes locally.
- Queue writes while offline.
- Synchronize when the connection returns.
- Never discard unsynchronized user work.

This should be implemented after the basic account system is stable.

## Bible text architecture

Bible text is content, not user data.

Keep it separate from the user database.

Current model:

```
Selah
 │
 └── Bible reader
       │
       └── WEB book JSON
```

Future improvement:

- Vendor stable Bible datasets where licensing permits.
- Add translation metadata.
- Support multiple translations through a common Bible-data interface.
- Keep translation-specific licensing information explicit.

## Study architecture

A study must be passage-driven rather than hard-coded to the three original examples.

```
Bible selection
      │
      ▼
Passage object
      │
      ├── book
      ├── chapter
      ├── start verse
      ├── end verse
      └── text
      │
      ▼
Six-stage Selah study
      │
      ├── Observe
      ├── Context
      ├── Interpret
      ├── Connect
      ├── Respond
      └── Remember
      │
      ▼
Completed study
      │
      ▼
Review schedule
```

## Context and cross-reference layer

Context should distinguish:

- Direct observations
- Historical/contextual information
- Literary context
- Cross-references
- Interpretive options
- Application

Interpretive disagreements should be represented as disagreements where relevant, rather than presented as settled fact.

Future context records may include:

- Book overview
- Authorship information with appropriate uncertainty
- Original audience
- Date/setting where evidence supports it
- Genre
- Literary structure
- Immediate context
- Canonical context
- Source-linked historical notes

Cross-references should explain why a reference is relevant instead of simply displaying a list of verse numbers.

## Future AI tutor

AI is an optional layer, not the foundation of Selah.

Preferred flow:

1. Ask the user a question.
2. Let the user observe and reason.
3. Ask for their interpretation.
4. Identify evidence.
5. Provide additional context only when useful.
6. Distinguish text, evidence, inference, and interpretation.
7. Cite sources where external information is used.
8. Present genuine interpretive disagreement transparently.

AI should not pretend to be an authoritative voice of God or Scripture.

## Account UX

Unauthenticated users should still be able to use Selah.

Suggested states:

### Logged out

- Full Bible reader
- Guided studies
- Local notes/progress
- Sign in / Create account prompts

### Logged in

- Cloud synchronization
- Personal dashboard
- Saved studies
- Notes
- Highlights
- Review queue
- Reading progress
- Cross-device continuity

This avoids making account creation an unnecessary barrier to first use.

## Dashboard

The eventual Today page should be personalized:

- Continue current study
- Reviews due today
- Recently studied passages
- Recent notes
- Reading progress
- Suggested next study
- Current reading plan

Avoid turning the dashboard into a social-media-style engagement feed.

## Future group features

The architecture should leave room for:

- Teacher-led studies
- Shared study plans
- Church/group spaces
- Assignments
- Group discussion
- Teacher feedback

These should use separate group-level authorization rather than weakening the user-private RLS model.

## Environment/configuration

The static site should not contain secrets.

Expected browser configuration:

```
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
```

For the first GitHub Pages implementation, these can be configured in the frontend because the publishable/anon key is intended for public client applications.

Never commit:

- Database passwords
- Service-role keys
- Secret API keys
- SMTP credentials
- Admin credentials

## Recommended implementation phases

### Phase 1 — Accounts

- Create Supabase project
- Configure Auth
- Create profiles table
- Add RLS
- Add login/signup UI
- Add session handling

### Phase 2 — Cloud persistence

- Notes
- Highlights
- Saved passages
- Studies
- Study answers
- Reviews
- Reading progress

### Phase 3 — Migration

- Detect localStorage data
- Import existing user data
- Handle conflicts safely

### Phase 4 — Personal dashboard

- Continue study
- Reviews due
- Recent studies
- Notes
- Reading progress

### Phase 5 — Learning system

- Spaced retrieval scheduling
- Better review prompts
- Book context
- Cross-references
- Source-linked historical context

### Phase 6 — Advanced features

- OAuth
- Offline synchronization
- Reading plans
- Groups/teachers
- Optional AI tutor
- Accessibility improvements

## Design principles

1. **Text before opinion.**
2. **Observation before interpretation.**
3. **Context before application.**
4. **Evidence before confidence.**
5. **Questions before answers.**
6. **Retrieval before recognition.**
7. **Private data stays private.**
8. **Users can use Selah without an account.**
9. **AI assists learning rather than replacing it.**
10. **Every feature should make Scripture easier to understand, not merely make the app more impressive.**

## Current implementation status

- [x] Static Selah site
- [x] Six-stage study method
- [x] Full Bible reader
- [x] Bible-wide search
- [x] Verse selection
- [x] Verse notes
- [x] Context guide
- [x] Study handoff
- [x] Arbitrary selected verses can create a study
- [x] Local review system
- [ ] Supabase project
- [ ] Authentication
- [ ] Database/RLS
- [ ] Cloud persistence
- [ ] Local data migration
- [ ] Cross-device synchronization
- [ ] Spaced review scheduling
- [ ] Cross-reference system
- [ ] Source-linked context system
- [ ] Optional AI tutor
- [ ] Group/teacher mode

## Important implementation note

The Supabase project itself must be created inside the owner's Supabase account. Once the project URL and browser-safe publishable key are available, the Selah frontend can be connected without exposing privileged credentials.

The architecture intentionally keeps GitHub Pages as the frontend host and Supabase as the authentication/database backend. This means Selah can remain a low-maintenance static deployment while gaining persistent accounts and cloud data.
