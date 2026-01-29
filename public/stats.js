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

async function loadStats() {
  if (!window.worksheetConfig || !worksheetConfig.analytics.enabled) {
    return;
  }
  const supabaseUrl = worksheetConfig.analytics.supabaseUrl;
  const supabaseKey = worksheetConfig.analytics.supabaseAnonKey;
  if (!supabaseUrl || !supabaseKey) {
    return;
  }
  const client = window.supabase.createClient(supabaseUrl, supabaseKey);

  const [{ data: daysRows, error: daysError }, { data: frictionRows, error: frictionError }] =
    await Promise.all([
      client.from("vw_days_counts").select("days,total").order("days", { ascending: true }),
      client.from("vw_friction_counts").select("friction,total").order("total", { ascending: false }),
    ]);

  if (daysError || frictionError) {
    console.error(daysError || frictionError);
  }

  const daysTotal = (daysRows || []).reduce((sum, row) => sum + Number(row.total || 0), 0);
  const frictionTotal = (frictionRows || []).reduce((sum, row) => sum + Number(row.total || 0), 0);

  renderTable(
    document.getElementById("daysTable"),
    (daysRows || []).map((row) => [row.days, row.total, formatPercent(row.total, daysTotal)]),
    ["Days", "Count", "%"]
  );

  renderTable(
    document.getElementById("frictionTable"),
    (frictionRows || []).map((row) => [row.friction || "(unknown)", row.total, formatPercent(row.total, frictionTotal)]),
    ["Blocker", "Count", "%"]
  );
}

window.addEventListener("load", () => {
  loadStats();
});
