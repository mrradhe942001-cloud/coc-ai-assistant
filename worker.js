const MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

const TROOPS = [
  "Barbarian",
  "Archer",
  "Giant",
  "Goblin",
  "Wall Breaker",
  "Balloon",
  "Wizard",
  "Healer",
  "Dragon",
  "P.E.K.K.A",
  "Baby Dragon",
  "Miner",
  "Electro Dragon",
  "Yeti",
  "Dragon Rider",
  "Electro Titan",
  "Root Rider",
  "Thrower",
  "Meteor Golem",
  "Minion",
  "Hog Rider",
  "Valkyrie",
  "Golem",
  "Witch",
  "Lava Hound",
  "Bowler",
  "Ice Golem",
  "Headhunter",
  "Apprentice Warden",
  "Druid"
];

const SPELLS = [
  "Lightning Spell",
  "Healing Spell",
  "Rage Spell",
  "Jump Spell",
  "Freeze Spell",
  "Clone Spell",
  "Invisibility Spell",
  "Recall Spell",
  "Poison Spell",
  "Earthquake Spell",
  "Haste Spell",
  "Skeleton Spell",
  "Bat Spell",
  "Overgrowth Spell",
  "Revive Spell"
];

const HEROES = [
  "Barbarian King",
  "Archer Queen",
  "Minion Prince",
  "Grand Warden",
  "Royal Champion"
];

const SIEGES = [
  "None",
  "Wall Wrecker",
  "Battle Blimp",
  "Stone Slammer",
  "Siege Barracks",
  "Log Launcher",
  "Flame Flinger",
  "Battle Drill"
];

function pointSchema(label) {
  return {
    type: "object",
    properties: {
      x: {
        type: "number",
        minimum: 0,
        maximum: 100
      },
      y: {
        type: "number",
        minimum: 0,
        maximum: 100
      },
      label: {
        type: "string",
        enum: [label]
      }
    },
    required: ["x", "y", "label"]
  };
}

const PLAN_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string"
    },

    baseRead: {
      type: "string"
    },

    strategyReason: {
      type: "string"
    },

    confidence: {
      type: "string",
      enum: ["high", "medium", "low"]
    },

    army: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            enum: TROOPS
          },
          qty: {
            type: "integer",
            minimum: 1,
            maximum: 100
          },
          role: {
            type: "string"
          }
        },
        required: ["name", "qty", "role"]
      }
    },

    spells: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            enum: SPELLS
          },
          qty: {
            type: "integer",
            minimum: 1,
            maximum: 20
          },
          role: {
            type: "string"
          }
        },
        required: ["name", "qty", "role"]
      }
    },

    heroes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            enum: HEROES
          },
          role: {
            type: "string"
          },
          ability: {
            type: "string"
          }
        },
        required: ["name", "role", "ability"]
      }
    },

    siege: {
      type: "object",
      properties: {
        name: {
          type: "string",
          enum: SIEGES
        },
        clanCastle: {
          type: "string"
        }
      },
      required: ["name", "clanCastle"]
    },

    map: {
      type: "object",
      properties: {
        entry: pointSchema("ENTRY"),
        funnelA: pointSchema("FUNNEL A"),
        funnelB: pointSchema("FUNNEL B"),
        main: pointSchema("MAIN ARMY"),
        core: pointSchema("CORE"),
        target: pointSchema("MAIN TARGET"),

        spellZones: {
          type: "array",
          items: {
            type: "object",
            properties: {
              x: {
                type: "number",
                minimum: 0,
                maximum: 100
              },
              y: {
                type: "number",
                minimum: 0,
                maximum: 100
              },
              label: {
                type: "string"
              }
            },
            required: ["x", "y", "label"]
          }
        }
      },

      required: [
        "entry",
        "funnelA",
        "funnelB",
        "main",
        "core",
        "target",
        "spellZones"
      ]
    },

    deployment: {
      type: "array",
      items: {
        type: "object",
        properties: {
          step: {
            type: "integer"
          },
          text: {
            type: "string"
          }
        },
        required: ["step", "text"]
      }
    },

    timing: {
      type: "array",
      items: {
        type: "string"
      }
    },

    backup: {
      type: "array",
      items: {
        type: "string"
      }
    },

    practice: {
      type: "array",
      items: {
        type: "string"
      }
    },

    warnings: {
      type: "array",
      items: {
        type: "string"
      }
    }
  },

  required: [
    "title",
    "baseRead",
    "strategyReason",
    "confidence",
    "army",
    "spells",
    "heroes",
    "siege",
    "map",
    "deployment",
    "timing",
    "backup",
    "practice",
    "warnings"
  ]
};
function sendJSON(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "content-type": "application/json; charset=UTF-8"
      }
    }
  );
}

function parseResult(result) {
  let raw =
    result?.response ??
    result?.result ??
    result;

  if (raw && typeof raw === "object") {
    return raw;
  }

  let text = String(raw || "").trim();

  text = text
    .replace(/^```json/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(text);
}
function validatePlan(plan) {
  if (!plan || typeof plan !== "object") {
    return {
      ok: false,
      error: "Plan missing"
    };
  }

  if (!Array.isArray(plan.army) || plan.army.length === 0) {
    return {
      ok: false,
      error: "Army empty"
    };
  }

  for (const unit of plan.army) {
    if (!TROOPS.includes(unit.name)) {
      return {
        ok: false,
        error: "Invalid troop: " + unit.name
      };
    }

    if (!Number.isInteger(unit.qty) || unit.qty < 1) {
      return {
        ok: false,
        error: "Invalid troop quantity"
      };
    }
  }

  for (const spell of plan.spells || []) {
    if (!SPELLS.includes(spell.name)) {
      return {
        ok: false,
        error: "Invalid spell: " + spell.name
      };
    }
  }

  for (const hero of plan.heroes || []) {
    if (!HEROES.includes(hero.name)) {
      return {
        ok: false,
        error: "Invalid hero: " + hero.name
      };
    }
  }

  if (
    !plan.map ||
    !plan.map.entry ||
    !plan.map.funnelA ||
    !plan.map.funnelB ||
    !plan.map.main ||
    !plan.map.core ||
    !plan.map.target
  ) {
    return {
      ok: false,
      error: "Visual attack map missing"
    };
  }

  return {
    ok: true
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (
      request.method === "POST" &&
      url.pathname === "/api/ask"
    ) {
      try {
        if (!env.AI) {
          return sendJSON(
            {
              error: "Workers AI binding AI nahi mila."
            },
            500
          );
        }

        const body = await request.json();

        const th = String(body.th || "").trim();
        const mode = String(body.mode || "war").trim();
        const message = String(body.message || "").trim();
        const image = body.image || null;

        if (!th) {
          return sendJSON(
            {
              error: "Town Hall select karo."
            },
            400
          );
        }

        if (mode === "war" && !image) {
          return sendJSON(
            {
              error: "War analysis ke liye screenshot upload karo."
            },
            400
          );
        }

        const prompt = `
You are CoC Battle AI.

PLAYER TOWN HALL:
${th}

MODE:
${mode}

PLAYER INFORMATION:
${message || "No extra information"}

Analyze the supplied Clash of Clans base screenshot carefully.

IMPORTANT RULES:

1. Never invent a troop, spell, hero, siege machine or game mechanic.

2. Every troop name MUST be selected from the allowed names in the JSON schema.

3. Never combine names.
For example:
Hog Rider is valid.
Haste Hog Rider is invalid.
Ice Golem is valid.
Freeze Golem is invalid.

4. Recommend a practical COMPLETE army, not only a few important troops.

5. The strategy must be based on the visible base layout, not simply on the Town Hall number.

6. Inspect:
- Town Hall position
- base compartments
- important defenses
- high-value areas
- funnel opportunities
- likely troop path
- spell zones

7. If something cannot be clearly identified from the screenshot, say so in warnings.

8. Do not guarantee a 3-star.

VISUAL MAP:

All map coordinates must use percentages.

Top-left = x 0, y 0.
Bottom-right = x 100, y 100.

ENTRY:
Actual starting point of attack.

FUNNEL A:
First side used to create funnel.

FUNNEL B:
Second side used to create funnel.

MAIN ARMY:
Main deployment position.

CORE:
Area main army should reach.

MAIN TARGET:
Town Hall or most important target.

SPELL ZONES:
Give useful spell placement coordinates based on the actual screenshot.

DEPLOYMENT:

Give exact numbered deployment steps.

Explain:
- what to deploy
- where to deploy it
- deployment order
- troop path
- spell timing
- hero ability timing

BACKUP PLAN:

Explain what the player should do if pathing or funnel changes.

PRACTICE:

Give short rehearsal checkpoints before the real war attack.

Reply only according to the supplied JSON schema.
`;

        const messages = [
          {
            role: "system",
            content:
              "You are a precise Clash of Clans screenshot attack planner. Follow the JSON schema exactly."
          },
          {
            role: "user",
            content: prompt
          }
        ];
        const input = {
  messages,
  response_format: {
    type: "json_schema",
    json_schema: PLAN_SCHEMA
  },
  max_tokens: 3000,
  temperature: 0.1
};

        if (image) {
          const base64 = image.split(",")[1];

          if (!base64) {
            return sendJSON(
              {
                error: "Screenshot format invalid hai."
              },
              400
            );
          }

          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);

          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          input.image = [...bytes];
        }

        const aiResult = await env.AI.run(
          MODEL,
          input
        );

        const plan = parseResult(aiResult);
        const check = validatePlan(plan);

        if (!check.ok) {
          return sendJSON(
            {
              error:
                "AI strategy validation failed: " +
                check.error
            },
            422
          );
        }

        return sendJSON({
          plan
        });
      } catch (error) {
        return sendJSON(
          {
            error:
              error?.message ||
              "Strategy generate nahi ho payi."
          },
          500
        );
      }
    }

    return new Response(
      PAGE,
      {
        headers: {
          "content-type": "text/html; charset=UTF-8"
        }
      }
    );
  }
};
const PAGE = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">

<title>CoC Battle AI</title>

<style>
*{
  box-sizing:border-box;
}

body{
  margin:0;
  background:#070b12;
  color:#f4f7ff;
  font-family:Arial,sans-serif;
}

.app{
  max-width:820px;
  margin:auto;
  padding:14px;
}

.card{
  background:#111827;
  border:1px solid #27354d;
  border-radius:18px;
  padding:15px;
  margin-bottom:12px;
}

.hero{
  background:linear-gradient(135deg,#192640,#0c1423);
}

.badge{
  display:inline-block;
  background:#ffd12f;
  color:#111;
  border-radius:20px;
  padding:6px 10px;
  font-size:11px;
  font-weight:900;
}

h1{
  margin:9px 0 5px;
}

.sub{
  color:#9daac0;
  font-size:13px;
}

select,
textarea,
button{
  width:100%;
  border:1px solid #34435e;
  background:#151f31;
  color:#fff;
  border-radius:12px;
  padding:12px;
  font-size:14px;
}

textarea{
  min-height:85px;
  margin-top:9px;
}

.modes{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px;
  margin-top:10px;
}

.mode.active{
  background:#ffd12f;
  color:#111;
  font-weight:900;
}

.upload{
  display:block;
  border:2px dashed #40516f;
  border-radius:14px;
  padding:17px;
  text-align:center;
  margin-top:10px;
}

#file{
  display:none;
}

#previewBox{
  display:none;
  position:relative;
  margin-top:12px;
}

#preview{
  width:100%;
  display:block;
  border-radius:13px;
}

#attackMap{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  pointer-events:none;
}

.go{
  background:#ffd12f;
  color:#111;
  border:0;
  font-weight:900;
  margin-top:10px;
}

.go:disabled{
  opacity:.6;
}

.status{
  margin-top:9px;
  color:#a8b5ca;
  font-size:13px;
}

#result{
  display:none;
}

.section{
  margin-top:17px;
}

.section h3{
  color:#ffd12f;
  margin:0 0 9px;
}

.unitGrid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:8px;
}

.unit{
  background:#0b1220;
  border:1px solid #293850;
  border-radius:13px;
  padding:10px;
  text-align:center;
}

.icon{
  width:50px;
  height:50px;
  margin:0 auto 7px;
  border-radius:50%;
  background:#202b3d;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:25px;
}

.unitName{
  font-weight:800;
}

.quantity{
  color:#ffd12f;
  font-weight:900;
  font-size:18px;
}

.role{
  color:#a4b1c5;
  font-size:11px;
  margin-top:4px;
}

.path{
  background:#071523;
  border:1px solid #21465c;
  color:#70e8ff;
  border-radius:11px;
  padding:11px;
  font-weight:800;
}

.step{
  background:#0b1220;
  border-left:3px solid #ffd12f;
  padding:10px;
  margin:7px 0;
  border-radius:8px;
  line-height:1.45;
}

.warning{
  color:#ffbd75;
  font-size:13px;
}

@media(max-width:520px){
  .unitGrid{
    grid-template-columns:repeat(2,1fr);
  }
}
</style>
</head>

<body>

<div class="app">

  <div class="card hero">
    <div class="badge">AI STRATEGY ASSISTANT</div>
    <h1>⚔️ CoC Battle AI</h1>
    <div class="sub">
      Screenshot Analysis • Full Army • Funnel • Visual Attack Roadmap
    </div>
  </div>

  <div class="card">
    <b>1️⃣ Town Hall</b>

    <select id="th">
      <option value="">Town Hall select karo</option>
      <option>TH1</option>
      <option>TH2</option>
      <option>TH3</option>
      <option>TH4</option>
      <option>TH5</option>
      <option>TH6</option>
      <option>TH7</option>
      <option>TH8</option>
      <option>TH9</option>
      <option>TH10</option>
      <option>TH11</option>
      <option>TH12</option>
      <option>TH13</option>
      <option>TH14</option>
      <option>TH15</option>
      <option>TH16</option>
      <option>TH17</option>
      <option>TH18</option>
    </select>
  </div>

  <div class="card">
    <b>2️⃣ Mode</b>

    <div class="modes">
      <button class="mode" data-mode="attack">
        ⚔️ Attack
      </button>

      <button class="mode" data-mode="farming">
        💰 Farming
      </button>

      <button class="mode active" data-mode="war">
        🏆 War Screenshot
      </button>

      <button class="mode" data-mode="base">
        🏰 Base Design
      </button>
    </div>
  </div>

  <div class="card">
    <b>3️⃣ Base Screenshot</b>

    <label for="file" class="upload">
      📷 Screenshot Upload
      <br>
      <span class="sub">
        PNG / JPEG / WebP • Maximum 20MB • Auto Compress
      </span>
    </label>

    <input
      id="file"
      type="file"
      accept="image/png,image/jpeg,image/webp"
    >

    <div id="previewBox">
      <img id="preview" alt="Base Screenshot">
      <canvas id="attackMap"></canvas>
    </div>
  </div>

  <div class="card">
    <b>4️⃣ Extra Details</b>

    <textarea
      id="message"
      placeholder="Hero levels, equipment, troop levels ya koi special information..."
    ></textarea>

    <button id="go" class="go">
      ⚔️ Analyze + Build Strategy
    </button>

    <div id="status" class="status"></div>
  </div>

  <div id="result" class="card">

    <h2 id="planTitle">
      Attack Plan
    </h2>

    <div id="confidence" class="sub"></div>

    <div class="section">
      <h3>🔍 Base Analysis</h3>
      <div id="baseRead"></div>
    </div>

    <div class="section">
      <h3>🧠 Strategy Reason</h3>
      <div id="reason"></div>
    </div>

    <div class="section">
      <h3>🪖 Complete Army</h3>
      <div id="army" class="unitGrid"></div>
    </div>

    <div class="section">
      <h3>🧪 Spells</h3>
      <div id="spells" class="unitGrid"></div>
    </div>

    <div class="section">
      <h3>👑 Heroes</h3>
      <div id="heroes" class="unitGrid"></div>
    </div>

    <div class="section">
      <h3>🚜 Siege + Clan Castle</h3>
      <div id="siege"></div>
    </div>

    <div class="section">
      <h3>🗺️ Visual Attack Roadmap</h3>

      <div class="path">
        ENTRY → FUNNEL A/B → MAIN ARMY → CORE → MAIN TARGET
      </div>

      <div class="sub" style="margin-top:8px">
        Colored arrows screenshot ke upar automatically draw honge.
      </div>
    </div>

    <div class="section">
      <h3>🚀 Exact Deployment Order</h3>
      <div id="deployment"></div>
    </div>

    <div class="section">
      <h3>⏱️ Spell + Hero Timing</h3>
      <div id="timing"></div>
    </div>

    <div class="section">
      <h3>🔁 Backup Plan</h3>
      <div id="backup"></div>
    </div>

    <div class="section">
      <h3>🎯 Practice Plan</h3>
      <div id="practice"></div>
    </div>

    <div id="warnings" class="section warning"></div>

  </div>

</div>

<script>
let currentMode = "war";
let selectedImage = null;
let lastMap = null;

const thEl = document.getElementById("th");
const fileEl = document.getElementById("file");
const previewEl = document.getElementById("preview");
const previewBoxEl = document.getElementById("previewBox");
const attackMapEl = document.getElementById("attackMap");
const messageEl = document.getElementById("message");
const goEl = document.getElementById("go");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");

document.querySelectorAll(".mode").forEach(function(button){
  button.addEventListener("click", function(){
    document.querySelectorAll(".mode").forEach(function(item){
      item.classList.remove("active");
    });

    button.classList.add("active");
    currentMode = button.dataset.mode;
  });
});

fileEl.addEventListener("change", async function(){
  const file = fileEl.files[0];

  if (!file) {
    return;
  }

  if (file.size > 20 * 1024 * 1024) {
    alert("Screenshot maximum 20MB hona chahiye.");
    fileEl.value = "";
    return;
  }

  statusEl.textContent = "🖼️ Screenshot optimize ho raha hai...";

  try {
    selectedImage = await compressImage(file);

    previewEl.onload = function(){
      previewBoxEl.style.display = "block";

      if (lastMap) {
        drawAttackMap(lastMap);
      }
    };

    previewEl.src = selectedImage;

    statusEl.textContent = "✅ Screenshot ready";
  } catch (error) {
    selectedImage = null;
    statusEl.textContent = "❌ Screenshot load nahi hua.";
  }
});

function compressImage(file){
  return new Promise(function(resolve, reject){
    const reader = new FileReader();

    reader.onload = function(event){
      const img = new Image();

      img.onload = function(){
        const MAX = 1600;

        let width = img.width;
        let height = img.height;

        if (width > MAX || height > MAX) {
          const scale = Math.min(
            MAX / width,
            MAX / height
          );

          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        resolve(
          canvas.toDataURL(
            "image/jpeg",
            0.88
          )
        );
      };

      img.onerror = reject;
      img.src = event.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
goEl.addEventListener("click", async function(){
  if (!thEl.value) {
    alert("Pehle Town Hall select karo.");
    return;
  }

  if (currentMode === "war" && !selectedImage) {
    alert("War analysis ke liye base screenshot upload karo.");
    return;
  }

  goEl.disabled = true;
  statusEl.textContent = "🔍 Base analyze ho raha hai...";
  resultEl.style.display = "none";

  try {
    const response = await fetch(
      "/api/ask",
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          th: thEl.value,
          mode: currentMode,
          message: messageEl.value,
          image: selectedImage
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Strategy request failed."
      );
    }

    renderPlan(data.plan);

    statusEl.textContent = "✅ Strategy ready";
  } catch (error) {
    statusEl.textContent =
      "❌ " + (error.message || "Unknown error");
  }

  goEl.disabled = false;
});

function renderPlan(plan){
  document.getElementById("planTitle").textContent =
    plan.title || "Attack Plan";

  document.getElementById("confidence").textContent =
    "Confidence: " + (plan.confidence || "unknown");

  document.getElementById("baseRead").textContent =
    plan.baseRead || "";

  document.getElementById("reason").textContent =
    plan.strategyReason || "";

  document.getElementById("army").innerHTML =
    (plan.army || [])
      .map(function(unit){
        return unitCard(
          troopIcon(unit.name),
          unit.name,
          "×" + unit.qty,
          unit.role
        );
      })
      .join("");

  document.getElementById("spells").innerHTML =
    (plan.spells || [])
      .map(function(spell){
        return unitCard(
          "🧪",
          spell.name,
          "×" + spell.qty,
          spell.role
        );
      })
      .join("");

  document.getElementById("heroes").innerHTML =
    (plan.heroes || [])
      .map(function(hero){
        return unitCard(
          "👑",
          hero.name,
          "",
          hero.role + " • " + hero.ability
        );
      })
      .join("");

  document.getElementById("siege").textContent =
    (plan.siege?.name || "None") +
    " | CC: " +
    (plan.siege?.clanCastle || "Not specified");

  document.getElementById("deployment").innerHTML =
    (plan.deployment || [])
      .map(function(step){
        return (
          '<div class="step">' +
          "<b>" +
          escapeHTML(step.step) +
          ".</b> " +
          escapeHTML(step.text) +
          "</div>"
        );
      })
      .join("");

  document.getElementById("timing").innerHTML =
    listSteps(plan.timing);

  document.getElementById("backup").innerHTML =
    listSteps(plan.backup);

  document.getElementById("practice").innerHTML =
    listSteps(plan.practice);

  document.getElementById("warnings").innerHTML =
    (plan.warnings || [])
      .map(function(item){
        return "⚠️ " + escapeHTML(item);
      })
      .join("<br><br>");

  lastMap = plan.map || null;

  resultEl.style.display = "block";

  if (lastMap && selectedImage) {
    requestAnimationFrame(function(){
      drawAttackMap(lastMap);
    });
  }

  resultEl.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function unitCard(icon, name, qty, role){
  return (
    '<div class="unit">' +
      '<div class="icon">' +
        icon +
      "</div>" +
      '<div class="unitName">' +
        escapeHTML(name) +
      "</div>" +
      '<div class="quantity">' +
        escapeHTML(qty) +
      "</div>" +
      '<div class="role">' +
        escapeHTML(role) +
      "</div>" +
    "</div>"
  );
}

function listSteps(items){
  return (items || [])
    .map(function(item){
      return (
        '<div class="step">' +
        escapeHTML(item) +
        "</div>"
      );
    })
    .join("");
}

function escapeHTML(value){
  return String(value ?? "")
    .replace(
      /[&<>"']/g,
      function(char){
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        }[char];
      }
    );
}

function troopIcon(name){
  const icons = {
    "Barbarian": "⚔️",
    "Archer": "🏹",
    "Giant": "🛡️",
    "Goblin": "💰",
    "Wall Breaker": "💣",
    "Balloon": "🎈",
    "Wizard": "🧙",
    "Healer": "✨",
    "Dragon": "🐉",
    "P.E.K.K.A": "🤖",
    "Baby Dragon": "🐲",
    "Miner": "⛏️",
    "Electro Dragon": "⚡",
    "Yeti": "❄️",
    "Dragon Rider": "🐉",
    "Electro Titan": "⚡",
    "Root Rider": "🌳",
    "Thrower": "🪃",
    "Meteor Golem": "☄️",
    "Minion": "🦇",
    "Hog Rider": "🐗",
    "Valkyrie": "🪓",
    "Golem": "🪨",
    "Witch": "🧙‍♀️",
    "Lava Hound": "🔥",
    "Bowler": "🔵",
    "Ice Golem": "🧊",
    "Headhunter": "🎯",
    "Apprentice Warden": "📘",
    "Druid": "🌿"
  };

  return icons[name] || "🪖";
}

function mapXY(point, width, height){
  return {
    x: (Number(point.x) / 100) * width,
    y: (Number(point.y) / 100) * height
  };
}

function drawAttackMap(mapData){
  if (!mapData || !selectedImage) {
    return;
  }

  const width = previewEl.clientWidth;
  const height = previewEl.clientHeight;

  if (!width || !height) {
    return;
  }

  const ratio = window.devicePixelRatio || 1;

  attackMapEl.width =
    Math.round(width * ratio);

  attackMapEl.height =
    Math.round(height * ratio);

  attackMapEl.style.width =
    width + "px";

  attackMapEl.style.height =
    height + "px";

  const ctx =
    attackMapEl.getContext("2d");

  ctx.setTransform(
    ratio,
    0,
    0,
    ratio,
    0,
    0
  );

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  drawArrow(
    ctx,
    mapData.entry,
    mapData.main,
    width,
    height,
    "#00ff8c"
  );

  drawArrow(
    ctx,
    mapData.funnelA,
    mapData.main,
    width,
    height,
    "#ffd12f"
  );

  drawArrow(
    ctx,
    mapData.funnelB,
    mapData.main,
    width,
    height,
    "#ffd12f"
  );

  drawArrow(
    ctx,
    mapData.main,
    mapData.core,
    width,
    height,
    "#00e5ff"
  );

  drawArrow(
    ctx,
    mapData.core,
    mapData.target,
    width,
    height,
    "#ff4f70"
  );

  drawMarker(
    ctx,
    mapData.entry,
    width,
    height,
    "#00ff8c"
  );

  drawMarker(
    ctx,
    mapData.funnelA,
    width,
    height,
    "#ffd12f"
  );

  drawMarker(
    ctx,
    mapData.funnelB,
    width,
    height,
    "#ffd12f"
  );

  drawMarker(
    ctx,
    mapData.main,
    width,
    height,
    "#00e5ff"
  );

  drawMarker(
    ctx,
    mapData.core,
    width,
    height,
    "#ff9f43"
  );

  drawMarker(
    ctx,
    mapData.target,
    width,
    height,
    "#ff4f70"
  );

  (mapData.spellZones || [])
    .forEach(function(zone){
      drawMarker(
        ctx,
        zone,
        width,
        height,
        "#c879ff"
      );
    });
}

function drawArrow(
  ctx,
  from,
  to,
  width,
  height,
  color
){
  if (!from || !to) {
    return;
  }

  const a =
    mapXY(from, width, height);

  const b =
    mapXY(to, width, height);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();

  const angle =
    Math.atan2(
      b.y - a.y,
      b.x - a.x
    );

  const size = 14;

  ctx.beginPath();

  ctx.moveTo(
    b.x,
    b.y
  );

  ctx.lineTo(
    b.x -
      size *
      Math.cos(angle - Math.PI / 6),
    b.y -
      size *
      Math.sin(angle - Math.PI / 6)
  );

  ctx.lineTo(
    b.x -
      size *
      Math.cos(angle + Math.PI / 6),
    b.y -
      size *
      Math.sin(angle + Math.PI / 6)
  );

  ctx.closePath();
  ctx.fill();
}

function drawMarker(
  ctx,
  point,
  width,
  height,
  color
){
  if (!point) {
    return;
  }

  const p =
    mapXY(point, width, height);

  const label =
    String(point.label || "");

  ctx.fillStyle = color;

  ctx.beginPath();

  ctx.arc(
    p.x,
    p.y,
    8,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.font =
    "bold 11px Arial";

  const textWidth =
    ctx.measureText(label).width;

  let labelX = p.x + 10;
  let labelY = p.y - 12;

  if (
    labelX + textWidth + 12 >
    width
  ) {
    labelX =
      p.x - textWidth - 22;
  }

  if (labelY < 2) {
    labelY = p.y + 10;
  }

  ctx.fillStyle =
    "rgba(0,0,0,.82)";

  ctx.fillRect(
    labelX,
    labelY,
    textWidth + 10,
    20
  );

  ctx.fillStyle = "#fff";

  ctx.fillText(
    label,
    labelX + 5,
    labelY + 14
  );
}

window.addEventListener(
  "resize",
  function(){
    if (
      lastMap &&
      selectedImage
    ) {
      drawAttackMap(lastMap);
    }
  }
);
</script>

</body>
</html>`;
