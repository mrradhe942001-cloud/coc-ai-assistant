const MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

const SYSTEM = `You are CoC Battle AI, a Clash of Clans strategy assistant.

Support Town Hall 1 through Town Hall 18 for attack and farming advice.

IMPORTANT RULES:
- Use only troops, spells, heroes, pets, siege machines and hero equipment actually available at the user's Town Hall.
- Never invent troops, spells, buildings, heroes or game mechanics.
- If you are uncertain about a game fact, say so instead of inventing it.
- Ask for Town Hall level when it is needed and not provided.
- Reply in simple Hinglish unless the user asks for another language.

ATTACK STRATEGY:
Give:
1. Recommended army with troop quantities.
2. Spells with quantities.
3. Heroes and pets when available.
4. Siege machine and Clan Castle recommendation when relevant.
5. Entry point using clock positions such as 12, 3, 6 or 9 o'clock.
6. Funnel instructions.
7. Exact deployment order.
8. Main army path through the base.
9. Spell placement and approximate timing.
10. Hero ability timing.
11. Important defense targets.
12. Backup plan if the main path changes.

FARMING:
Prioritize good loot, training efficiency and practical armies.
Explain which resources the strategy is useful for and how to deploy it.

SCREENSHOT ANALYSIS:
When a Clash of Clans base screenshot is supplied, inspect the visible layout.
Do not pretend to see a building if it is unclear.
Identify the likely Town Hall when possible.
Analyze important visible defenses and base compartments.
The selected goal will be WAR or FARMING.
Recommend an army appropriate for the player's Town Hall.
Describe deployment positions using a clock-face system.
Explain troop path like:
ENTRY -> FUNNEL -> MAIN ARMY -> CORE -> TOWN HALL / KEY TARGET.
Explain what to deploy, where to deploy it, and when.
Mention spell and hero ability timing.
If the screenshot is unclear, explicitly tell the user what cannot be identified.

WAR BASE DESIGNS:
War base design support is for TH4 through TH18.
Explain anti-2-star, anti-3-star or other requested layout concepts.
Never invent a Clash of Clans copy-layout URL.
Only display a copy link when a real verified link has been stored in the application.`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/ask") {
      try {
        if (!env.AI) {
          return json({ error: "Workers AI binding 'AI' nahi mila." }, 500);
        }

        const body = await request.json();
        const message = String(body.message || "").trim();
        const mode = String(body.mode || "attack");
        const th = String(body.th || "");
        const image = body.image || null;

        if (!message && !image) {
          return json({ error: "Message ya screenshot bhejo." }, 400);
        }

        let userPrompt =
          "Selected mode: " + mode +
          "\\nPlayer Town Hall: " + (th || "not provided") +
          "\\nUser message: " +
          (message || "Analyze the uploaded base screenshot.");

        if (image) {
          userPrompt +=
            "\\nA Clash of Clans base screenshot is attached." +
            "\\nAnalyze only what is actually visible." +
            "\\nUse clock positions for deployment." +
            "\\nExplain troop path, deployment order, spells and hero timing.";
        }

        const input = {
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 1400,
          temperature: 0.2
        };

        if (image) {
  const base64 = image.split(",")[1];
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
            "AI se response nahi mila."
        });
      } catch (error) {
        return json(
          { error: error?.message || "Unknown error" },
          500
        );
      }
    }

    return new Response(PAGE, {
      headers: { "content-type": "text/html; charset=UTF-8" }
    });
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=UTF-8" }
  });
}

const PAGE = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CoC Battle AI</title>

<style>
*{box-sizing:border-box}
body{margin:0;font-family:Arial,sans-serif;background:#080b12;color:#fff}
.app{max-width:760px;margin:auto;padding:18px}
.hero{background:linear-gradient(135deg,#182235,#101725);border:1px solid #2b3a55;border-radius:22px;padding:22px;margin-bottom:16px}
.hero h1{margin:0 0 7px;font-size:28px}
.hero p{margin:0;color:#aebbd0;line-height:1.5}
.badge{display:inline-block;background:#ffc928;color:#111;font-weight:bold;padding:6px 10px;border-radius:20px;font-size:12px;margin-bottom:12px}
.card{background:#111722;border:1px solid #273247;border-radius:18px;padding:15px;margin-bottom:14px}
.title{font-weight:bold;font-size:16px;margin-bottom:12px}
.modes{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.mode{border:1px solid #35445f;background:#182132;color:#fff;border-radius:13px;padding:12px 7px;font-weight:bold;cursor:pointer}
.mode.active{background:#ffc928;color:#111;border-color:#ffc928}
select,textarea{width:100%;background:#090d15;border:1px solid #35445f;color:white;border-radius:12px;padding:13px;font-size:15px}
textarea{min-height:105px;resize:vertical;margin-top:10px}
.upload{display:block;border:2px dashed #42516d;border-radius:15px;padding:18px;text-align:center;cursor:pointer;margin-top:10px;background:#0c111b}
.upload strong{display:block;margin-bottom:5px}
.upload small{color:#9cabc2}
#file{display:none}
#preview{display:none;width:100%;max-height:350px;object-fit:contain;margin-top:12px;border-radius:13px;border:1px solid #34415a}
.imageActions{display:none;margin-top:8px}
.remove{background:#38191c;color:#ffb5b5;border:1px solid #6b292f;padding:8px 12px;border-radius:9px}
.send{width:100%;border:0;background:#ffc928;color:#111;padding:15px;font-size:16px;font-weight:bold;border-radius:13px;cursor:pointer;margin-top:12px}
.send:disabled{opacity:.55}
.answer{display:none;white-space:pre-wrap;line-height:1.65;background:#101826;border:1px solid #2c3b56;border-radius:17px;padding:17px;margin-top:14px}
.status{color:#aebbd0;font-size:14px;margin-top:10px}
.path{margin-top:10px;padding:11px;background:#0b1019;border-radius:11px;color:#ffc928;font-size:13px}
.note{font-size:13px;color:#9daac0;line-height:1.5;margin-top:10px}
footer{text-align:center;color:#68758a;font-size:12px;padding:15px}
@media(max-width:480px){.hero h1{font-size:24px}}
</style>
</head>

<body>
<div class="app">

<div class="hero">
<div class="badge">AI STRATEGY ASSISTANT</div>
<h1>⚔️ CoC Battle AI</h1>
<p>TH1–TH18 attack & farming strategy, screenshot analysis, deployment path and TH4–TH18 war-base planning.</p>
</div>

<div class="card">
<div class="title">1️⃣ Town Hall Select Karo</div>
<select id="th">
<option value="">Town Hall select karo</option>
<option>TH1</option><option>TH2</option><option>TH3</option>
<option>TH4</option><option>TH5</option><option>TH6</option>
<option>TH7</option><option>TH8</option><option>TH9</option>
<option>TH10</option><option>TH11</option><option>TH12</option>
<option>TH13</option><option>TH14</option><option>TH15</option>
<option>TH16</option><option>TH17</option><option>TH18</option>
</select>
</div>

<div class="card">
<div class="title">2️⃣ Aapko Kya Chahiye?</div>
<div class="modes">
<button class="mode active" data-mode="attack">⚔️ Attack</button>
<button class="mode" data-mode="farming">💰 Farming</button>
<button class="mode" data-mode="war">🏆 War Screenshot</button>
<button class="mode" data-mode="base">🏰 War Base Design</button>
</div>
</div>

<div class="card" id="baseSection" style="display:none">
<div class="title">🏰 TH4–TH18 War Base Designs</div>
<div class="modes">
<button class="mode baseType" data-type="Anti 3 Star">🛡️ Anti 3-Star</button>
<button class="mode baseType" data-type="Anti 2 Star">⭐ Anti 2-Star</button>
</div>
<div class="note">
Real in-game Copy Base link sirf verified Clash of Clans layout link available hone par dikhaya jayega.
</div>
</div>

<div class="card" id="screenSection">
<div class="title">3️⃣ Base Screenshot (Optional)</div>

<label class="upload" for="file">
<strong>📷 Screenshot Upload Karo</strong>
<small>Maximum 20 MB • large image automatically optimize hogi</small>
</label>

<input id="file" type="file" accept="image/png,image/jpeg,image/webp">

<img id="preview">

<div class="imageActions" id="imageActions">
<button class="remove" id="removeImage">✕ Screenshot Remove</button>
</div>

<div class="path">
📍 Analysis: Entry → Funnel → Main Army → Core → Main Target
</div>
</div>

<div class="card">
<div class="title">4️⃣ Apna Question Likho</div>

<textarea id="message"
placeholder="Example: Is TH12 base ko 3 star karne ke liye army aur deployment path batao..."></textarea>

<button class="send" id="send">⚔️ Strategy Banao</button>
<div class="status" id="status"></div>
</div>

<div class="answer" id="answer"></div>

<footer>
Strategy assistant only — Clash of Clans ko automatically control nahi karta.
</footer>

</div>

<script>
let selectedMode = "attack";
let selectedImage = null;
let baseType = "";

const modeButtons = document.querySelectorAll(".mode[data-mode]");
const baseSection = document.getElementById("baseSection");
const screenSection = document.getElementById("screenSection");
const fileInput = document.getElementById("file");
const preview = document.getElementById("preview");
const imageActions = document.getElementById("imageActions");
const statusBox = document.getElementById("status");
const answer = document.getElementById("answer");
const send = document.getElementById("send");

modeButtons.forEach(function(btn){
  btn.addEventListener("click",function(){
    modeButtons.forEach(function(b){b.classList.remove("active")});
    btn.classList.add("active");
    selectedMode = btn.dataset.mode;

    if(selectedMode === "base"){
      baseSection.style.display = "block";
      screenSection.style.display = "none";
    }else{
      baseSection.style.display = "none";
      screenSection.style.display = "block";
    }
  });
});

document.querySelectorAll(".baseType").forEach(function(btn){
  btn.addEventListener("click",function(){
    document.querySelectorAll(".baseType").forEach(function(b){
      b.classList.remove("active");
    });
    btn.classList.add("active");
    baseType = btn.dataset.type;
  });
});

/* 20 MB upload + automatic image optimization */
fileInput.addEventListener("change", async function(){
  const file = fileInput.files[0];
  if(!file) return;

  const MAX_UPLOAD = 20 * 1024 * 1024;

  if(file.size > MAX_UPLOAD){
    alert("Screenshot maximum 20 MB ka ho sakta hai.");
    fileInput.value = "";
    return;
  }

  statusBox.textContent = "🖼️ Screenshot optimize ho raha hai...";

  try{
    selectedImage = await optimizeImage(file);

    preview.src = selectedImage;
    preview.style.display = "block";
    imageActions.style.display = "block";

    statusBox.textContent = "✅ Screenshot ready";
  }catch(err){
    selectedImage = null;
    fileInput.value = "";
    statusBox.textContent = "";
    alert("Screenshot process nahi ho paya. Dusri image try karo.");
  }
});

function optimizeImage(file){
  return new Promise(function(resolve,reject){
    const reader = new FileReader();

    reader.onerror = reject;

    reader.onload = function(e){
      const img = new Image();

      img.onerror = reject;

      img.onload = function(){
        const MAX_SIDE = 1600;

        let width = img.width;
        let height = img.height;

        if(width > MAX_SIDE || height > MAX_SIDE){
          const scale = Math.min(
            MAX_SIDE / width,
            MAX_SIDE / height
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

        /* JPEG 88% keeps base details readable while reducing size */
        const optimized = canvas.toDataURL(
          "image/jpeg",
          0.88
        );

        resolve(optimized);
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

document.getElementById("removeImage").addEventListener("click",function(e){
  e.preventDefault();

  selectedImage = null;
  fileInput.value = "";
  preview.src = "";
  preview.style.display = "none";
  imageActions.style.display = "none";
  statusBox.textContent = "";
});

send.addEventListener("click",async function(){

  const th = document.getElementById("th").value;
  let message = document.getElementById("message").value.trim();

  if(selectedMode === "base"){
    if(!th){
      alert("Pehle Town Hall select karo.");
      return;
    }

    const n = Number(th.replace("TH",""));

    if(n < 4){
      alert("War Base Design TH4 se TH18 ke liye hai.");
      return;
    }

    message =
      "Create a " + (baseType || "war") +
      " base design plan for " + th +
      ". Explain Town Hall placement, major defense placement, compartments, traps and weaknesses. " +
      message;
  }

  if(!message && !selectedImage){
    alert("Question likho ya screenshot upload karo.");
    return;
  }

  if(selectedImage && !th){
    alert("Screenshot analysis ke liye apna Town Hall select karo.");
    return;
  }

  if(selectedImage && selectedMode === "attack"){
    const choice = confirm(
      "Screenshot ke liye OK = WAR strategy\\nCancel = FARMING strategy"
    );

    selectedMode = choice ? "war" : "farming";
  }

  send.disabled = true;

  statusBox.textContent =
    selectedImage
      ? "🔍 Base screenshot analyze ho raha hai..."
      : "🤖 Strategy ban rahi hai...";

  answer.style.display = "none";
  answer.textContent = "";

  try{
    const response = await fetch("/api/ask",{
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify({
        message:message,
        mode:selectedMode,
        th:th,
        image:selectedImage
      })
    });

    const data = await response.json();

    if(!response.ok){
      throw new Error(data.error || "Request failed");
    }

    answer.textContent = data.reply;
    answer.style.display = "block";
    statusBox.textContent = "✅ Strategy ready";

    answer.scrollIntoView({
      behavior:"smooth",
      block:"start"
    });

  }catch(err){
    statusBox.textContent = "❌ Error";
    answer.textContent =
      "Error: " + (err.message || "Unknown error");
    answer.style.display = "block";
  }

  send.disabled = false;
});
</script>

</body>
</html>`;
