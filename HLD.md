# High-Level Design (HLD)

## Overview
Enduresquad Worksheet is a single-page mobile-first PWA that loads per-episode content via JSON configs and logs anonymous events to Supabase. A public stats page summarizes aggregate outcomes.

## Architecture
- **Frontend**: Static HTML/CSS/JS
- **Hosting**: Vercel (static)
- **Data**: Supabase Postgres
- **Analytics**: Supabase table `worksheet_events`

## Key Flows
1) User opens `/?ep=E0X`
2) App fetches `/episodes/E0X.json`
3) User completes 3-step worksheet
4) Events are saved to Supabase
5) After save, a summary is shown

## Episode Configs
- Stored in `public/episodes/`
- Each file defines screen copy and options
- Episode 1 is `mode: info` (no worksheet)

## Data Model
Table: `worksheet_events`
- id (identity)
- inserted_at (timestamp)
- name (text)
- payload (jsonb)

Event names:
- `reality_check`
- `friction_selected`
- `fallback_plan`

Payload fields (all anonymous):
- `days`
- `friction`
- `action`
- `anchor`
- `episode_id`

## Supabase Views (for stats)
```
-- Days summary
create view vw_days_counts as
select payload->>'episode_id' as episode_id,
       payload->>'days' as days,
       count(*) as total
from worksheet_events
where name = 'reality_check'
group by episode_id, days;

-- Blocker summary
create view vw_friction_counts as
select payload->>'episode_id' as episode_id,
       payload->>'friction' as friction,
       count(*) as total
from worksheet_events
where name = 'friction_selected'
group by episode_id, friction;

-- Action summary
create view vw_action_counts as
select payload->>'episode_id' as episode_id,
       payload->>'action' as action,
       count(*) as total
from worksheet_events
where name = 'fallback_plan'
group by episode_id, action;

-- Time anchor summary
create view vw_anchor_counts as
select payload->>'episode_id' as episode_id,
       payload->>'anchor' as anchor,
       count(*) as total
from worksheet_events
where name = 'fallback_plan'
group by episode_id, anchor;
```

## Public Stats
- `stats.html` pulls from the views above
- Use `?ep=E0X` to filter

## Deployment
- Code is pushed to GitHub
- Vercel deploys from `main`
- Domain: `worksheet.enduresquad.com`
