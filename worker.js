const MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

/* =========================================================
   VALID COC NAMES
   AI IS ONLY ALLOWED TO SELECT FROM THESE NAMES.
   ========================================================= */

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


/* =========================================================
   JSON SCHEMA
   ========================================================= */

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
        required: [
          "name",
          "qty",
          "role"
        ]
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
        required: [
          "name",
          "qty",
          "role"
        ]
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
        required: [
          "name",
          "role",
          "ability"
        ]
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
      required: [
        "name",
        "clanCastle"
      ]
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
            required: [
              "x",
              "y",
              "label"
            ]
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
        required: [
          "step",
          "text"
        ]
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

    required: [
      "x",
      "y",
      "label"
    ]
  };
}


/* =========================================================
   WORKER
   ========================================================= */

export default {

  async fetch(request, env) {

    const url = new URL(request.url);


    if (
      request.method === "POST" &&
      url.pathname === "/api/ask"
    ) {

      try {

        if (!env.AI) {

          return sendJSON({
            error:
              "Cloudflare Workers AI binding 'AI' nahi mila."
          }, 500);

        }


        const body =
          await request.json();


        const th =
          String(body.th || "").trim();

        const mode =
          String(body.mode || "war").trim();

        const message =
          String(body.message || "").trim();

        const image =
          body.image || null;


        if (!th) {

          return sendJSON({
            error:
              "Pehle Town Hall select karo."
          }, 400);

        }


        if (
          mode === "war" &&
          !image
        ) {

          return sendJSON({
            error:
              "War analysis ke liye base screenshot upload karo."
          }, 400);

        }


        const prompt = `
You are CoC Battle AI.

Player Town Hall:
${th}

Mode:
${mode}

Extra player information:
${message || "None"}

IMPORTANT:

Use CURRENT practical Clash of Clans attack logic.

Do NOT recommend an army simply because it was historically popular.

First inspect the actual base screenshot.

Look for:
- Town Hall position
- compartment structure
- important defenses
- open/closed sections
- likely funnel
- likely troop path
- high-value spell zones

Then select the attack strategy.

VERY IMPORTANT:

Every troop must come from the allowed troop names supplied by the JSON schema.

Every spell must come from the allowed spell names.

Never combine troop names.

Never invent a troop.

For example:
Hog Rider is valid.
Haste Hog Rider is NOT valid.

Ice Golem is valid.
Freeze Golem is NOT valid.

Give the COMPLETE planned army composition, not merely the important troops.

Use practical quantities.

If player troop levels, hero equipment or exact capacities are unknown, mention that in warnings rather than inventing facts.

MAP RULES:

Coordinates use percentages.

Top-left = x0 y0.
Bottom-right = x100 y100.

ENTRY:
Where the attack starts.

FUNNEL A:
First funnel side.

FUNNEL B:
Second funnel side.

MAIN ARMY:
Where the main force is deployed.

CORE:
Central/high-value area the army should reach.

MAIN TARGET:
Town Hall or most important target.

Place these coordinates on the ACTUAL screenshot.

Spell zones must also match the screenshot.

DEPLOYMENT:

Give exact numbered deployment order.

TIMING:

Explain important spell and hero ability timing.

BACKUP:

Explain what to do if funnel/pathing fails.

PRACTICE:

Give useful rehearsal checkpoints.

Do not promise a guaranteed 3-star.
`;


        const userContent = [
          {
            type: "text",
            text: prompt
          }
        ];


        if (image) {

          userContent.push({
            type: "image_url",

            image_url: {
              url: image
            }
          });

        }


        const input = {

          messages: [
            {
              role: "system",

              content:
                "You are a precise Clash of Clans attack planner. Follow the supplied JSON schema exactly."
            },

            {
              role: "user",
              content: userContent
            }
          ],

          guided_json:
            PLAN_SCHEMA,

          max_tokens:
            3000,

          temperature:
            0.1
        };


        const result =
          await env.AI.run(
            MODEL,
            input
          );


        let plan =
          parseResult(result);


        const validation =
          validatePlan(plan);


        if (!validation.ok) {

          return sendJSON({
            error:
              "AI ne invalid army banayi: " +
              validation.error +
              ". Strategy button dobara dabao."
          }, 422);

        }


        return sendJSON({
          plan: plan
        });


      } catch (error) {

        return sendJSON({
          error:
            error?.message ||
            "Unknown error"
        }, 500);

      }

    }


    return new Response(
      PAGE,
      {
        headers: {
          "content-type":
            "text/html; charset=UTF-8"
        }
      }
    );

  }
};


/* =========================================================
   SERVER VALIDATION
   ========================================================= */

function parseResult(result) {

  let raw =
    result?.response ??
    result?.result ??
    result;


  if (
    raw &&
    typeof raw === "object"
  ) {

    return raw;
  }


  let text =
    String(raw || "")
      .trim()
      .replace(
        /^```json/i,
        ""
      )
      .replace(
        /```$/,
        ""
      )
      .trim();


  return JSON.parse(text);
}


function validatePlan(plan) {

  if (
    !plan ||
    typeof plan !== "object"
  ) {

    return {
      ok: false,
      error: "plan missing"
    };
  }


  if (
    !Array.isArray(plan.army) ||
    plan.army.length === 0
  ) {

    return {
      ok: false,
      error: "army empty"
    };
  }


  for (
    const unit of plan.army
  ) {

    if (
      !TROOPS.includes(
        unit.name
      )
    ) {

      return {
        ok: false,
        error:
          "invalid troop " +
          unit.name
      };
    }


    if (
      !Number.isInteger(
        unit.qty
      ) ||
      unit.qty < 1
    ) {

      return {
        ok: false,
        error:
          "invalid quantity"
      };
    }

  }


  for (
    const spell of
    plan.spells || []
  ) {

    if (
      !SPELLS.includes(
        spell.name
      )
    ) {

      return {
        ok: false,
        error:
          "invalid spell " +
          spell.name
      };
    }

  }


  for (
    const hero of
    plan.heroes || []
  ) {

    if (
      !HEROES.includes(
        hero.name
      )
    ) {

      return {
        ok: false,
        error:
          "invalid hero " +
          hero.name
      };
    }

  }


  if (
    !plan.map ||
    !plan.map.entry ||
    !plan.map.main ||
    !plan.map.core ||
    !plan.map.target
  ) {

    return {
      ok: false,
      error:
        "attack map missing"
    };
  }


  return {
    ok: true
  };
}


function sendJSON(
  data,
  status = 200
) {

  return new Response(
    JSON.stringify(data),
    {
      status: status,

      headers: {
        "content-type":
          "application/json; charset=UTF-8"
      }
    }
  );
}


/* =========================================================
   FRONT END
   ========================================================= */

const PAGE = `<!doctype html>

<html>

<head>

<meta charset="utf-8">

<meta
 name="viewport"
 content="width=device-width,initial-scale=1"
>

<title>
CoC Battle AI
</title>


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
 background:
 linear-gradient(
  135deg,
  #192640,
  #0c1423
 );
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
 grid-template-columns:
 repeat(3,1fr);
 gap:8px;
}

.unit{
 background:#0b1220;
 border:1px solid #293850;
 border-radius:13px;
 padding:10px;
 text-align:center;
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

.icon{
 width:50px;
 height:50px;
 margin:
 0 auto 7px;
 border-radius:50%;
 background:#202b3d;
 display:flex;
 align-items:center;
 justify-content:center;
 font-size:25px;
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
  grid-template-columns:
  repeat(2,1fr);
 }

}

</style>

</head>


<body>

<div class="app">


<div class="card hero">

<div class="badge">
VISION + VALIDATED ARMY
</div>

<h1>
⚔️ CoC Battle AI
</h1>

<div class="sub">
Screenshot strategy • Full Army • Funnel • Visual Roadmap
</div>

</div>


<div class="card">

<b>
1️⃣ Town Hall
</b>

<select id="th">

<option value="">
Town Hall select karo
</option>

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

<b>
2️⃣ Mode
</b>

<div class="modes">

<button
 class="mode"
 data-mode="attack"
>
⚔️ Attack
</button>

<button
 class="mode"
 data-mode="farming"
>
💰 Farming
</button>

<button
 class="mode active"
 data-mode="war"
>
🏆 War
</button>

<button
 class="mode"
 data-mode="base"
>
🏰 Base Design
</button>

</div>

</div>


<div class="card">

<b>
3️⃣ Base Screenshot
</b>

<label
 for="file"
 class="upload"
>

📷 Screenshot Upload

<br>

<span class="sub">
Maximum 20MB • Auto Compress
</span>

</label>

<input
 id="file"
 type="file"
 accept="image/png,image/jpeg,image/webp"
>


<div id="previewBox">

<img id="preview">

<canvas id="attackMap">
</canvas>

</div>

</div>


<div class="card">

<b>
4️⃣ Extra Details
</b>

<textarea
 id="message"
 placeholder="Hero levels, equipment, troop levels ya koi special information..."
></textarea>

<button
 id="go"
 class="go"
>
⚔️ Analyze + Build Attack
</button>

<div
 id="status"
 class="status"
></div>

</div>


<div
 id="result"
 class="card"
>

<h2 id="planTitle">
Attack Plan
</h2>

<div
 id="confidence"
 class="sub"
></div>


<div class="section">

<h3>
🔍 Base Analysis
</h3>

<div id="baseRead">
</div>

</div>


<div class="section">

<h3>
🧠 Strategy Reason
</h3>

<div id="reason">
</div>

</div>


<div class="section">

<h3>
🪖 Full Army
</h3>

<div
 id="army"
 class="unitGrid"
></div>

</div>


<div class="section">

<h3>
🧪 Spells
</h3>

<div
 id="spells"
 class="unitGrid"
></div>

</div>


<div class="section">

<h3>
👑 Heroes
</h3>

<div
 id="heroes"
 class="unitGrid"
></div>

</div>


<div class="section">

<h3>
🚜 Siege + Clan Castle
</h3>

<div id="siege">
</div>

</div>


<div class="section">

<h3>
🗺️ Attack Roadmap
</h3>

<div
 id="roadmap"
 class="path"
>
ENTRY → FUNNEL → MAIN ARMY → CORE → TARGET
</div>

</div>


<div class="section">

<h3>
🚀 Exact Deployment
</h3>

<div id="deployment">
</div>

</div>


<div class="section">

<h3>
⏱️ Spell + Hero Timing
</h3>

<div id="timing">
</div>

</div>


<div class="section">

<h3>
🔁 Backup Plan
</h3>

<div id="backup">
</div>

</div>


<div class="section">

<h3>
🎯 Practice
</h3>

<div id="practice">
</div>

</div>


<div
 id="warnings"
 class="section warning"
></div>


</div>


</div>


<script>

let currentMode="war";
let selectedImage=null;


/* =========================
   MODE
   ========================= */

document
.querySelectorAll(".mode")
.forEach(function(button){

 button.onclick=function(){

  document
  .querySelectorAll(".mode")
  .forEach(function(x){
   x.classList.remove("active");
  });

  button.classList.add(
   "active"
  );

  currentMode=
   button.dataset.mode;

 };

});


/* =========================
   IMAGE
   ========================= */

file.onchange=
async function(){

 const f=
  file.files[0];

 if(!f)
  return;


 if(
  f.size >
  20*1024*1024
 ){

  alert(
   "Maximum 20MB screenshot."
  );

  return;
 }


 status.textContent=
  "🖼️ Screenshot optimize ho raha hai...";


 try{

  selectedImage=
   await compressImage(f);


  preview.src=
   selectedImage;


  previewBox.style.display=
   "block";


  status.textContent=
   "✅ Screenshot ready";


 }catch(e){

  status.textContent=
   "❌ Image error";

 }

};


function compressImage(file){

 return new Promise(
 function(resolve,reject){

  const reader=
   new FileReader();


  reader.onload=
  function(event){

   const img=
    new Image();


   img.onload=
   function(){

    const MAX=1600;

    let width=
     img.width;

    let height=
     img.height;


    if(
     width>MAX ||
     height>MAX
    ){

     const scale=
      Math.min(
       MAX/width,
       MAX/height
      );

     width=
      Math.round(
       width*scale
      );

     height=
      Math.round(
       height*scale
      );

    }


    const canvas=
     document.createElement(
      "canvas"
     );


    canvas.width=
     width;

    canvas.height=
     height;


    canvas
    .getContext("2d")
    .drawImage(
     img,
     0,
     0,
     width,
     height
    );


    resolve(
     canvas.t
