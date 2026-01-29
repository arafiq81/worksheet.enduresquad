const worksheetConfig = {
  analytics: {
    enabled: true,
    supabaseUrl: "https://crtgcqnwmdksgphtvfzo.supabase.co",
    supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNydGdjcW53bWRrc2dwaHR2ZnpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MTYyOTksImV4cCI6MjA4NTE5MjI5OX0.7KOrUK9BZNj7pf9v3J7oI1PDyu0y_R9Rk32puGHtyP8"
  },
  screen1: {
    title: "Quick check-in",
    prompt:
      "In the last 7 days, how many days did you do the routine you intended?",
    helper: "Approximate is fine.",
  },
  screen2: {
    title: "Main blocker",
    prompt: "What got in the way most often?",
  },
  screen3: {
    title: "Your fallback plan",
    prompt: "Edit this to fit your week.",
    actions: [
      { value: "7_min_floor", label: "do a 7-minute floor routine" },
      { value: "10_min_walk", label: "take a 10-minute walk" },
      { value: "5_min_mobility", label: "do a 5-minute mobility set" },
      { value: "1_set_core", label: "do one set of core movements" },
    ],
    anchors: [
      { value: "after_dinner", label: "immediately after dinner" },
      { value: "before_bed", label: "before bed" },
      { value: "morning", label: "right after I wake up" },
      { value: "lunch_break", label: "during my lunch break" },
    ],
  },
};
