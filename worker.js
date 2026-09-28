const MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";
const META_VERSION = "2026-09-28";

/* =========================
   V5: STRATEGY FAMILIES
   AI selects a family; it cannot freely mix unrelated armies.
   ========================= */
const STRATEGIES = {
  1:[{id:"BARB",name:"Barbarian Push",core:["Barbarian"]}],
  2:[{id:"BARCH",name:"Barch",core:["Barbarian","Archer"]}],
  3:[{id:"GIANT_BARCH",name:"Giant Barch",core:["Giant","Barbarian","Archer"]}],
  4:[{id:"GIANT_ARCH",name:"Giant Archer",core:["Giant","Archer","Wall Breaker"]}],
  5:[{id:"GIANT_WIZ",name:"Giants + Wizards",core:["Giant","Wizard","Wall Breaker"]}],
  6:[{id:"GIANT_HEAL",name:"Giant Healer",core:["Giant","Healer","Wizard","Wall Breaker"]}],
  7:[
    {id:"DRAGON",name:"Dragon War",core:["Dragon","Balloon"]},
    {id:"HOG",name:"Hog War",core:["Hog Rider","Wizard"]}
  ],
  8:[
    {id:"DRAGON",name:"Dragon War",core:["Dragon","Balloon"]},
    {id:"GOWIPE",name:"GoWiPe",core:["Golem","Wizard","P.E.K.K.A"]}
  ],
  9:[
    {id:"LALO",name:"LavaLoon",core:["Lava Hound","Balloon","Minion"]},
    {id:"WITCH",name:"Witch Smash",core:["Golem","Witch","Wizard"]}
  ],
  10:[
    {id:"BOWITCH",name:"BoWitch",core:["Bowler","Witch","Golem"]},
    {id:"MINER",name:"Miner",core:["Miner","Healer"]}
  ],
  11:[
    {id:"LALO",name:"LavaLoon",core:["Lava Hound","Balloon","Minion"]},
    {id:"EDRAG",name:"Electro Dragon",core:["Electro Dragon","Balloon"]}
  ],
  12:[
    {id:"HYBRID",name:"Queen Charge Hybrid",core:["Miner","Hog Rider","Healer"]},
    {id:"YETI",name:"Yeti Smash",core:["Yeti","Bowler","Healer"]}
  ],
  13:[
    {id:"DRAGON_RIDER",name:"Dragon Rider Air",core:["Dragon","Dragon Rider","Balloon"]},
    {id:"HYBRID",name:"Queen Charge Hybrid",core:["Miner","Hog Rider","Healer"]}
  ],
  14:[
    {id:"DRAGON_RIDER",name:"Dragon Rider Air",core:["Dragon","Dragon Rider","Balloon"]},
    {id:"TITAN",name:"Electro Titan Smash",core:["Electro Titan","Healer","Wizard"]}
  ],
  15:[
    {id:"ROOT",name:"Root Rider Smash",core:["Root Rider","Healer","Wizard"]},
    {id:"DRAGON_RIDER",name:"Dragon Rider Air",core:["Dragon","Dragon Rider","Balloon"]}
  ],
  16:[
    {id:"ROOT",name:"Root Rider Smash",core:["Root Rider","Healer","Druid"]},
    {id:"DRAGON_RIDER",name:"Dragon Rider Air",core:["Dragon","Dragon Rider","Balloon"]}
  ],
  17:[
    {id:"THROWER_HEALER",name:"Thrower + Healer",core:["Thrower","Healer","Root Rider"]},
    {id:"DRAGON_RIDER",name:"Dragon + Dragon Rider",core:["Dragon","Dragon Rider","Balloon"]},
    {id:"METEOR",name:"Meteor Golem Ground",core:["Meteor Golem","Druid","Wizard"]}
  ],
  18:[
    {id:"DRAGON_DUKE_AIR",name:"Dragon Duke + Dragon Rider",core:["Dragon","Dragon Rider","Balloon"]},
    {id:"THROWER_HEALER",name:"Thrower + Healer",core:["Thrower","Healer","Root Rider"]},
    {id:"METEOR",name:"Meteor Golem Ground",core:["Meteor Golem","Druid","Wizard"]}
  ]
};

const HERO_MIN_TH={
 "Barbarian King":4,"Archer Queen":8,"Minion Prince":9,
 "Grand Warden":11,"Royal Champion":13,"Dragon Duke":15
};
const HEROES=Object.keys(HERO_MIN_TH);
const HERO_SLOTS={1:0,2:0,3:0,4:1,5:1,6:1,7:1,8:2,9:2,10:2,11:3,12:3,13:4,14:4,15:4,16:4,17:4,18:4};

const SPELLS=[
 "Lightning Spell","Healing Spell","Rage Spell","Jump Spell","Freeze Spell","Clone Spell",
 "Invisibility Spell","Recall Spell","Poison Spell","Earthquake Spell","Haste Spell",
 "Skeleton Spell","Bat Spell","Overgrowth Spell","Revive Spell"
];

const SIEGES=["None","Wall Wrecker","Battle Blimp","Stone Slammer","Siege Barracks","Log Launcher","Flame Flinger","Battle Drill","Sky Wagon"];

/* Original-game image endpoint mapping.
   These URLs resolve by original asset filename; if an asset host blocks a file,
   UI shows the exact unit name instead of fake emoji/letters. */
const ICONS={
 "Barbarian":"Barbarian_info.png","Archer":"Archer_info.png","Giant":"Giant_info.png","Goblin":"Goblin_info.png",
 "Wall Breaker":"Wall_Breaker_info.png","Balloon":"Balloon_info.png","Wizard":"Wizard_info.png","Healer":"Healer_info.png",
 "Dragon":"Dragon_info.png","P.E.K.K.A":"PEKKA_info.png","Baby Dragon":"Baby_Dragon_info.png","Miner":"Miner_info.png",
 "Electro Dragon":"Electro_Dragon_info.png","Yeti":"Yeti_info.png","Dragon Rider":"Dragon_Rider_info.png",
 "Electro Titan":"Electro_Titan_info.png","Root Rider":"Root_Rider_info.png","Thrower":"Thrower_info.png",
 "Meteor Golem":"Meteor_Golem_info.png","Minion":"Minion_info.png","Hog Rider":"Hog_Rider_info.png",
 "Valkyrie":"Valkyrie_info.png","Golem":"Golem_info.png","Witch":"Witch_info.png","Lava Hound":"Lava_Hound_info.png",
 "Bowler":"Bowler_info.png","Ice Golem":"Ice_Golem_info.png","Headhunter":"Headhunter_info.png",
 "Apprentice Warden":"Apprentice_Warden_info.png","Druid":"Druid_info.png",
 "Barbarian King":"Barbarian_King_info.png","Archer Queen":"Archer_Queen_info.png","Minion Prince":"Minion_Prince_info.png",
 "Grand Warden":"Grand_Warden_info.png","Royal Champion":"Royal_Champion_info.png","Dragon Duke":"Dragon_Duke_info.png",
 "Lightning Spell":"Lightning_Spell_info_new.png","Healing Spell":"Healing_Spell_info.png","Rage Spell":"Rage_Spell_info.png",
 "Freeze Spell":"Freeze_Spell_info.png","Poison Spell":"Poison_Spell_info.png","Revive Spell":"Revive_Spell_info.png"
};

function iconUrl(name){
 const f=ICONS[name]; if(!f)return "";
 return "https://clashofclans.fandom.com/wiki/Special:Redirect/file/"+encodeURIComponent(f);
}

const VERIFIED_BASES={
 TH12:[
  {name:"MCES Eryam War Base",type:"War",link:"https://link.clashofclans.com/fr?action=OpenLayout&id=TH12%3AWB%3AAAAAHgAAAAFy_S4-CzVCnBGBJfbJGxmp"},
  {name:"MCES Hugo Stigliz War Base",type:"War",link:"https://link.clashofclans.com/fr?action=OpenLayout&id=TH12%3AWB%3AAAAAHgAAAAFy0S-1mvTrB4LeFK4DCbE-"}
 ]
};

function thNum(v){const n=Number(String(v||"").replace(/\D/g,""));return Number.isFinite(n)?n:0}
function heroesFor(th){const n=thNum(th);return HEROES.filter(h=>HERO_MIN_TH[h]<=n)}
function heroSlots(th){return HERO_SLOTS[thNum(th)]||0}
function families(th){return STRATEGIES[thNum(th)]||[]}

function box(label){return {type:"object",properties:{
 x:{type:"number",minimum:0,maximum:96},y:{type:"number",minimum:0,maximum:96},
 width:{type:"number",minimum:4,maximum:45},height:{type:"number",minimum:4,maximum:45},
 label:{type:"string",enum:[label]}},required:["x","y","width","height","label"]}}

function schema(th){
 const fs=families(th), hs=heroesFor(th);
 return {type:"object",properties:{
  strategyId:{type:"string",enum:fs.map(x=>x.id)},
  baseRead:{type:"string"},whyThisStrategy:{type:"string"},confidence:{type:"string",enum:["high","medium","low"]},
  army:{type:"array",minItems:1,items:{type:"object",properties:{
   name:{type:"string",enum:[...new Set(fs.flatMap(x=>x.core))]},
   qty:{type:"integer",minimum:1,maximum:80},role:{type:"string"}},required:["name","qty","role"]}},
  spells:{type:"array",items:{type:"object",properties:{name:{type:"string",enum:SPELLS},qty:{type:"integer",minimum:1,maximum:12},role:{type:"string"}},required:["name","qty","role"]}},
  heroes:{type:"array",items:{type:"object",properties:{name:{type:"string",enum:hs.length?hs:["Barbarian King"]},role:{type:"string"},ability:{type:"string"}},required:["name","role","ability"]}},
  siege:{type:"object",properties:{name:{type:"string",enum:SIEGES},clanCastle:{type:"string"}},required:["name","clanCastle"]},
  map:{type:"object",properties:{
   entry:box("1 ENTRY"),funnelL:box("2 FUNNEL LEFT"),funnelR:box("3 FUNNEL RIGHT"),
   main:box("4 MAIN ARMY"),core:box("5 CORE"),target:box("6 TARGET"),
   spells:{type:"array",items:{type:"object",properties:{x:{type:"number"},y:{type:"number"},width:{type:"number"},height:{type:"number"},label:{type:"string"}},required:["x","y","width","height","label"]}}
  },required:["entry","funnelL","funnelR","main","core","target","spells"]},
  deployment:{type:"array",minItems:3,items:{type:"object",properties:{step:{type:"integer"},text:{type:"string"}},required:["step","text"]}},
  timing:{type:"array",items:{type:"string"}},backup:{type:"array",items:{type:"string"}},warnings:{type:"array",items:{type:"string"}}
 },required:["strategyId","baseRead","whyThisStrategy","confidence","army","spells","heroes","siege","map","deployment","timing","backup","warnings"]};
}

function j(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8"}})}
function bytes(data){if(!data)return null;const p=data.indexOf(",");if(p<0)return null;const b=atob(data.slice(p+1)),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return [...u]}
function parse(r){let v=r?.response??r?.result??r;if(v&&typeof v==="object")return v;if(typeof v!=="string")return null;v=v.trim().replace(/^```json\s*/i,"").replace(/\s*```$/,"");try{return JSON.parse(v)}catch{}const a=v.indexOf("{"),b=v.lastIndexOf("}");try{return JSON.parse(v.slice(a,b+1))}catch{return null}}

function validate(p,th){
 if(!p)return "Plan missing";
 const f=families(th).find(x=>x.id===p.strategyId); if(!f)return "Invalid strategy family";
 if(!Array.isArray(p.army)||!p.army.length)return "Army empty";
 for(const u of p.army)if(!f.core.includes(u.name))return "Army mixed outside selected strategy: "+u.name;
 const hn=(p.heroes||[]).map(x=>x.name); if(hn.length!==heroSlots(th))return `Need exactly ${heroSlots(th)} active heroes`;
 if(new Set(hn).size!==hn.length)return "Duplicate hero";
 for(const h of hn)if(!heroesFor(th).includes(h))return "Unavailable hero "+h;
 if(!p.map?.entry||!p.map?.funnelL||!p.map?.funnelR||!p.map?.main||!p.map?.core||!p.map?.target)return "Map incomplete";
 return "";
}

async function makePlan(env,body,fix=""){
 const th=body.th,n=thNum(th),fs=families(th),hs=heroesFor(th),slots=heroSlots(th);
 const prompt=`You are a 2026 Clash of Clans WAR strategy planner.
Town Hall: ${th}
META DATA DATE: ${META_VERSION}
Available strategy families (choose ONE only):
${fs.map(x=>`${x.id}: ${x.name} — allowed army units ONLY: ${x.core.join(", ")}`).join("\n")}
Available heroes: ${hs.join(", ")||"none"}.
Active hero slots: ${slots}.

STRICT:
1. Inspect the screenshot first. Base geometry decides the strategy.
2. Pick exactly ONE strategyId. Never mix troops from another family.
3. For TH18, current 2026 evidence says Dragon/Dragon Rider and Thrower+Healer are major war families; Electro Dragon must NOT be a default recommendation.
4. Army must be a coherent COMPLETE composition using only the selected family's units. Quantities must be practical; if exact camp capacity cannot be confidently inferred, warn instead of inventing capacity claims.
5. Return exactly ${slots} distinct active heroes from the available list.
6. Map is BOX-BASED. x/y = top-left percentage; width/height = box size.
7. ENTRY and MAIN must be actual deployable edge zones. FUNNEL LEFT/RIGHT must cover buildings/areas that should be cleared. CORE must cover the central compartment. TARGET must tightly cover the main target/Town Hall.
8. Do not print raw coordinates in deployment text. Refer to box numbers only.
9. If screenshot evidence is weak, confidence=low and explain it.
10. Never guarantee 3 stars.
${fix?`Previous result failed: ${fix}. Correct it.`:""}`;
 const input={messages:[{role:"system",content:"Return only schema-valid JSON. No invented Clash of Clans names."},{role:"user",content:prompt}],guided_json:schema(th),max_tokens:3600,temperature:.05};
 if(body.image){const im=bytes(body.image);if(!im?.length)throw Error("Screenshot invalid");input.image=im}
 return parse(await env.AI.run(MODEL,input));
}

export default {async fetch(req,env){
 const url=new URL(req.url);
 if(req.method==="GET"&&url.pathname==="/api/base-designs"){
  const th=url.searchParams.get("th")||"";const n=thNum(th);const verified=VERIFIED_BASES[th]||[];
  return j({th,verified,concepts:n?[{name:`TH${n} Anti-3 War Concept`,type:"Anti-3",desc:"Compartmented war layout concept; Copy button appears only for a verified in-game link."},{name:`TH${n} Anti-2 War Concept`,type:"Anti-2",desc:"Town Hall protection-focused concept; no fake layout URL is generated."}]:[]});
 }
 if(req.method==="POST"&&url.pathname==="/api/ask"){
  try{
   if(!env.AI)return j({error:"AI binding missing"},500);
   const body=await req.json();if(!thNum(body.th))return j({error:"Town Hall select karo"},400);if(!body.image)return j({error:"War screenshot upload karo"},400);
   let p=await makePlan(env,body),e=validate(p,body.th);if(e){p=await makePlan(env,body,e);e=validate(p,body.th)}
   if(e)return j({error:"Strategy validation failed: "+e},422);
   return j({ok:true,plan:p,strategy:families(body.th).find(x=>x.id===p.strategyId),heroInfo:{available:heroesFor(body.th),slots:heroSlots(body.th)}});
  }catch(e){return j({error:e?.message||"Strategy failed"},500)}
 }
 return new Response(PAGE,{headers:{"content-type":"text/html;charset=UTF-8"}});
}};

const PAGE=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CoC Battle AI V5</title>
<style>
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at top,#17243d,#070b12 45%);color:#f7f9ff;font-family:Arial,sans-serif}.app{max-width:880px;margin:auto;padding:14px}
.hero{min-height:170px;border-radius:24px;padding:22px;background:linear-gradient(120deg,rgba(7,11,18,.35),rgba(7,11,18,.9)),url("https://clashofclans.fandom.com/wiki/Special:Redirect/file/Barbarian_King_info.png") right -20px center/190px auto no-repeat,#182640;border:1px solid #42506b;box-shadow:0 14px 40px #0008;display:flex;flex-direction:column;justify-content:center}
.badge{width:max-content;background:#ffd12f;color:#111;padding:6px 10px;border-radius:999px;font-size:11px;font-weight:900}.hero h1{margin:10px 0 5px;font-size:30px}.sub{color:#aab7cb;font-size:13px}
.card{background:#111827eF;border:1px solid #293850;border-radius:18px;padding:15px;margin:12px 0;box-shadow:0 8px 25px #0004}.title{display:block;font-weight:900;margin-bottom:8px}
select,textarea,button{width:100%;background:#151f31;color:#fff;border:1px solid #3b4b67;border-radius:13px;padding:13px;font-size:14px}textarea{min-height:80px}.tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.tab.active,.go,.copy{background:linear-gradient(#ffe263,#ffc928);color:#111;border:0;font-weight:900}
.upload{display:block;border:2px dashed #536782;border-radius:16px;text-align:center;padding:18px}#file{display:none}#previewBox{display:none;position:relative;margin-top:12px;border-radius:16px;overflow:hidden}#preview{display:block;width:100%}#map{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
#result,#bases{display:none}.section{margin-top:20px}.section h3{margin:0 0 10px;color:#ffd12f}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.unit{background:#0a1220;border:1px solid #2a3b57;border-radius:15px;padding:9px;text-align:center}.unit img{width:62px;height:62px;object-fit:contain;display:block;margin:auto}.fallback{height:62px;display:none;align-items:center;justify-content:center;font-size:11px;font-weight:900}.nm{font-weight:900}.qty{color:#ffd12f;font-size:18px;font-weight:900}.role{font-size:11px;color:#aab7cb;margin-top:4px}.step,.base{background:#0a1220;border-left:3px solid #ffd12f;border-radius:9px;padding:10px;margin:7px 0;line-height:1.45}.meta{background:#071b19;border:1px solid #176c5a;color:#86f3d1;padding:10px;border-radius:12px}.warn{color:#ffc17a}.copy{display:block;text-decoration:none;text-align:center;padding:10px;border-radius:10px;margin-top:8px}.disabled{opacity:.55;background:#293243;color:#aeb8c7}.legal{font-size:11px;color:#7f8da3;line-height:1.45;margin:18px 3px}@media(max-width:560px){.grid{grid-template-columns:repeat(2,1fr)}.tabs{grid-template-columns:1fr}.hero{min-height:150px;background-size:145px auto}}
</style></head><body><div class="app">
<div class="hero"><div class="badge">V5 • 2026 WAR ENGINE</div><h1>⚔️ CoC Battle AI</h1><div class="sub">Screenshot → current strategy family → validated army → box attack map</div></div>
<div class="card"><label class="title">1️⃣ Town Hall</label><select id="th"><option value="">Select TH</option>${Array.from({length:18},(_,i)=>`<option>TH${i+1}</option>`).join("")}</select></div>
<div class="card"><div class="tabs"><button class="tab" data-m="attack">⚔️ Attack</button><button class="tab active" data-m="war">🏆 War Screenshot</button><button class="tab" data-m="base">🏰 Base Designs</button></div></div>
<div id="battle"><div class="card"><label class="title">2️⃣ Base Screenshot</label><label class="upload" for="file">📷 Upload Base Screenshot<br><span class="sub">20MB max • auto compressed</span></label><input id="file" type="file" accept="image/*"><div id="previewBox"><img id="preview"><canvas id="map"></canvas></div></div>
<div class="card"><label class="title">3️⃣ Details</label><textarea id="notes" placeholder="Hero equipment / levels / special note..."></textarea><button id="go" class="go">Analyze War Base</button><div id="status" class="sub" style="margin-top:9px"></div></div></div>
<div id="bases" class="card"><h2>🏰 Base Designs</h2><div id="baseList"></div></div>
<div id="result" class="card"><h2 id="strategyName"></h2><div class="meta" id="meta"></div>
<div class="section"><h3>🔍 Base Read</h3><div id="baseRead"></div></div><div class="section"><h3>🧠 Why this strategy</h3><div id="why"></div></div>
<div class="section"><h3>🪖 Army</h3><div class="grid" id="army"></div></div><div class="section"><h3>🧪 Spells</h3><div class="grid" id="spells"></div></div><div class="section"><h3>👑 Active Heroes</h3><div id="heroInfo" class="sub"></div><div class="grid" id="heroes"></div></div>
<div class="section"><h3>🚜 Siege + CC</h3><div id="siege"></div></div><div class="section"><h3>🗺️ Attack Boxes</h3><div class="meta">1 ENTRY → 2 FUNNEL LEFT → 3 FUNNEL RIGHT → 4 MAIN ARMY → 5 CORE → 6 TARGET</div></div>
<div class="section"><h3>🚀 Deployment</h3><div id="deploy"></div></div><div class="section"><h3>⏱️ Timing</h3><div id="timing"></div></div><div class="section"><h3>🔁 Backup</h3><div id="backup"></div></div><div class="warn" id="warnings"></div></div>
<div class="legal">This material is unofficial and is not endorsed by Supercell. Clash of Clans assets belong to Supercell. Fan-content use must follow Supercell's Fan Content Policy.</div></div>
<script>
const $=x=>document.getElementById(x),th=$("th"),file=$("file"),preview=$("preview"),box=$("previewBox"),canvas=$("map"),go=$("go"),status=$("status"),result=$("result"),bases=$("bases");let mode="war",img=null,last=null;
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");mode=b.dataset.m;if(mode==="base"){ $("battle").style.display="none";result.style.display="none";loadBases()}else{$("battle").style.display="block";bases.style.display="none"}});
th.onchange=()=>{if(mode==="base")loadBases()};
async function loadBases(){if(!th.value){alert("TH select karo");return}bases.style.display="block";const d=await(await fetch("/api/base-designs?th="+th.value)).json();$("baseList").innerHTML=[...(d.verified||[]).map(x=>'<div class="base"><b>'+esc(x.name)+'</b><div class="sub">'+esc(x.type)+'</div><a class="copy" href="'+attr(x.link)+'">Open / Copy Base</a></div>'),...(d.concepts||[]).map(x=>'<div class="base"><b>'+esc(x.name)+'</b><div class="sub">'+esc(x.desc)+'</div><div class="copy disabled">Verified Copy Link Not Stored</div></div>')].join("")}
file.onchange=async()=>{const f=file.files[0];if(!f)return;if(f.size>20*1024*1024){alert("Max 20MB");return}status.textContent="Optimizing...";img=await compress(f);preview.onload=()=>{box.style.display="block";if(last)draw(last)};preview.src=img;status.textContent="✅ Screenshot ready"};
function compress(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=e=>{const im=new Image();im.onload=()=>{let w=im.width,h=im.height,M=1600;if(w>M||h>M){let s=Math.min(M/w,M/h);w*=s;h*=s}const c=document.createElement("canvas");c.width=Math.round(w);c.height=Math.round(h);c.getContext("2d").drawImage(im,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",.88))};im.onerror=rej;im.src=e.target.result};r.onerror=rej;r.readAsDataURL(f)})}
go.onclick=async()=>{if(!th.value){alert("TH select karo");return}if(!img){alert("Screenshot upload karo");return}go.disabled=true;status.textContent="🔍 Base geometry + 2026 strategy analyze ho rahi hai...";result.style.display="none";try{const r=await fetch("/api/ask",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({th:th.value,mode,image:img,message:$("notes").value})});const d=await r.json();if(!r.ok)throw Error(d.error);render(d)}catch(e){status.textContent="❌ "+e.message}finally{go.disabled=false}};
function asset(n){const map=${JSON.stringify({})};return "https://clashofclans.fandom.com/wiki/Special:Redirect/file/"+encodeURIComponent(({"Barbarian":"Barbarian_info.png","Archer":"Archer_info.png","Giant":"Giant_info.png","Wall Breaker":"Wall_Breaker_info.png","Balloon":"Balloon_info.png","Wizard":"Wizard_info.png","Healer":"Healer_info.png","Dragon":"Dragon_info.png","P.E.K.K.A":"PEKKA_info.png","Miner":"Miner_info.png","Electro Dragon":"Electro_Dragon_info.png","Yeti":"Yeti_info.png","Dragon Rider":"Dragon_Rider_info.png","Electro Titan":"Electro_Titan_info.png","Root Rider":"Root_Rider_info.png","Thrower":"Thrower_info.png","Meteor Golem":"Meteor_Golem_info.png","Minion":"Minion_info.png","Hog Rider":"Hog_Rider_info.png","Golem":"Golem_info.png","Witch":"Witch_info.png","Lava Hound":"Lava_Hound_info.png","Bowler":"Bowler_info.png","Druid":"Druid_info.png","Barbarian King":"Barbarian_King_info.png","Archer Queen":"Archer_Queen_info.png","Minion Prince":"Minion_Prince_info.png","Grand Warden":"Grand_Warden_info.png","Royal Champion":"Royal_Champion_info.png","Dragon Duke":"Dragon_Duke_info.png","Rage Spell":"Rage_Spell_info.png","Freeze Spell":"Freeze_Spell_info.png","Healing Spell":"Healing_Spell_info.png","Lightning Spell":"Lightning_Spell_info_new.png","Revive Spell":"Revive_Spell_info.png"})[n]||n.replaceAll(" ","_")+"_info.png")}
function card(n,q,r){return '<div class="unit"><img src="'+attr(asset(n))+'" onerror="this.style.display=\\'none\\';this.nextElementSibling.style.display=\\'flex\\'"><div class="fallback">'+esc(n)+'</div><div class="nm">'+esc(n)+'</div><div class="qty">'+esc(q||"")+'</div><div class="role">'+esc(r||"")+'</div></div>'}
function render(d){const p=d.plan;$("strategyName").textContent=d.strategy.name;$("meta").textContent="2026 family: "+d.strategy.name+" • Confidence: "+p.confidence;$("baseRead").textContent=p.baseRead;$("why").textContent=p.whyThisStrategy;$("army").innerHTML=p.army.map(x=>card(x.name,"×"+x.qty,x.role)).join("");$("spells").innerHTML=p.spells.map(x=>card(x.name,"×"+x.qty,x.role)).join("");$("heroes").innerHTML=p.heroes.map(x=>card(x.name,"",x.role+" • "+x.ability)).join("");$("heroInfo").textContent="Available: "+d.heroInfo.available.join(", ")+" | Active slots: "+d.heroInfo.slots;$("siege").textContent=p.siege.name+" | CC: "+p.siege.clanCastle;$("deploy").innerHTML=p.deployment.map(x=>'<div class="step"><b>'+x.step+'.</b> '+esc(x.text)+'</div>').join("");$("timing").innerHTML=steps(p.timing);$("backup").innerHTML=steps(p.backup);$("warnings").innerHTML=(p.warnings||[]).map(x=>"⚠️ "+esc(x)).join("<br>");last=p.map;result.style.display="block";requestAnimationFrame(()=>draw(last));result.scrollIntoView({behavior:"smooth"})}
function steps(a){return(a||[]).map(x=>'<div class="step">'+esc(x)+'</div>').join("")}function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}function attr(v){return esc(v)}
function draw(m){if(!m||!img)return;const w=preview.clientWidth,h=preview.clientHeight,d=devicePixelRatio||1;canvas.width=w*d;canvas.height=h*d;canvas.style.width=w+"px";canvas.style.height=h+"px";const c=canvas.getContext("2d");c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);[[m.entry,"#00ff8c"],[m.funnelL,"#ffd12f"],[m.funnelR,"#ffd12f"],[m.main,"#00e5ff"],[m.core,"#ff9f43"],[m.target,"#ff4f70"]].forEach(x=>zone(c,x[0],w,h,x[1]));(m.spells||[]).forEach(x=>zone(c,x,w,h,"#c879ff"))}
function zone(c,p,w,h,col){if(!p)return;let x=p.x/100*w,y=p.y/100*h,bw=p.width/100*w,bh=p.height/100*h;c.save();c.fillStyle=rgba(col,.18);c.strokeStyle=col;c.lineWidth=3;c.beginPath();c.roundRect(x,y,bw,bh,8);c.fill();c.stroke();c.font="bold 12px Arial";let tw=c.measureText(p.label).width,lx=Math.max(2,Math.min(x,w-tw-16)),ly=Math.max(2,y-23);c.fillStyle="rgba(0,0,0,.88)";c.fillRect(lx,ly,tw+14,21);c.fillStyle="#fff";c.fillText(p.label,lx+7,ly+15);c.restore()}function rgba(hex,a){let n=parseInt(hex.slice(1),16);return "rgba("+((n>>16)&255)+","+((n>>8)&255)+","+(n&255)+","+a+")"}addEventListener("resize",()=>{if(last)draw(last)});
</script></body></html>`;
