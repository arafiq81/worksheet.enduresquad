function formatPercent(count, total) {
  if (!total) return "0%";
  return `${Math.round((count / total) * 100)}%`;
}

function pickTop(rows, field) {
  if (!rows || !rows.length) return null;
  const sorted = [...rows].sort((a, b) => Number(b.total || 0) - Number(a.total || 0));
  const top = sorted[0];
  return { label: top[field] || "(unknown)", total: Number(top.total || 0) };
}

function renderSummary(container, text) {
  if (!container) return;
  container.innerHTML = text ? `<p class="summary__line">${text}</p>` : "<p class=\"helper\">No data yet.</p>";
}

async function loadStats(targets = {}) {
  const baseConfig = window.baseConfig || window.worksheetConfig;
  if (!baseConfig || !baseConfig.analytics || !baseConfig.analytics.enabled) {
    return;
  }
  const supabaseUrl = baseConfig.analytics.supabaseUrl;
  const supabaseKey = baseConfig.analytics.supabaseAnonKey;
  if (!supabaseUrl || !supabaseKey) {
    return;
  }
  const client = window.supabase.createClient(supabaseUrl, supabaseKey);

  const params = new URLSearchParams(window.location.search);
  const episodeId = params.get("ep");

  const applyEpisodeFilter = (query) => {
    if (episodeId) {
      return query.eq("episode_id", episodeId);
    }
    return query;
  };

  const [
    { data: daysRows, error: daysError },
    { data: frictionRows, error: frictionError },
    { data: actionRows, error: actionError },
    { data: anchorRows, error: anchorError },
  ] = await Promise.all([
    applyEpisodeFilter(client.from("vw_days_counts").select("days,total")).order("days", { ascending: true }),
    applyEpisodeFilter(client.from("vw_friction_counts").select("friction,total")).order("total", { ascending: false }),
    applyEpisodeFilter(client.from("vw_action_counts").select("action,total")).order("total", { ascending: false }),
    applyEpisodeFilter(client.from("vw_anchor_counts").select("anchor,total")).order("total", { ascending: false }),
  ]);

  const anyError = daysError || frictionError || actionError || anchorError;
  if (anyError) {
    console.error(anyError);
  }

  const daysTotal = (daysRows || []).reduce((sum, row) => sum + Number(row.total || 0), 0);
  const frictionTotal = (frictionRows || []).reduce((sum, row) => sum + Number(row.total || 0), 0);
  const actionTotal = (actionRows || []).reduce((sum, row) => sum + Number(row.total || 0), 0);
  const anchorTotal = (anchorRows || []).reduce((sum, row) => sum + Number(row.total || 0), 0);

  const topDays = pickTop(daysRows, "days");
  const topFriction = pickTop(frictionRows, "friction");
  const topAction = pickTop(actionRows, "action");
  const topAnchor = pickTop(anchorRows, "anchor");

  renderSummary(
    targets.days || document.getElementById("daysSummary"),
    topDays ? `${formatPercent(topDays.total, daysTotal)} chose ${topDays.label} days.` : ""
  );
  renderSummary(
    targets.friction || document.getElementById("frictionSummary"),
    topFriction ? `${formatPercent(topFriction.total, frictionTotal)} share the same blocker: ${topFriction.label}.` : ""
  );
  renderSummary(
    targets.action || document.getElementById("actionSummary"),
    topAction ? `${formatPercent(topAction.total, actionTotal)} picked: ${topAction.label}.` : ""
  );
  renderSummary(
    targets.anchor || document.getElementById("anchorSummary"),
    topAnchor ? `${formatPercent(topAnchor.total, anchorTotal)} anchor it ${topAnchor.label}.` : ""
  );
}

window.addEventListener("load", () => {
  loadStats();
});

window.renderInlineStats = () => {
  loadStats({
    days: document.getElementById("inlineDaysSummary"),
    friction: document.getElementById("inlineFrictionSummary"),
    action: document.getElementById("inlineActionSummary"),
    anchor: document.getElementById("inlineAnchorSummary"),
  });
};
