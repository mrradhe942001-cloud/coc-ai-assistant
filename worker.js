const MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

const SYSTEM = `You are CoC Battle AI, a Clash of Clans strategy assistant.
Support TH1 through TH18.

Rules:
- Reply in simple Hinglish.
- Use only troops, spells, heroes, pets and siege machines available at the selected Town Hall.
- Never invent units, buildings, mechanics or copy-base links.
- Never promise a guaranteed 3-star or 100% result.
- For screenshots, analyze only clearly visible information. Hidden traps are unknown.
- Prefer a practical, high-confidence plan and mention uncertainty when something is unclear.

For WAR screenshot analysis always use these sections:

## BASE READ
Describe visible Town Hall position, compartments, important defenses and likely pathing.

## ARMY
Each troop MUST be on its own line:
[UNIT] Name | Quantity | Purpose

## SPELLS
Each spell MUST be:
[SPELL] Name | Quantity | Purpose

## HEROES
Each hero MUST be:
[HERO] Name | Timing / role

## SIEGE & CLAN CASTLE
Give recommendations when relevant.

## ATTACK MAP
ENTRY: clock position
FUNNEL-A: clock position
FUNNEL-B: clock position
MAIN: clock position
PATH: Entry -> Funnel -> Main Army -> Core -> Town Hall / key target
SPELL-ZONES: clock positions and target areas

## DEPLOYMENT
Give numbered deployment steps in exact order.

## TIMING
Explain spell timing and hero ability timing.

## BACKUP
Explain what to change if pathing goes wrong.

## PRACTICE
Give three rehearsal checkpoints: funnel, main deployment, and spell/hero timing.
Tell the player what to verify before the real war attack.

For FARMING prioritize loot and practical training.
For WAR BASE DESIGN support TH4-TH18 and explain anti-2-star/anti-3-star concepts.
Never invent a Clash of Clans layout URL.`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/ask") {
      try {
        if (!env.AI) {
          return json({
            error: "Workers AI binding 'AI' nahi mila."
          }, 500);
        }

        const body = await request.json();

        const message = String(body.message || "").trim();
        const mode = String(body.mode || "attack");
        const th = String(body.th || "");
        const image = body.image || null;

        if (!message && !image) {
          return json({
            error: "Question ya screenshot bhejo."
          }, 400);
        }

        let prompt =
          "Mode: " + mode +
          "\nPlayer Town Hall: " + (th || "not provided") +
          "\nRequest: " +
          (message || "Analyze this Clash of Clans base screenshot.");

        if (image) {
          prompt +=
            "\nA base screenshot is attached." +
            "\nInspect the actual image carefully." +
            "\nUse clock positions." +
            "\nGive a legal army for the selected TH." +
            "\nDo not claim hidden traps are visible." +
            "\nUse the structured WAR screenshot format when mode is war.";
        }

        const input = {
          messages: [
            {
              role: "system",
              content: SYSTEM
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 1800,
          temperature: 0.15
        };

        if (image) {
          const base64 = image.split(",")[1];

          if (!base64) {
            return json({
              error: "Screenshot data invalid hai."
            }, 400);
          }

          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);

          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          input.image = [...bytes];
        }

        const result = await env.AI.run(MODEL, input);

        return json({
          reply:
            result?.response ||
            result?.result ||
            "AI response nahi mila."
        });

      } catch (e) {
        return json({
          error: e?.message || "Unknown error"
        }, 500);
      }
    }

    return new Response(PAGE, {
      headers: {
        "content-type": "text/html; charset=UTF-8"
      }
    });
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8"
    }
  });
}

const PAGE = `<!doctype html>
<html>
<head>

<meta charset="utf-8">

<meta
  name="viewport"
  content="width=device-width,initial-scale=1"
>

<title>CoC Battle AI</title>

<style>

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #080b12;
  color: #fff;
  font-family: Arial, sans-serif;
}

.app {
  max-width: 780px;
  margin: auto;
  padding: 16px;
}

.hero,
.card,
.answer,
.loadout,
.practice {
  background: #111722;
  border: 1px solid #273247;
  border-radius: 18px;
  padding: 16px;
  margin-bottom: 13px;
}

.hero {
  background: linear-gradient(
    135deg,
    #182235,
    #101725
  );

  border-radius: 22px;
  padding: 21px;
}

.badge {
  display: inline-block;
  background: #ffc928;
  color: #111;
  font-weight: 800;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 12px;
  margin-bottom: 10px;
}

h1 {
  margin: 0 0 7px;
  font-size: 27px;
}

.hero p {
  margin: 0;
  color: #aebbd0;
  line-height: 1.5;
}

.title {
  font-weight: 800;
  margin-bottom: 11px;
}

.modes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.mode {
  border: 1px solid #35445f;
  background: #182132;
  color: #fff;
  border-radius: 12px;
  padding: 12px 6px;
  font-weight: 700;
}

.mode.active {
  background: #ffc928;
  color: #111;
  border-color: #ffc928;
}

select,
textarea {
  width: 100%;
  background: #090d15;
  border: 1px solid #35445f;
  color: #fff;
  border-radius: 12px;
  padding: 13px;
  font-size: 15px;
}

textarea {
  min-height: 100px;
  resize: vertical;
  margin-top: 8px;
}

.upload {
  display: block;
  border: 2px dashed #42516d;
  border-radius: 15px;
  padding: 17px;
  text-align: center;
  background: #0c111b;
  cursor: pointer;
}

.upload strong {
  display: block;
  margin-bottom: 5px;
}

.upload small,
.note {
  color: #9cabc2;
  font-size: 13px;
}

#file {
  display: none;
}

#preview {
  display: none;
  width: 100%;
  max-height: 360px;
  object-fit: contain;
  margin-top: 12px;
  border-radius: 13px;
  border: 1px solid #34415a;
}

#imageActions {
  display: none;
  margin-top: 8px;
}

.remove {
  background: #38191c;
  color: #ffb5b5;
  border: 1px solid #6b292f;
  padding: 8px 12px;
  border-radius: 9px;
}

.path {
  margin-top: 10px;
  padding: 11px;
  background: #0b1019;
  border-radius: 11px;
  color: #ffc928;
  font-size: 13px;
}

.send {
  width: 100%;
  border: 0;
  background: #ffc928;
  color: #111;
  padding: 15px;
  font-size: 16px;
  font-weight: 800;
  border-radius: 13px;
  margin-top: 11px;
}

.send:disabled {
  opacity: .55;
}

.status {
  color: #aebbd0;
  font-size: 14px;
  margin-top: 9px;
}

.answer {
  display: none;
  white-space: pre-wrap;
  line-height: 1.6;
  background: #101826;
}

.loadout {
  display: none;
}

.iconGrid {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 9px;
}

.unit {
  background: #0b1019;
  border: 1px solid #2b3850;
  border-radius: 13px;
  padding: 10px;
  text-align: center;
}

.unitIcon {
  width: 48px;
  height: 48px;
  margin: 0 auto 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #202b3e;
  font-size: 25px;
}

.unit b {
  display: block;
  font-size: 12px;
}

.unit span {
  font-size: 11px;
  color: #aebbd0;
}

.practice {
  display: none;
  border-color: #ffc928;
  background: #101826;
}

.practice h3 {
  margin-top: 0;
}

.step {
  background: #0b1019;
  border-radius: 11px;
  padding: 10px;
  margin: 7px 0;
}

.warn {
  font-size: 12px;
  color: #aebbd0;
  line-height: 1.45;
  margin-top: 10px;
}

footer {
  text-align: center;
  color: #68758a;
  font-size: 12px;
  padding: 15px;
}

@media(max-width:480px) {

  .iconGrid {
    grid-template-columns: repeat(2,1fr);
  }

  h1 {
    font-size: 24px;
  }

}

</style>

</head>

<body>

<div class="app">

<div class="hero">

<div class="badge">
AI STRATEGY + PRACTICE
</div>

<h1>
⚔️ CoC Battle AI
</h1>

<p>
TH1–TH18 strategy, screenshot vision,
loadout cards, attack path aur practice rehearsal.
</p>

</div>


<div class="card">

<div class="title">
1️⃣ Town Hall Select Karo
</div>

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

<div class="title">
2️⃣ Mode
</div>

<div class="modes">

<button
  class="mode active"
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
  class="mode"
  data-mode="war"
>
🏆 War Screenshot
</button>

<button
  class="mode"
  data-mode="base"
>
🏰 War Base Design
</button>

</div>

</div>


<div
  class="card"
  id="baseSection"
  style="display:none"
>

<div class="title">
🏰 TH4–TH18 War Base
</div>

<div class="modes">

<button
  class="mode baseType"
  data-type="Anti 3 Star"
>
🛡️ Anti 3-Star
</button>

<button
  class="mode baseType"
  data-type="Anti 2 Star"
>
⭐ Anti 2-Star
</button>

</div>

<p class="note">
Real Copy Base link sirf verified layout URL
available hone par use hoga.
</p>

</div>


<div
  class="card"
  id="screenSection"
>

<div class="title">
3️⃣ Base Screenshot
</div>

<label
  class="upload"
  for="file"
>

<strong>
📷 Screenshot Upload Karo
</strong>

<small>
Maximum 20 MB • automatic compression
</small>

</label>

<input
  id="file"
  type="file"
  accept="image/png,image/jpeg,image/webp"
>

<img id="preview">

<div id="imageActions">

<button
  class="remove"
  id="removeImage"
>
✕ Screenshot Remove
</button>

</div>

<div class="path">
📍 Entry → Funnel → Main Army → Core → Main Target
</div>

</div>


<div class="card">

<div class="title">
4️⃣ Question / Extra Details
</div>

<textarea
  id="message"
  placeholder="War plan batao. Hero/equipment/troop levels pata ho to yahan likho for better accuracy."
></textarea>

<button
  class="send"
  id="send"
>
⚔️ Strategy + Practice Plan
</button>

<div
  class="status"
  id="status"
></div>

</div>


<div
  class="loadout"
  id="loadout"
>

<div class="title">
🪖 Recommended Loadout
</div>

<div
  class="iconGrid"
  id="iconGrid"
></div>

<div class="warn">
Abhi fast symbolic troop/spell/hero icons use hote hain.
Real troop artwork ko baad me image assets ke saath map kiya ja sakta hai.
</div>

</div>


<div
  class="practice"
  id="practice"
>

<h3>
🎯 Practice Mode
</h3>

<div class="step">
① <b>Funnel rehearsal:</b>
AI ke clock positions dekhkar deployment order repeat karo.
</div>

<div class="step">
② <b>Main push:</b>
Entry → Funnel → Main Army → Core path ko rehearse karo.
</div>

<div class="step">
③ <b>Timing:</b>
Strategy ke TIMING section se spells aur hero abilities practice karo.
</div>

<div class="warn">
Screenshot se exact playable base game ke andar automatically recreate nahi hota.
Hidden traps, levels aur live pathing ki wajah se 100% result guarantee nahi hoti.
</div>

</div>


<div
  class="answer"
  id="answer"
></div>


<footer>
Strategy/practice assistant — game ko automatically control nahi karta.
</footer>

</div>


<script>

let selectedMode = "attack";
let selectedImage = null;
let baseType = "";

const fileInput =
  document.getElementById("file");

const preview =
  document.getElementById("preview");

const imageActions =
  document.getElementById("imageActions");

const statusBox =
  document.getElementById("status");

const answer =
  document.getElementById("answer");

const send =
  document.getElementById("send");

const loadout =
  document.getElementById("loadout");

const iconGrid =
  document.getElementById("iconGrid");

const practice =
  document.getElementById("practice");


document
.querySelectorAll(".mode[data-mode]")
.forEach(function(btn) {

  btn.addEventListener(
    "click",
    function() {

      document
      .querySelectorAll(".mode[data-mode]")
      .forEach(function(b) {
        b.classList.remove("active");
      });

      btn.classList.add("active");

      selectedMode =
        btn.dataset.mode;

      document
      .getElementById("baseSection")
      .style.display =
        selectedMode === "base"
        ? "block"
        : "none";

      document
      .getElementById("screenSection")
      .style.display =
        selectedMode === "base"
        ? "none"
        : "block";

    }
  );

});


document
.querySelectorAll(".baseType")
.forEach(function(btn) {

  btn.addEventListener(
    "click",
    function() {

      document
      .querySelectorAll(".baseType")
      .forEach(function(b) {
        b.classList.remove("active");
      });

      btn.classList.add("active");

      baseType =
        btn.dataset.type;

    }
  );

});


fileInput.addEventListener(
  "change",
  async function() {

    const file =
      fileInput.files[0];

    if (!file) {
      return;
    }

    if (
      file.size >
      20 * 1024 * 1024
    ) {

      alert(
        "Screenshot maximum 20 MB ka ho sakta hai."
      );

      fileInput.value = "";

      return;
    }

    statusBox.textContent =
      "🖼️ Screenshot optimize ho raha hai...";

    try {

      selectedImage =
        await optimizeImage(file);

      preview.src =
        selectedImage;

      preview.style.display =
        "block";

      imageActions.style.display =
        "block";

      statusBox.textContent =
        "✅ Screenshot ready";

    } catch (e) {

      selectedImage = null;

      fileInput.value = "";

      statusBox.textContent = "";

      alert(
        "Screenshot process nahi ho paya."
      );

    }

  }
);


function optimizeImage(file) {

  return new Promise(
    function(resolve, reject) {

      const reader =
        new FileReader();

      reader.onerror =
        reject;

      reader.onload =
        function(e) {

          const img =
            new Image();

          img.onerror =
            reject;

          img.onload =
            function() {

              const MAX = 1600;

              let w = img.width;
              let h = img.height;

              if (
                w > MAX ||
                h > MAX
              ) {

                const scale =
                  Math.min(
                    MAX / w,
                    MAX / h
                  );

                w =
                  Math.round(
                    w * scale
                  );

                h =
                  Math.round(
                    h * scale
                  );

              }

              const canvas =
                document.createElement(
                  "canvas"
                );

              canvas.width = w;
              canvas.height = h;

              const ctx =
                canvas.getContext(
                  "2d"
                );

              ctx.drawImage(
                img,
                0,
                0,
                w,
                h
              );

              const optimized =
                canvas.toDataURL(
                  "image/jpeg",
                  0.88
                );

              resolve(
                optimized
              );

            };

          img.src =
            e.target.result;

        };

      reader.readAsDataURL(
        file
      );

    }
  );

}


document
.getElementById("removeImage")
.addEventListener(
  "click",
  function(e) {

    e.preventDefault();

    selectedImage = null;

    fileInput.value = "";

    preview.src = "";

    preview.style.display =
      "none";

    imageActions.style.display =
      "none";

    statusBox.textContent = "";

  }
);


function emojiFor(
  name,
  type
) {

  const n =
    name.toLowerCase();

  if (type === "SPELL") {
    return "🧪";
  }

  if (type === "HERO") {
    return "👑";
  }

  if (n.includes("dragon")) {
    return "🐉";
  }

  if (n.includes("balloon")) {
    return "🎈";
  }

  if (n.includes("wizard")) {
    return "🧙";
  }

  if (n.includes("archer")) {
    return "🏹";
  }

  if (n.includes("barbarian")) {
    return "⚔️";
  }

  if (n.includes("giant")) {
    return "🛡️";
  }

  if (n.includes("healer")) {
    return "💫";
  }

  if (n.includes("miner")) {
    return "⛏️";
  }

  if (n.includes("hog")) {
    return "🐗";
  }

  if (n.includes("pekka")) {
    return "🤖";
  }

  return "🪖";

}


function escapeHtml(s) {

  return s.replace(
    /[&<>"']/g,
    function(c) {

      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[c];

    }
  );

}


function buildCards(text) {

  iconGrid.innerHTML = "";

  let count = 0;

  text
  .split("\\n")
  .forEach(function(line) {

    const match =
      line.match(
        /^\\[(UNIT|SPELL|HERO)\\]\\s*([^|]+)\\|?\\s*([^|]*)/i
      );

    if (!match) {
      return;
    }

    const type =
      match[1].toUpperCase();

    const name =
      match[2].trim();

    const info =
      match[3].trim();

    const card =
      document.createElement(
        "div"
      );

    card.className =
      "unit";

    card.innerHTML =
      '<div class="unitIcon">' +
      emojiFor(name, type) +
      '</div>' +
      '<b>' +
      escapeHtml(name) +
      '</b>' +
      '<span>' +
      escapeHtml(
        info || type
      ) +
      '</span>';

    iconGrid.appendChild(
      card
    );

    count++;

  });

  loadout.style.display =
    count
    ? "block"
    : "none";

}


send.addEventListener(
  "click",
  async function() {

    const th =
      document
      .getElementById("th")
      .value;

    let message =
      document
      .getElementById("message")
      .value
      .trim();


    if (
      selectedMode === "base"
    ) {

      if (!th) {

        alert(
          "Pehle Town Hall select karo."
        );

        return;
      }

      const thNumber =
        Number(
          th.replace(
            "TH",
            ""
          )
        );

      if (thNumber < 4) {

        alert(
          "War Base Design TH4 se TH18 ke liye hai."
        );

        return;
      }

      message =
        "Create a " +
        (baseType || "war") +
        " base design plan for " +
        th +
        ". " +
        message;

    }


    if (
      !message &&
      !selectedImage
    ) {

      alert(
        "Question likho ya screenshot upload karo."
      );

      return;
    }


    if (
      selectedImage &&
      !th
    ) {

      alert(
        "Screenshot analysis ke liye apna Town Hall select karo."
      );

      return;
    }


    if (
      selectedImage &&
      selectedMode === "attack"
    ) {

      const choice =
        confirm(
          "OK = WAR strategy\\nCancel = FARMING strategy"
        );

      selectedMode =
        choice
        ? "war"
        : "farming";

    }


    send.disabled = true;

    statusBox.textContent =
      selectedImage
      ? "🔍 Base screenshot analyze ho raha hai..."
      : "🤖 Strategy ban rahi hai...";

    answer.style.display =
      "none";

    loadout.style.display =
      "none";

    practice.style.display =
      "none";


    try {

      const response =
        await fetch(
          "/api/ask",
          {
            method: "POST",

            headers: {
              "content-type":
                "application/json"
            },

            body:
              JSON.stringify({
                message: message,
                mode: selectedMode,
                th: th,
                image: selectedImage
              })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.error ||
          "Request failed"
        );

      }


      answer.textContent =
        data.reply;

      answer.style.display =
        "block";


      buildCards(
        data.reply
      );


      if (
        selectedImage &&
        selectedMode === "war"
      ) {

        practice.style.display =
          "block";

      }


      statusBox.textContent =
        "✅ Strategy ready";


      answer.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });


    } catch (e) {

      statusBox.textContent =
        "❌ Error";

      answer.textContent =
        "Error: " +
        (
          e.message ||
          "Unknown error"
        );

      answer.style.display =
        "block";

    }


    send.disabled =
      false;

  }
);

</script>

</body>
</html>`;
