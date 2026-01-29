function formatPercent(count, total) {
  if (!total) return "0%";
  return `${Math.round((count / total) * 100)}%`;
}

function renderTable(container, rows, headers) {
  if (!rows.length) {
    container.innerHTML = "<p class=\"helper\">No data yet.</p>";
    return;
  }
  const headerRow = `<tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>`;
  const bodyRows = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
    .join("");
  container.innerHTML = `<table><thead>${headerRow}</thead><tbody>${bodyRows}</tbody></table>`;
}

async function loadStats(targets = {}) {
  if (!window.worksheetConfig || !worksheetConfig.analytics.enabled) {
    return;
  }
  const supabaseUrl = worksheetConfig.analytics.supabaseUrl;
  const supabaseKey = worksheetConfig.analytics.supabaseAnonKey;
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

  renderTable(
    targets.days || document.getElementById("daysTable"),
    (daysRows || []).map((row) => [row.days, row.total, formatPercent(row.total, daysTotal)]),
    ["Days", "Count", "%"]
  );

  renderTable(
    targets.friction || document.getElementById("frictionTable"),
    (frictionRows || []).map((row) => [row.friction || "(unknown)", row.total, formatPercent(row.total, frictionTotal)]),
    ["Blocker", "Count", "%"]
  );

  renderTable(
    targets.action || document.getElementById("actionTable"),
    (actionRows || []).map((row) => [row.action || "(unknown)", row.total, formatPercent(row.total, actionTotal)]),
    ["Action", "Count", "%"]
  );

  renderTable(
    targets.anchor || document.getElementById("anchorTable"),
    (anchorRows || []).map((row) => [row.anchor || "(unknown)", row.total, formatPercent(row.total, anchorTotal)]),
    ["Time Anchor", "Count", "%"]
  );
}

window.addEventListener("load", () => {
  loadStats();
});

window.renderInlineStats = () => {
  loadStats({
    days: document.getElementById("inlineDaysTable"),
    friction: document.getElementById("inlineFrictionTable"),
    action: document.getElementById("inlineActionTable"),
    anchor: document.getElementById("inlineAnchorTable"),
  });
};
