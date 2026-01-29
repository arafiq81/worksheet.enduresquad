const screens = [
  document.getElementById("screen-1"),
  document.getElementById("screen-2"),
  document.getElementById("screen-3"),
  document.getElementById("screen-4"),
];

const daysRange = document.getElementById("daysRange");
const daysValue = document.getElementById("daysValue");
const toScreen2 = document.getElementById("toScreen2");
const toScreen3 = document.getElementById("toScreen3");
const ifValue = document.getElementById("ifValue");
const actionSelect = document.getElementById("actionSelect");
const anchorSelect = document.getElementById("anchorSelect");
const savePlan = document.getElementById("savePlan");
const saveStatus = document.getElementById("saveStatus");
const screen1Title = document.getElementById("screen1Title");
const screen1Prompt = document.getElementById("screen1Prompt");
const screen1Helper = document.getElementById("screen1Helper");
const screen2Title = document.getElementById("screen2Title");
const screen2Prompt = document.getElementById("screen2Prompt");
const screen3Title = document.getElementById("screen3Title");
const screen3Prompt = document.getElementById("screen3Prompt");

const frictionCopy = {
  time_fragmentation: "my day keeps fragmenting",
  family_obligations: "family interrupts my routine",
  decision_fatigue: "I overthink and stall",
  environment: "my environment blocks me",
};

let supabaseClient = null;
let supabaseReady = false;
let supabaseInitAttempts = 0;

function loadConfigScript() {
  if (window.worksheetConfig) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-config]");
    if (existing) {
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = "/config.js";
    script.dataset.config = "true";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadSupabaseScript() {
  if (window.supabase) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-supabase]");
    if (existing) {
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@supabase/supabase-js@2";
    script.defer = true;
    script.dataset.supabase = "true";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function initSupabase() {
  if (supabaseReady) {
    return;
  }
  if (!window.worksheetConfig || !worksheetConfig.analytics.enabled) {
    return;
  }
  if (!window.supabase) {
    return;
  }

  const url = worksheetConfig.analytics.supabaseUrl;
  const key = worksheetConfig.analytics.supabaseAnonKey;
  if (!url || !key || url.includes("YOUR_PROJECT_ID") || key.includes("YOUR_SUPABASE_ANON_KEY")) {
    return;
  }

  supabaseClient = window.supabase.createClient(url, key);
  supabaseReady = true;
}

function initSupabaseWithRetry() {
  initSupabase();
  if (!supabaseReady && supabaseInitAttempts < 10) {
    supabaseInitAttempts += 1;
    setTimeout(initSupabaseWithRetry, 500);
  }
}

async function sendEvent(name, payload, options = {}) {
  const { silent } = options;
  if (!window.worksheetConfig) {
    try {
      await loadConfigScript();
    } catch (error) {
      console.error("Config script failed to load", error);
    }
  }
  if (!window.worksheetConfig) {
    if (!silent) {
      saveStatus.textContent = "Save failed. Please refresh and try again.";
    }
    return;
  }
  if (!worksheetConfig.analytics || !worksheetConfig.analytics.enabled) {
    if (!silent) {
      saveStatus.textContent = "Save failed. Please refresh and try again.";
    }
    return;
  }
  const supabaseUrl = worksheetConfig.analytics.supabaseUrl;
  const supabaseKey = worksheetConfig.analytics.supabaseAnonKey;
  const keyParts = supabaseKey ? supabaseKey.split(".") : [];
  const keyLooksJwt = keyParts.length === 3;
  if (!supabaseUrl || !supabaseKey || !keyLooksJwt) {
    if (!silent) {
      saveStatus.textContent = "Save failed. Please refresh and try again.";
    }
    return;
  }
  if (!supabaseClient || !supabaseReady) {
    try {
      await loadSupabaseScript();
    } catch (error) {
      console.error("Supabase script failed to load", error);
    }
    initSupabaseWithRetry();
    const start = Date.now();
    while (!supabaseReady && Date.now() - start < 4000) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  if (!supabaseClient || !supabaseReady) {
    if (!silent) {
      saveStatus.textContent = "Save failed. Please refresh and try again.";
    }
    return;
  }
  const event = {
    name,
    payload,
  };

  try {
    const insertPromise = supabaseClient.from("worksheet_events").insert([event]);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Insert timed out")), 8000)
    );
    const { error } = await Promise.race([insertPromise, timeoutPromise]);
    if (error) {
      if (!silent) {
        saveStatus.textContent = "Save failed. Please refresh and try again.";
      }
    } else {
      if (!silent) {
        showScreen(3);
        if (window.renderInlineStats) {
          window.renderInlineStats();
        }
      }
    }
  } catch (error) {
    if (!silent) {
      saveStatus.textContent = "Save failed. Please refresh and try again.";
    }
  }
}

function showScreen(index) {
  screens.forEach((screen, i) => {
    screen.hidden = i !== index;
  });
}

function getSelectedFriction() {
  const selected = document.querySelector("input[name='friction']:checked");
  return selected ? selected.value : null;
}

function logEvent(name, payload, options) {
  const entry = {
    name,
    payload,
    ts: new Date().toISOString(),
  };
  const history = JSON.parse(localStorage.getItem("worksheetEvents") || "[]");
  history.push(entry);
  localStorage.setItem("worksheetEvents", JSON.stringify(history));
  return sendEvent(name, payload, options);
}

function applyConfig() {
  if (!window.worksheetConfig) {
    return;
  }

  screen1Title.textContent = worksheetConfig.screen1.title;
  screen1Prompt.textContent = worksheetConfig.screen1.prompt;
  screen1Helper.textContent = worksheetConfig.screen1.helper;
  screen2Title.textContent = worksheetConfig.screen2.title;
  screen2Prompt.textContent = worksheetConfig.screen2.prompt;
  screen3Title.textContent = worksheetConfig.screen3.title;
  screen3Prompt.textContent = worksheetConfig.screen3.prompt;

  actionSelect.innerHTML = "";
  worksheetConfig.screen3.actions.forEach((action) => {
    const option = document.createElement("option");
    option.value = action.value;
    option.textContent = action.label;
    actionSelect.appendChild(option);
  });

  anchorSelect.innerHTML = "";
  worksheetConfig.screen3.anchors.forEach((anchor) => {
    const option = document.createElement("option");
    option.value = anchor.value;
    option.textContent = anchor.label;
    anchorSelect.appendChild(option);
  });
}

applyConfig();
initSupabaseWithRetry();

daysRange.addEventListener("input", (event) => {
  daysValue.textContent = event.target.value;
});

toScreen2.addEventListener("click", () => {
  logEvent("reality_check", { days: Number(daysRange.value) }, { silent: true });
  showScreen(1);
});

document.querySelectorAll("input[name='friction']").forEach((input) => {
  input.addEventListener("change", () => {
    const friction = getSelectedFriction();
    ifValue.textContent = frictionCopy[friction] || "family interrupts my routine";
    toScreen3.disabled = false;
  });
});

toScreen3.addEventListener("click", () => {
  logEvent("friction_selected", { friction: getSelectedFriction() }, { silent: true });
  showScreen(2);
});

savePlan.addEventListener("click", async () => {
  const payload = {
    friction: getSelectedFriction(),
    action: actionSelect.value,
    anchor: anchorSelect.value,
  };
  saveStatus.textContent = "Saving…";
  await logEvent("fallback_plan", payload);
  savePlan.disabled = true;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}
