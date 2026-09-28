const MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

/*
  CoC Battle AI V4
  - TH-aware troop/spell allowlists
  - Hero availability + attack-slot validation
  - Vision strategy with automatic retry
  - Better numbered visual attack map
  - Base Design mode with only verified stored links
  - Optional real icon URLs via ICON_URLS (no unstable hotlinks)
*/

const TROOPS = [
  "Barbarian","Archer","Giant","Goblin","Wall Breaker","Balloon","Wizard","Healer",
  "Dragon","P.E.K.K.A","Baby Dragon","Miner","Electro Dragon","Yeti","Dragon Rider",
  "Electro Titan","Root Rider","Thrower","Meteor Golem","Minion","Hog Rider","Valkyrie",
  "Golem","Witch","Lava Hound","Bowler","Ice Golem","Headhunter","Apprentice Warden","Druid"
];

const TROOP_MIN_TH = {
  "Barbarian":1,"Archer":2,"Giant":3,"Goblin":3,"Wall Breaker":3,"Balloon":4,"Wizard":5,
  "Healer":6,"Dragon":7,"P.E.K.K.A":8,"Minion":7,"Hog Rider":7,"Valkyrie":8,"Golem":8,
  "Witch":9,"Lava Hound":9,"Baby Dragon":9,"Bowler":10,"Miner":10,"Ice Golem":11,
  "Electro Dragon":11,"Yeti":12,"Headhunter":12,"Dragon Rider":13,"Apprentice Warden":13,
  "Electro Titan":14,"Druid":14,"Root Rider":15,"Thrower":17,"Meteor Golem":17
};

const SPELLS = [
  "Lightning Spell","Healing Spell","Rage Spell","Jump Spell","Freeze Spell","Clone Spell",
  "Invisibility Spell","Recall Spell","Poison Spell","Earthquake Spell","Haste Spell",
  "Skeleton Spell","Bat Spell","Overgrowth Spell","Revive Spell"
];

const SPELL_MIN_TH = {
  "Lightning Spell":5,"Healing Spell":6,"Rage Spell":7,"Poison Spell":8,"Earthquake Spell":8,
  "Jump Spell":9,"Freeze Spell":9,"Haste Spell":9,"Skeleton Spell":9,"Clone Spell":10,
  "Bat Spell":10,"Invisibility Spell":11,"Overgrowth Spell":12,"Recall Spell":13,"Revive Spell":15
};

const HERO_MIN_TH = {
  "Barbarian King":4,
  "Archer Queen":8,
  "Minion Prince":9,
  "Grand Warden":11,
  "Royal Champion":13,
  "Dragon Duke":15
};

const HEROES = Object.keys(HERO_MIN_TH);

const SIEGES = [
  "None","Wall Wrecker","Battle Blimp","Stone Slammer","Siege Barracks",
  "Log Launcher","Flame Flinger","Battle Drill"
];

/*
  Add ORIGINAL official/permitted Supercell/Fan Kit image asset URLs here.
  V4 deliberately does NOT bundle copied third-party image files or unstable hotlinks.
  When URLs are populated, the UI renders the original image; otherwise it uses a text fallback.
*/
const ICON_URLS = {
  troops: {},
  spells: {},
  heroes: {}
};

/*
  Only VERIFIED layout links belong here.
  These TH12 examples are from an official Supercell esports post.
  Do not invent links for other TH levels.
*/
const VERIFIED_BASES = {
  TH12: [
    {
      name: "MCES Eryam War Base",
      type: "War Base",
      source: "Official Supercell esports archive",
      link: "https://link.clashofclans.com/fr?action=OpenLayout&id=TH12%3AWB%3AAAAAHgAAAAFy_S4-CzVCnBGBJfbJGxmp"
    },
    {
      name: "MCES Hugo Stigliz War Base",
      type: "War Base",
      source: "Official Supercell esports archive",
      link: "https://link.clashofclans.com/fr?action=OpenLayout&id=TH12%3AWB%3AAAAAHgAAAAFy0S-1mvTrB4LeFK4DCbE-"
    },
    {
      name: "MCES Lenaide War Base",
      type: "War Base",
      source: "Official Supercell esports archive",
      link: "https://link.clashofclans.com/fr?action=OpenLayout&id=TH12%3AWB%3AAAAAIwAAAAFsY9C7itjwWwblQ3twEr3F"
    }
  ]
};

function thNumber(v) {
  const n = Number(String(v || "").replace(/\D/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function allowedTroops(th) {
  const n = thNumber(th);
  return TROOPS.filter(x => (TROOP_MIN_TH[x] || 99) <= n);
}

function allowedSpells(th) {
  const n = thNumber(th);
  return SPELLS.filter(x => (SPELL_MIN_TH[x] || 99) <= n);
}

function availableHeroes(th) {
  const n = thNumber(th);
  return HEROES.filter(x => HERO_MIN_TH[x] <= n);
}

function heroSlotCount(th) {
  // Conservative progression for this guide UI; never exceeds the game's current max of 4.
  const count = availableHeroes(th).length;
  return Math.min(4, count);
}

function boxSchema(label) {
  return {
    type:"object",
    properties:{
      x:{type:"number",minimum:0,maximum:100},
      y:{type:"number",minimum:0,maximum:100},
      width:{type:"number",minimum:4,maximum:50},
      height:{type:"number",minimum:4,maximum:50},
      label:{type:"string",enum:[label]}
    },
    required:["x","y","width","height","label"]
  };
}

function schemaFor(th) {
  const troops = allowedTroops(th);
  const spells = allowedSpells(th);
  const heroes = availableHeroes(th);

  return {
    type:"object",
    properties:{
      title:{type:"string"},
      baseRead:{type:"string"},
      strategyReason:{type:"string"},
      confidence:{type:"string",enum:["high","medium","low"]},
      army:{
        type:"array",minItems:1,
        items:{
          type:"object",
          properties:{
            name:{type:"string",enum:troops},
            qty:{type:"integer",minimum:1,maximum:120},
            role:{type:"string"}
          },
          required:["name","qty","role"]
        }
      },
      spells:{
        type:"array",
        items:{
          type:"object",
          properties:{
            name:{type:"string",enum:spells.length ? spells : ["Lightning Spell"]},
            qty:{type:"integer",minimum:1,maximum:20},
            role:{type:"string"}
          },
          required:["name","qty","role"]
        }
      },
      heroes:{
        type:"array",
        items:{
          type:"object",
          properties:{
            name:{type:"string",enum:heroes.length ? heroes : ["Barbarian King"]},
            role:{type:"string"},
            ability:{type:"string"}
          },
          required:["name","role","ability"]
        }
      },
      siege:{
        type:"object",
        properties:{
          name:{type:"string",enum:SIEGES},
          clanCastle:{type:"string"}
        },
        required:["name","clanCastle"]
      },
      map:{
        type:"object",
        properties:{
          entry:boxSchema("1 ENTRY"),
          funnelA:boxSchema("2 FUNNEL LEFT"),
          funnelB:boxSchema("3 FUNNEL RIGHT"),
          main:boxSchema("4 MAIN ARMY"),
          core:boxSchema("5 CORE"),
          target:boxSchema("6 TARGET"),
          spellZones:{
            type:"array",
            items:{
              type:"object",
              properties:{
                x:{type:"number",minimum:0,maximum:100},
                y:{type:"number",minimum:0,maximum:100},
                width:{type:"number",minimum:4,maximum:50},
                height:{type:"number",minimum:4,maximum:50},
                label:{type:"string"}
              },
              required:["x","y","width","height","label"]
            }
          }
        },
        required:["entry","funnelA","funnelB","main","core","target","spellZones"]
      },
      deployment:{
        type:"array",minItems:1,
        items:{
          type:"object",
          properties:{step:{type:"integer"},text:{type:"string"}},
          required:["step","text"]
        }
      },
      timing:{type:"array",items:{type:"string"}},
      backup:{type:"array",items:{type:"string"}},
      practice:{type:"array",items:{type:"string"}},
      warnings:{type:"array",items:{type:"string"}}
    },
    required:[
      "title","baseRead","strategyReason","confidence","army","spells","heroes","siege",
      "map","deployment","timing","backup","practice","warnings"
    ]
  };
}

function json(data,status=200) {
  return new Response(JSON.stringify(data),{
    status,
    headers:{"content-type":"application/json; charset=UTF-8"}
  });
}

function imageBytes(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") return null;
  const comma = dataUrl.indexOf(",");
  if (comma < 0) return null;
  const binary = atob(dataUrl.slice(comma+1));
  const bytes = new Uint8Array(binary.length);
  for (let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
  return [...bytes];
}

function extractPlan(result) {
  if (!result) return null;
  let v = result.response ?? result.result ?? result;
  if (v && typeof v === "object") return v;
  if (typeof v !== "string") return null;
  let s=v.trim().replace(/^```json\s*/i,"").replace(/^```\s*/,"").replace(/\s*```$/,"").trim();
  try { return JSON.parse(s); } catch {}
  const a=s.indexOf("{"), b=s.lastIndexOf("}");
  if (a>=0 && b>a) { try { return JSON.parse(s.slice(a,b+1)); } catch {} }
  return null;
}

function validatePlan(plan,th) {
  if (!plan || typeof plan!=="object") return {ok:false,error:"JSON plan missing"};
  const troops=allowedTroops(th), spells=allowedSpells(th), heroes=availableHeroes(th);
  if (!Array.isArray(plan.army) || !plan.army.length) return {ok:false,error:"Army empty"};
  for (const u of plan.army) {
    if (!troops.includes(u?.name)) return {ok:false,error:"Invalid troop "+String(u?.name||"")};
    if (!Number.isInteger(u.qty)||u.qty<1) return {ok:false,error:"Invalid troop quantity"};
  }
  for (const s of plan.spells||[]) {
    if (!spells.includes(s?.name)) return {ok:false,error:"Invalid spell "+String(s?.name||"")};
  }
  const heroNames=(plan.heroes||[]).map(h=>h?.name).filter(Boolean);
  for (const h of heroNames) if (!heroes.includes(h)) return {ok:false,error:"Unavailable hero "+h};
  const expected=heroSlotCount(th);
  if (heroes.length && heroNames.length < expected) {
    return {ok:false,error:`Hero plan incomplete: expected ${expected} attacking hero slot(s), got ${heroNames.length}`};
  }
  if (new Set(heroNames).size !== heroNames.length) return {ok:false,error:"Duplicate hero"};
  if (!plan.map?.entry || !plan.map?.funnelA || !plan.map?.funnelB || !plan.map?.main || !plan.map?.core || !plan.map?.target)
    return {ok:false,error:"Visual map incomplete"};
  if (!Array.isArray(plan.deployment)||!plan.deployment.length) return {ok:false,error:"Deployment empty"};
  return {ok:true};
}

async function generatePlan(env,body,correction="") {
  const th=String(body.th||"").trim();
  const mode=String(body.mode||"war").trim();
  const troops=allowedTroops(th);
  const spells=allowedSpells(th);
  const heroes=availableHeroes(th);
  const slots=heroSlotCount(th);

  const prompt=`
You are CoC Battle AI, a careful Clash of Clans guide.

Town Hall: ${th}
Mode: ${mode}
Player notes: ${String(body.message||"None")}

Allowed troops: ${troops.join(", ")}
Allowed spells: ${spells.join(", ") || "none"}
Available heroes: ${heroes.join(", ") || "none"}
Attacking hero slots to fill: ${slots}

STRICT RULES:
- Army must never be empty.
- Use only exact allowed troop and spell names.
- Do not invent or merge names.
- If hero slots = ${slots}, return exactly ${slots} distinct available heroes when ${slots}>0.
- Give a complete practical composition, not just key units.
- Inspect the actual screenshot when supplied.
- Never pretend an unclear building is certain.
- Strategy must prioritize CURRENT 2026-valid units and tactics available in the allowed lists; do not default to nostalgic/old armies merely because they were historically common.
- Choose the army from the actual visible base geometry and defenses, not Town Hall alone.
- Every visual zone is a BOX with x, y, width and height in percentages (0-100).
- x/y are the TOP-LEFT of the box.
- ENTRY box must cover the real outside deployment zone.
- FUNNEL LEFT and FUNNEL RIGHT boxes must cover the two clearing zones that shape the intended path.
- MAIN ARMY box must cover the real main deployment zone at the edge.
- CORE box must cover the important inner compartment the army should reach.
- TARGET box must tightly cover the Town Hall or highest-value visible objective.
- Spell-zone boxes must cover meaningful placement areas on the intended path.
- Do not put boxes randomly or over irrelevant empty space.
- Deployment text must correspond exactly to:
  1 ENTRY, 2 FUNNEL LEFT, 3 FUNNEL RIGHT, 4 MAIN ARMY, 5 CORE, 6 TARGET.
- Do not guarantee 3 stars.
${correction ? `Previous result failed validation: ${correction}. Return a corrected result.` : ""}
`;

  const input={
    messages:[
      {role:"system",content:"Return a precise non-empty Clash of Clans strategy matching the JSON schema. Never invent unit names."},
      {role:"user",content:prompt}
    ],
    guided_json:schemaFor(th),
    max_tokens:3500,
    temperature:0.1
  };

  if (body.image) {
    const bytes=imageBytes(body.image);
    if (!bytes?.length) throw new Error("Screenshot data invalid");
    input.image=bytes;
  }

  return extractPlan(await env.AI.run(MODEL,input));
}

export default {
  async fetch(request,env) {
    const url=new URL(request.url);

    if (request.method==="GET" && url.pathname==="/api/base-designs") {
      const th=url.searchParams.get("th")||"";
      return json({
        th,
        designs:VERIFIED_BASES[th]||[],
        note:(VERIFIED_BASES[th]||[]).length
          ? "Only stored verified links are shown."
          : "Is Town Hall ke liye abhi koi verified Copy Base link stored nahi hai."
      });
    }

    if (request.method==="POST" && url.pathname==="/api/ask") {
      try {
        if (!env.AI) return json({error:"Workers AI binding 'AI' missing hai."},500);
        const body=await request.json();
        const th=String(body.th||"").trim();
        if (!thNumber(th)) return json({error:"Town Hall select karo."},400);
        if (String(body.mode||"war")==="war" && !body.image)
          return json({error:"War Screenshot mode me screenshot upload karo."},400);

        let plan=await generatePlan(env,body);
        let check=validatePlan(plan,th);
        if (!check.ok) {
          plan=await generatePlan(env,body,check.error);
          check=validatePlan(plan,th);
        }
        if (!check.ok) return json({error:"AI validation failed: "+check.error},422);

        return json({
          ok:true,
          plan,
          heroInfo:{
            available:availableHeroes(th),
            slots:heroSlotCount(th)
          },
          iconUrls:ICON_URLS
        });
      } catch(e) {
        return json({error:e?.message||"Strategy generate nahi ho payi."},500);
      }
    }

    return new Response(PAGE,{headers:{"content-type":"text/html; charset=UTF-8"}});
  }
};

const PAGE = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CoC Battle AI V4</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#070b12;color:#f5f7fb;font-family:Arial,sans-serif}
.app{max-width:850px;margin:auto;padding:14px}.card{background:#111827;border:1px solid #28364e;border-radius:18px;padding:15px;margin-bottom:12px}
.hero{background:linear-gradient(135deg,#192640,#0c1423)}.badge{display:inline-block;background:#ffd12f;color:#111;padding:6px 10px;border-radius:20px;font-size:11px;font-weight:900}
h1{margin:9px 0 5px}h2{margin-top:0}.sub{color:#9eabc0;font-size:13px}.title{display:block;font-weight:800;margin-bottom:8px}
select,textarea,button{width:100%;border:1px solid #34435e;background:#151f31;color:white;border-radius:12px;padding:12px;font-size:14px}
textarea{min-height:90px}.modes{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.mode.active,.go,.copy{background:#ffd12f;color:#111;font-weight:900;border:0}
.upload{display:block;text-align:center;border:2px dashed #40516f;border-radius:14px;padding:18px;cursor:pointer}#file{display:none}
#previewBox{display:none;position:relative;margin-top:12px;overflow:hidden;border-radius:14px}#preview{width:100%;display:block}#attackMap{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.go{margin-top:10px}.go:disabled{opacity:.55}.status{margin-top:10px;color:#b2bfd1;font-size:13px}#result,#designs{display:none}
.section{margin-top:20px}.section h3{color:#ffd12f;margin:0 0 10px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.unit,.design{background:#0a1220;border:1px solid #293850;border-radius:13px;padding:10px}.unit{text-align:center}
.icon{width:54px;height:54px;margin:0 auto 7px;display:flex;align-items:center;justify-content:center;border-radius:12px;background:#202b3d;overflow:hidden;font-size:12px;font-weight:800}
.icon img{width:100%;height:100%;object-fit:cover}.name{font-weight:800}.qty{color:#ffd12f;font-size:18px;font-weight:900;margin-top:3px}.role{color:#a8b5c7;font-size:11px;margin-top:5px;line-height:1.35}
.step{background:#0a1220;border-left:3px solid #ffd12f;padding:10px;margin:7px 0;border-radius:8px;line-height:1.45}
.road{background:#071523;border:1px solid #21465c;color:#70e8ff;border-radius:11px;padding:12px;font-weight:800}.warning{color:#ffbd75}
.copy{display:block;text-decoration:none;text-align:center;border-radius:10px;padding:10px;margin-top:10px}.legal{font-size:11px;color:#7f8da3;line-height:1.4;margin:18px 2px}
@media(max-width:520px){.grid{grid-template-columns:repeat(2,1fr)}.modes{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="app">
<div class="card hero"><div class="badge">V4 • 2026 WAR STRATEGY</div><h1>⚔️ CoC Battle AI</h1><div class="sub">2026 Strategy • Original-asset ready • Box Attack Map • Base Designs</div></div>

<div class="card"><label class="title">1️⃣ Town Hall</label><select id="th"><option value="">Town Hall select karo</option>${Array.from({length:18},(_,i)=>`<option>TH${i+1}</option>`).join("")}</select></div>

<div class="card"><label class="title">2️⃣ Mode</label><div class="modes">
<button class="mode" data-mode="attack">⚔️ Attack</button>
<button class="mode active" data-mode="war">🏆 War Screenshot</button><button class="mode" data-mode="base">🏰 Base Design</button>
</div></div>

<div id="battleInputs">
<div class="card"><label class="title">3️⃣ Base Screenshot</label><label class="upload" for="file">📷 Upload Screenshot<br><span class="sub">PNG / JPG / WebP • Max 20MB • Auto Compress</span></label>
<input id="file" type="file" accept="image/png,image/jpeg,image/webp"><div id="previewBox"><img id="preview"><canvas id="attackMap"></canvas></div></div>
<div class="card"><label class="title">4️⃣ Extra Details</label><textarea id="message" placeholder="Hero levels, equipment, troop levels..."></textarea>
<button id="go" class="go">⚔️ Analyze + Build Strategy</button><div id="status" class="status"></div></div>
</div>

<div id="designs" class="card"><h2>🏰 Verified Base Designs</h2><div id="designList"></div><div id="designNote" class="sub"></div></div>

<div id="result" class="card"><h2 id="planTitle"></h2><div id="confidence" class="sub"></div>
<div class="section"><h3>🔍 Base Analysis</h3><div id="baseRead"></div></div>
<div class="section"><h3>🧠 Strategy</h3><div id="reason"></div></div>
<div class="section"><h3>🪖 Complete Army</h3><div id="army" class="grid"></div></div>
<div class="section"><h3>🧪 Spells</h3><div id="spells" class="grid"></div></div>
<div class="section"><h3>👑 Attacking Heroes</h3><div id="heroSummary" class="sub"></div><div id="heroes" class="grid"></div></div>
<div class="section"><h3>🚜 Siege + Clan Castle</h3><div id="siege"></div></div>
<div class="section"><h3>🗺️ Numbered Roadmap</h3><div class="road">1 ENTRY → 2 FUNNEL LEFT → 3 FUNNEL RIGHT → 4 MAIN ARMY → 5 CORE → 6 TARGET</div></div>
<div class="section"><h3>🚀 Deployment</h3><div id="deployment"></div></div>
<div class="section"><h3>⏱️ Timing</h3><div id="timing"></div></div>
<div class="section"><h3>🔁 Backup</h3><div id="backup"></div></div>
<div class="section"><h3>🎯 Practice</h3><div id="practice"></div></div>
<div id="warnings" class="section warning"></div></div>

<div class="card"><b>🎨 Original Icon Assets</b><div class="sub">V4 is ready for original permitted Supercell/Fan Kit troop, spell, hero and siege images. No random third-party hotlinks are bundled.</div></div>
<div class="legal">This material is unofficial and is not endorsed by Supercell. Clash of Clans and related assets belong to Supercell. Fan-content use should follow Supercell's Fan Content Policy.</div>
</div>

<script>
const $=id=>document.getElementById(id);
const th=$("th"),file=$("file"),preview=$("preview"),previewBox=$("previewBox"),mapCanvas=$("attackMap"),message=$("message"),go=$("go"),status=$("status"),result=$("result"),designs=$("designs");
let mode="war",selectedImage=null,lastMap=null,icons={troops:{},spells:{},heroes:{}};

document.querySelectorAll(".mode").forEach(b=>b.onclick=async()=>{
 document.querySelectorAll(".mode").forEach(x=>x.classList.remove("active"));b.classList.add("active");mode=b.dataset.mode;
 if(mode==="base"){ $("battleInputs").style.display="none";result.style.display="none";await loadDesigns(); }
 else{$("battleInputs").style.display="block";designs.style.display="none";}
});
th.onchange=()=>{if(mode==="base")loadDesigns()};

async function loadDesigns(){
 if(!th.value){alert("Town Hall select karo.");return}
 designs.style.display="block";$("designList").innerHTML="Loading...";
 const r=await fetch("/api/base-designs?th="+encodeURIComponent(th.value)),d=await r.json();
 $("designList").innerHTML=(d.designs||[]).map(x=>'<div class="design"><b>'+esc(x.name)+'</b><div class="sub">'+esc(x.type)+' • '+esc(x.source)+'</div><a class="copy" href="'+escAttr(x.link)+'">Open / Copy Base</a></div>').join("") || '<div class="design">Is TH ke liye verified layout abhi stored nahi hai.</div>';
 $("designNote").textContent=d.note||"";
}

file.onchange=async()=>{
 const f=file.files[0];if(!f)return;if(f.size>20*1024*1024){alert("Maximum 20MB");return}
 status.textContent="🖼️ Optimizing...";
 selectedImage=await compress(f);preview.onload=()=>{previewBox.style.display="block";if(lastMap)drawMap(lastMap)};preview.src=selectedImage;status.textContent="✅ Screenshot ready";
};

function compress(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=e=>{const im=new Image();im.onload=()=>{let w=im.width,h=im.height,M=1600;if(w>M||h>M){const s=Math.min(M/w,M/h);w=Math.round(w*s);h=Math.round(h*s)}const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(im,0,0,w,h);res(c.toDataURL("image/jpeg",.88))};im.onerror=rej;im.src=e.target.result};r.onerror=rej;r.readAsDataURL(f)})}

go.onclick=async()=>{
 if(!th.value){alert("Town Hall select karo.");return}if(mode==="war"&&!selectedImage){alert("Screenshot upload karo.");return}
 go.disabled=true;result.style.display="none";status.textContent="🔍 Analyzing...";
 try{
  const r=await fetch("/api/ask",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({th:th.value,mode,message:message.value,image:selectedImage})});
  const d=await r.json();if(!r.ok)throw new Error(d.error||"Request failed");icons=d.iconUrls||icons;render(d.plan,d.heroInfo);status.textContent="✅ Strategy ready";
 }catch(e){status.textContent="❌ "+e.message}finally{go.disabled=false}
};

function icon(kind,name){const url=icons?.[kind]?.[name];return url?'<img src="'+escAttr(url)+'" alt="'+escAttr(name)+'">':esc(name.split(" ").map(x=>x[0]).join("").slice(0,3))}
function card(kind,name,qty,role){return '<div class="unit"><div class="icon">'+icon(kind,name)+'</div><div class="name">'+esc(name)+'</div><div class="qty">'+esc(qty||"")+'</div><div class="role">'+esc(role||"")+'</div></div>'}
function steps(a){return(a||[]).map(x=>'<div class="step">'+esc(x)+'</div>').join("")}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escAttr(v){return esc(v)}

function render(p,hi){
 $("planTitle").textContent=p.title||"Attack Plan";$("confidence").textContent="Confidence: "+(p.confidence||"unknown");$("baseRead").textContent=p.baseRead||"";$("reason").textContent=p.strategyReason||"";
 $("army").innerHTML=(p.army||[]).map(x=>card("troops",x.name,"×"+x.qty,x.role)).join("");
 $("spells").innerHTML=(p.spells||[]).map(x=>card("spells",x.name,"×"+x.qty,x.role)).join("");
 $("heroes").innerHTML=(p.heroes||[]).map(x=>card("heroes",x.name,"",x.role+" • "+x.ability)).join("");
 $("heroSummary").textContent="Available: "+(hi?.available||[]).join(", ")+" | Attack slots: "+(hi?.slots??0);
 $("siege").textContent=(p.siege?.name||"None")+" | CC: "+(p.siege?.clanCastle||"Not specified");
 $("deployment").innerHTML=(p.deployment||[]).map(x=>'<div class="step"><b>'+esc(x.step)+'.</b> '+esc(x.text)+'</div>').join("");
 $("timing").innerHTML=steps(p.timing);$("backup").innerHTML=steps(p.backup);$("practice").innerHTML=steps(p.practice);$("warnings").innerHTML=(p.warnings||[]).map(x=>"⚠️ "+esc(x)).join("<br><br>");
 lastMap=p.map;result.style.display="block";requestAnimationFrame(()=>drawMap(lastMap));result.scrollIntoView({behavior:"smooth"});
}

function boxPx(p,w,h){
 return{
  x:Number(p.x)/100*w,
  y:Number(p.y)/100*h,
  width:Number(p.width||12)/100*w,
  height:Number(p.height||10)/100*h
 }
}
function drawMap(m){
 if(!m||!selectedImage)return;
 const w=preview.clientWidth,h=preview.clientHeight;if(!w||!h)return;
 const d=devicePixelRatio||1;mapCanvas.width=Math.round(w*d);mapCanvas.height=Math.round(h*d);
 mapCanvas.style.width=w+"px";mapCanvas.style.height=h+"px";
 const c=mapCanvas.getContext("2d");c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);
 [
  [m.entry,"#00ff8c"],
  [m.funnelA,"#ffd12f"],
  [m.funnelB,"#ffd12f"],
  [m.main,"#00e5ff"],
  [m.core,"#ff9f43"],
  [m.target,"#ff4f70"]
 ].forEach(v=>zoneBox(c,v[0],w,h,v[1]));
 (m.spellZones||[]).forEach(v=>zoneBox(c,v,w,h,"#c879ff"));
}
function zoneBox(c,p,w,h,col){
 if(!p)return;
 const b=boxPx(p,w,h),lab=String(p.label||"");
 c.save();
 c.fillStyle=hexAlpha(col,.18);
 c.strokeStyle=col;
 c.lineWidth=3;
 roundRect(c,b.x,b.y,b.width,b.height,8);
 c.fill();c.stroke();
 c.font="bold 12px Arial";
 const tw=c.measureText(lab).width;
 let lx=Math.max(2,Math.min(b.x,w-tw-16)),ly=Math.max(2,b.y-24);
 c.fillStyle="rgba(0,0,0,.88)";
 roundRect(c,lx,ly,tw+14,21,6);c.fill();
 c.fillStyle="#fff";c.fillText(lab,lx+7,ly+15);
 c.restore();
}
function roundRect(c,x,y,w,h,r){
 r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();
}
function hexAlpha(hex,a){
 const h=hex.replace("#","");const n=parseInt(h,16);
 return "rgba("+((n>>16)&255)+","+((n>>8)&255)+","+(n&255)+","+a+")";
}
addEventListener("resize",()=>{if(lastMap&&selectedImage)drawMap(lastMap)});
</script>
</body>
</html>`;
