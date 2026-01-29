# Enduresquad Worksheet — Connectivity Diagram

```mermaid
flowchart TD
  A[Viewer on YouTube]
  A -->|QR / Link| B[worksheet.enduresquad.com/?ep=E0X]
  B --> C[PWA (Static HTML/CSS/JS on Vercel)]
  C --> D[Episode Config JSON /episodes/E0X.json]
  C --> E[Screen 1: Quick Check-in]
  E --> F[Screen 2: Main Blocker]
  F --> G[Screen 3: Fallback Plan]
  G --> H[Save Event]
  H --> I[Supabase: worksheet_events table]
  I --> J[Views: vw_*_counts]
  J --> K[stats.html (+ ?ep=E0X filter)]
  G --> L[Thank-you Screen + Inline Stats]

  subgraph Vercel[Hosting]
    C
    D
    K
  end

  subgraph Supabase[Database]
    I
    J
  end
```
