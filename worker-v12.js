const MODEL="@cf/meta/llama-4-scout-17b-16e-instruct";
const STRATEGIES={"TH4": [{"id": "GIALOON", "name": "GiaLoon", "units": ["Giant", "Wall Breaker", "Balloon", "Archer"], "style": "Hybrid"}], "TH5": [{"id": "GIANT_WIZ", "name": "Giants + Wizards", "units": ["Giant", "Wall Breaker", "Wizard", "Archer", "Barbarian"], "style": "Ground"}], "TH6": [{"id": "GIANT_HEAL", "name": "Giant Ground Push", "units": ["Giant", "Healer", "Wizard", "Wall Breaker"], "style": "Ground"}], "TH7": [{"id": "ZAP_DRAG", "name": "Zap Dragons", "units": ["Dragon", "Balloon"], "style": "Air"}], "TH8": [{"id": "GOVALK", "name": "Golem + Valkyries", "units": ["Golem", "Valkyrie", "Wizard", "Wall Breaker"], "style": "Ground"}, {"id": "DRAG", "name": "Dragon War", "units": ["Dragon", "Balloon"], "style": "Air"}], "TH9": [{"id": "ZAP_WITCH", "name": "Zap Witches", "units": ["Witch", "Golem", "Wizard"], "style": "Ground"}, {"id": "ZAP_DRAG", "name": "Zap Dragons", "units": ["Dragon", "Balloon", "Baby Dragon"], "style": "Air"}], "TH10": [{"id": "ZAP_DRAG", "name": "Zap Dragons", "units": ["Dragon", "Balloon", "Baby Dragon"], "style": "Air"}, {"id": "WITCH", "name": "Witch Smash", "units": ["Witch", "Golem", "Bowler"], "style": "Ground"}], "TH11": [{"id": "ZAP_WITCH", "name": "Zap Witches", "units": ["Witch", "Golem", "Bowler"], "style": "Ground"}, {"id": "QC_HYBRID", "name": "Queen Charge Hybrid", "units": ["Miner", "Hog Rider", "Healer"], "style": "Hybrid"}], "TH12": [{"id": "ZAP_DRAG", "name": "Zap Dragons", "units": ["Dragon", "Balloon", "Baby Dragon"], "style": "Air"}, {"id": "SUPER_WITCH_FB", "name": "Super Witch Fireball", "units": ["Super Witch", "Healer", "Balloon"], "style": "Ground"}, {"id": "QC_HYBRID", "name": "Queen Charge Hybrid", "units": ["Miner", "Hog Rider", "Healer"], "style": "Hybrid"}], "TH13": [{"id": "RC_DRAG", "name": "Royal Champion Dive Dragons", "units": ["Dragon", "Balloon", "Baby Dragon", "Wall Breaker"], "style": "Air"}, {"id": "YETI_SARCH", "name": "Yeti Super Archer", "units": ["Yeti", "Super Archer", "Healer"], "style": "Ground"}, {"id": "HYDRA_CLONE", "name": "Super Archer Clone Hydra", "units": ["Dragon", "Dragon Rider", "Balloon", "Super Archer"], "style": "Air"}], "TH14": [{"id": "SUPER_DRAG", "name": "Super Dragons", "units": ["Super Dragon", "Balloon", "Baby Dragon"], "style": "Air"}, {"id": "DRAG_BLIMP", "name": "Dragon Blimp", "units": ["Dragon", "Balloon", "Baby Dragon"], "style": "Air"}], "TH15": [{"id": "WC_SUPER_YETI", "name": "Warden Charge Super Yetis", "units": ["Super Yeti", "Healer", "Balloon"], "style": "Ground"}, {"id": "FB_ROCKET", "name": "Fireball Rocket Loons", "units": ["Rocket Balloon", "Healer", "Balloon"], "style": "Air"}], "TH16": [{"id": "FB_SUPER_YETI", "name": "Fireball Super Yeti", "units": ["Super Yeti", "Healer", "Balloon"], "style": "Ground"}, {"id": "RC_ROOT", "name": "RC Walk Root Riders", "units": ["Root Rider", "Healer", "Valkyrie"], "style": "Ground"}], "TH17": [{"id": "FB_SUPER_YETI", "name": "Fireball Super Yeti", "units": ["Super Yeti", "Healer", "Balloon"], "style": "Ground"}, {"id": "RC_DRAG", "name": "RC Walk Dragons", "units": ["Dragon", "Dragon Rider", "Balloon"], "style": "Air"}, {"id": "THROWER_HEALER", "name": "Thrower + Healer", "units": ["Thrower", "Healer", "Root Rider"], "style": "Ground"}], "TH18": [{"id": "FB_METEOR", "name": "Fireball Meteor Golems", "units": ["Meteor Golem", "Healer", "Balloon", "Druid"], "style": "Ground"}, {"id": "SURGICAL_EDRAG", "name": "Surgical Electro Dragons", "units": ["Electro Dragon", "Balloon"], "style": "Air"}, {"id": "ROOT_VALK", "name": "Root Rider Valkyries", "units": ["Root Rider", "Valkyrie", "Druid"], "style": "Ground"}, {"id": "DRAGON_RIDER", "name": "Dragon + Dragon Rider", "units": ["Dragon", "Dragon Rider", "Balloon"], "style": "Air"}, {"id": "THROWER_HEALER", "name": "Thrower + Healer", "units": ["Thrower", "Healer", "Root Rider"], "style": "Ground"}]};
const BASE_CATALOG="https://raw.githubusercontent.com/nschmeller/clash-bases/main/bases.json";
const HERO_MIN={"Barbarian King":4,"Archer Queen":8,"Minion Prince":9,"Grand Warden":11,"Royal Champion":13,"Dragon Duke":15};
const HERO_SLOTS={4:1,5:1,6:1,7:1,8:2,9:2,10:2,11:3,12:3,13:4,14:4,15:4,16:4,17:4,18:4};
const SPELLS=["Lightning Spell","Healing Spell","Rage Spell","Jump Spell","Freeze Spell","Clone Spell","Invisibility Spell","Recall Spell","Poison Spell","Earthquake Spell","Haste Spell","Skeleton Spell","Bat Spell","Overgrowth Spell","Revive Spell"];
const SIEGES=["None","Wall Wrecker","Battle Blimp","Stone Slammer","Siege Barracks","Log Launcher","Flame Flinger","Battle Drill","Sky Wagon"];
function nTH(v){return Number(String(v||"").replace(/\D/g,""))||0}
function fam(th){return STRATEGIES["TH"+nTH(th)]||[]}
function heroes(th){let n=nTH(th);return Object.keys(HERO_MIN).filter(x=>HERO_MIN[x]<=n)}
function j(x,s=200){return new Response(JSON.stringify(x),{status:s,headers:{"content-type":"application/json;charset=UTF-8"}})}
function imageBytes(s){let p=s.indexOf(",");if(p<0)return null;let b=atob(s.slice(p+1)),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return [...u]}
function box(label){return {type:"object",properties:{x:{type:"number",minimum:0,maximum:96},y:{type:"number",minimum:0,maximum:96},width:{type:"number",minimum:4,maximum:45},height:{type:"number",minimum:4,maximum:45},label:{type:"string",enum:[label]}},required:["x","y","width","height","label"]}}
function schema(th){let f=fam(th),hs=heroes(th);return {type:"object",properties:{
rankedIds:{type:"array",minItems:1,maxItems:3,items:{type:"string",enum:f.map(x=>x.id)}},baseRead:{type:"string"},why:{type:"string"},confidence:{type:"string",enum:["high","medium","low"]},
army:{type:"array",minItems:1,items:{type:"object",properties:{name:{type:"string",enum:[...new Set(f.flatMap(x=>x.units))]},qty:{type:"integer",minimum:1,maximum:80},role:{type:"string"}},required:["name","qty","role"]}},
spells:{type:"array",items:{type:"object",properties:{name:{type:"string",enum:SPELLS},qty:{type:"integer",minimum:1,maximum:12},role:{type:"string"}},required:["name","qty","role"]}},
heroes:{type:"array",items:{type:"object",properties:{name:{type:"string",enum:hs},equipment:{type:"string"},role:{type:"string"}},required:["name","equipment","role"]}},
siege:{type:"object",properties:{name:{type:"string",enum:SIEGES},cc:{type:"string"}},required:["name","cc"]},
map:{type:"object",properties:{entry:box("1 ENTRY"),funnelL:box("2 FUNNEL LEFT"),funnelR:box("3 FUNNEL RIGHT"),main:box("4 MAIN ARMY"),core:box("5 CORE"),target:box("6 TARGET"),spells:{type:"array",items:box("SPELL ZONE")}},required:["entry","funnelL","funnelR","main","core","target","spells"]},
steps:{type:"array",minItems:4,items:{type:"string"}},timing:{type:"array",items:{type:"string"}},backup:{type:"array",items:{type:"string"}},warnings:{type:"array",items:{type:"string"}}
},required:["rankedIds","baseRead","why","confidence","army","spells","heroes","siege","map","steps","timing","backup","warnings"]}}
function parse(v){v=v?.response??v?.result??v;if(v&&typeof v==="object")return v;if(typeof v!=="string")return null;v=v.trim().replace(/^```json\s*/i,"").replace(/\s*```$/,"");try{return JSON.parse(v)}catch{let a=v.indexOf("{"),b=v.lastIndexOf("}");try{return JSON.parse(v.slice(a,b+1))}catch{return null}}}
async function plan(env,b){let f=fam(b.th),hs=heroes(b.th),slots=HERO_SLOTS[nTH(b.th)]||0;
let prompt=`You are a Clash of Clans 2026 WAR base matcher. Screenshot first.
CLOSED STORED STRATEGIES for ${b.th}:
${f.map(x=>`${x.id} | ${x.name} | ${x.style} | ONLY units: ${x.units.join(", ")}`).join("\n")}
RULES:
- Rank up to THREE different strategy IDs from this stored library, best first. Never invent a strategy name and never merge strategies. Build the army and map only for rankedIds[0].
- The stored library was researched from current public creator/strategy guides. Do not mention creator/video/source names.
- Screenshot geometry decides the match: air-defense layout, compartments, Town Hall position, sweepers, core and funnel access.
- Army can ONLY contain units from chosen strategy. No unrelated troop.
- Return exactly ${slots} distinct heroes from: ${hs.join(", ")}.
- Give practical quantities, but if exact housing capacity is not verified say so in warnings. Never claim quantities came verbatim from a creator unless they are stored.
- Map uses boxes. x/y top-left percent; width/height percent.
- Do not show coordinates in steps. Steps refer to box numbers only.
- No 3-star guarantee.`;
let input={messages:[{role:"system",content:"Return only schema-valid JSON."},{role:"user",content:prompt}],guided_json:schema(b.th),max_tokens:3600,temperature:.05};
input.image=imageBytes(b.image);return parse(await env.AI.run(MODEL,input))}
function validate(p,th){if(!p)return"Missing plan";if(!Array.isArray(p.rankedIds)||!p.rankedIds.length)return"No strategy matches";if(new Set(p.rankedIds).size!==p.rankedIds.length)return"Duplicate matches";let f=fam(th).find(x=>x.id===p.rankedIds[0]);if(!f)return"Strategy not stored";for(let a of p.army||[])if(!f.units.includes(a.name))return"Unstored troop "+a.name;let hs=(p.heroes||[]).map(x=>x.name);if(hs.length!==(HERO_SLOTS[nTH(th)]||0))return"Wrong hero count";if(new Set(hs).size!==hs.length)return"Duplicate hero";return""}
export default{async fetch(req,env){let u=new URL(req.url);
if(req.method==="GET"&&u.pathname==="/api/icon"){let name=u.searchParams.get("name")||"";let fn=name.replaceAll(" ","_")+"_info.png";try{let r=await fetch("https://clashofclans.fandom.com/wiki/Special:Redirect/file/"+encodeURIComponent(fn),{redirect:"follow"});return new Response(r.body,{status:r.status,headers:{"content-type":r.headers.get("content-type")||"image/png","cache-control":"public,max-age=86400"}})}catch(e){return new Response("",{status:404})}}
if(req.method==="GET"&&u.pathname==="/api/strategies")return j({strategies:fam(u.searchParams.get("th")).map(x=>({id:x.id,name:x.name,style:x.style}))});
if(req.method==="GET"&&u.pathname==="/api/base-designs"){let n=nTH(u.searchParams.get("th"));if(n<4||n>18)return j({error:"TH4–TH18 only"},400);try{let r=await fetch(BASE_CATALOG,{cf:{cacheTtl:1800,cacheEverything:true}}),d=await r.json();let a=(d.bases||[]).filter(x=>Number(x.town_hall)===n&&String(x.type).toLowerCase()==="war"&&x.image&&/^https:\/\/link\.clashofclans\.com\//.test(x.link||"")).slice(0,12);return j({bases:a})}catch(e){return j({error:"Base gallery load failed"},502)}}
if(req.method==="POST"&&u.pathname==="/api/ask"){try{let b=await req.json();if(nTH(b.th)<4||nTH(b.th)>18)return j({error:"TH4–TH18 select karo"},400);if(!b.image)return j({error:"Screenshot upload karo"},400);let p=await plan(env,b),e=validate(p,b.th);if(e)return j({error:"Strategy validation failed: "+e},422);let all=fam(b.th),matches=p.rankedIds.map(id=>all.find(x=>x.id===id)).filter(Boolean);return j({ok:true,plan:p,strategy:matches[0],matches,heroSlots:HERO_SLOTS[nTH(b.th)]||0})}catch(e){return j({error:e.message||"Failed"},500)}}
return new Response(PAGE,{headers:{"content-type":"text/html;charset=UTF-8"}})}};
const PAGE=`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Clash War Lab V12</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#18240f;color:#fff;font-family:Arial,sans-serif;background-image:linear-gradient(#0007,#0007),radial-gradient(circle at 20% 10%,#54782f 0 3%,transparent 4%),linear-gradient(135deg,#31451f,#17220f 55%,#263718)}
.app{max-width:920px;margin:auto;padding:14px 14px 80px}
.hero{border:5px solid #8a5b25;border-radius:26px;padding:22px;background:linear-gradient(#24364e,#101a29);box-shadow:inset 0 0 0 3px #d7aa57,0 12px 25px #0008}
.badge{display:inline-block;background:linear-gradient(#ffe56b,#e8a700);color:#211500;border:3px solid #6f4716;border-radius:14px;padding:8px 12px;font-weight:900}
h1{font-size:38px;margin:15px 0 5px;text-shadow:0 4px 0 #000,2px 0 #000,-2px 0 #000}
.sub{color:#d7e0ed}.pills{display:flex;gap:7px;flex-wrap:wrap;margin-top:14px}.pills span{background:#182537;border:2px solid #7993b8;border-radius:999px;padding:7px 10px;font-size:11px;font-weight:900}
.card{margin:14px 0;padding:16px;border:5px solid #765026;border-radius:22px;background:linear-gradient(#d0a45f,#9b6b35);box-shadow:inset 0 0 0 3px #f2d18e,0 10px 20px #0007;color:#21170e}
.inner{background:#142238;color:#fff;border:3px solid #334f72;border-radius:16px;padding:13px}
.title{display:block;font-weight:900;font-size:18px;margin-bottom:10px}
select,textarea,button{font:inherit}select,textarea{width:100%;padding:14px;border:3px solid #5f4326;border-radius:12px;background:#fff4d7;color:#21170e;font-weight:800}textarea{min-height:80px}
.tabs{display:grid;grid-template-columns:1fr 1fr;gap:9px}.tab,.go{padding:14px;border:3px solid #5c3a0d;border-radius:14px;font-weight:900;background:linear-gradient(#e9e9e9,#a7a7a7);color:#20170e;box-shadow:inset 0 2px #fff}.tab.active,.go{background:linear-gradient(#ffe76a,#f1a900)}
.upload{display:block;text-align:center;padding:24px;border:4px dashed #765026;border-radius:15px;background:#fff0c9;font-size:20px;font-weight:900}#file{display:none}
#previewBox{display:none;position:relative;margin-top:12px;border:4px solid #5b3b18;border-radius:15px;overflow:hidden;background:#000}#preview{width:100%;display:block}#map{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
#result,#bases{display:none}.tags{display:flex;gap:7px;flex-wrap:wrap}.tags span{padding:7px 10px;background:#17273d;color:#fff;border:2px solid #49698e;border-radius:999px;font-size:11px;font-weight:800}
.match,.step,.meta{background:#142238;color:#fff;border:2px solid #46658b;border-radius:13px;padding:11px;margin:8px 0}.match.best{border-color:#ffd337}.rank{color:#ffd337;font-weight:900}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.unit{background:#142238;color:#fff;border:3px solid #49698e;border-radius:15px;padding:9px;text-align:center}.unit img{width:66px;height:66px;object-fit:contain}.qty{font-size:20px;color:#ffd337;font-weight:900}.role{font-size:11px;color:#c0cce0}
h2,h3{color:#3a250d}#result h3{background:#ffd13a;display:inline-block;padding:6px 10px;border:2px solid #6b4518;border-radius:9px}
.basegrid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.base{background:#142238;color:#fff;border:3px solid #49698e;border-radius:15px;overflow:hidden}.base img{width:100%;aspect-ratio:1;object-fit:cover}.basebody{padding:10px}.copy{display:block;text-align:center;text-decoration:none;padding:11px;border-radius:10px;background:linear-gradient(#ffe76a,#efa600);color:#20170e;font-weight:900;margin-top:8px}
.status{margin-top:9px;font-weight:900}.legal{font-size:10px;color:#ddd;background:#0007;padding:10px;border-radius:10px}
@media(max-width:560px){h1{font-size:31px}.grid{grid-template-columns:repeat(2,1fr)}.basegrid{grid-template-columns:1fr}}
</style>
</head>
<body><div class="app">
<section class="hero"><span class="badge">V12 • WAR VILLAGE LAB</span><h1>⚔️ CLASH WAR LAB</h1><div class="sub">Enemy screenshot → stored strategy match → visual attack road map</div><div class="pills"><span>SCREENSHOT MATCH</span><span>TROOP ICONS</span><span>WAR BASES</span><span>VISUAL PATH</span></div></section>

<div class="card"><label class="title">🏰 1. Town Hall</label><select id="th"><option value="">Select TH</option>${Array.from({length:15},(_,i)=>`<option>TH${i+4}</option>`).join("")}</select></div>
<div class="card"><div class="tabs"><button type="button" class="tab active" id="warTab">⚔️ Screenshot Attack</button><button type="button" class="tab" id="baseTab">🏰 War Bases</button></div></div>

<div id="battle">
<div class="card"><label class="title">📚 2. Stored Strategy Library</label><div id="library" class="tags"><span>TH select karo</span></div></div>
<div class="card"><label class="title">📸 3. Enemy Base Screenshot</label><label for="file" class="upload">📷 Upload Screenshot<br><small>20MB max • auto compress</small></label><input id="file" type="file" accept="image/*"><div id="previewBox"><img id="preview"><canvas id="map"></canvas></div></div>
<div class="card"><label class="title">🛡️ 4. Optional Details</label><textarea id="notes" placeholder="Hero equipment / levels..."></textarea><button type="button" id="go" class="go">⚔️ MATCH ATTACK STRATEGY</button><div id="status" class="status"></div></div>
</div>

<div id="bases" class="card"><h2>🏰 WAR BASE DESIGNS</h2><div id="baseList"></div></div>
<div id="result" class="card">
<span class="badge">SCREENSHOT STRATEGY MATCH</span><div id="matches"></div><h2 id="strategyName"></h2><div id="meta" class="meta"></div>
<h3>Base Analysis</h3><div id="read" class="inner"></div><h3>Why this strategy</h3><div id="why" class="inner"></div>
<h3>Army</h3><div id="army" class="grid"></div><h3>Spells</h3><div id="spells" class="grid"></div><h3>Heroes + Equipment</h3><div id="heroes" class="grid"></div>
<h3>Siege + CC</h3><div id="siege" class="inner"></div><h3>Attack Road Map</h3><div class="meta">① ENTRY → ② FUNNEL LEFT → ③ FUNNEL RIGHT → ④ MAIN ARMY → ⑤ CORE → ⑥ TARGET</div>
<h3>Deployment</h3><div id="steps"></div><h3>Timing</h3><div id="timing"></div><h3>Backup</h3><div id="backup"></div><div id="warnings"></div>
</div>
<div class="legal">Unofficial fan project. Not endorsed by Supercell. Copy Base links are displayed only when the server catalog contains a valid clashofclans.com layout link.</div>
</div>
<script>
(function(){
"use strict";
function el(id){return document.getElementById(id)}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function attr(v){return esc(v)}
var th=el("th"),file=el("file"),preview=el("preview"),pbox=el("previewBox"),canvas=el("map"),status=el("status");
var imageData=null,lastMap=null;

el("warTab").addEventListener("click",function(){this.classList.add("active");el("baseTab").classList.remove("active");el("battle").style.display="block";el("bases").style.display="none"});
el("baseTab").addEventListener("click",function(){this.classList.add("active");el("warTab").classList.remove("active");el("battle").style.display="none";el("result").style.display="none";loadBases()});
th.addEventListener("change",function(){loadLibrary();if(el("baseTab").classList.contains("active"))loadBases()});

async function loadLibrary(){
 if(!th.value){el("library").innerHTML="<span>TH select karo</span>";return}
 el("library").textContent="Loading...";
 try{var r=await fetch("/api/strategies?th="+encodeURIComponent(th.value));var d=await r.json();if(!r.ok)throw new Error(d.error||"Failed");el("library").innerHTML=(d.strategies||[]).map(function(x){return "<span>"+esc(x.name)+" • "+esc(x.style)+"</span>"}).join("")||"<span>No stored strategy</span>"}catch(e){el("library").textContent="Error: "+e.message}
}
async function loadBases(){
 if(!th.value){alert("Pehle TH select karo");el("warTab").click();return}
 el("bases").style.display="block";el("baseList").textContent="Loading war bases...";
 try{var r=await fetch("/api/base-designs?th="+encodeURIComponent(th.value));var d=await r.json();if(!r.ok)throw new Error(d.error||"Base load failed");var a=d.bases||[];el("baseList").innerHTML=a.length?'<div class="basegrid">'+a.map(function(x){return '<div class="base"><img loading="lazy" src="'+attr(x.image)+'"><div class="basebody"><b>'+esc(x.name||("TH"+x.town_hall+" War Base"))+'</b><a class="copy" target="_blank" rel="noopener" href="'+attr(x.link)+'">📋 COPY BASE</a></div></div>'}).join("")+"</div>":"No verified war bases found."}catch(e){el("baseList").textContent="❌ "+e.message}
}
file.addEventListener("change",async function(){
 var f=file.files&&file.files[0];if(!f)return;if(f.size>20*1024*1024){alert("20MB max");file.value="";return}
 try{imageData=await compress(f);preview.onload=function(){pbox.style.display="block";if(lastMap)drawMap(lastMap)};preview.src=imageData;status.textContent="✅ Screenshot ready"}catch(e){status.textContent="❌ Image error: "+e.message}
});
function compress(f){return new Promise(function(resolve,reject){var r=new FileReader();r.onerror=reject;r.onload=function(e){var im=new Image();im.onerror=reject;im.onload=function(){var w=im.width,h=im.height,M=1600,scale=Math.min(1,M/w,M/h);var c=document.createElement("canvas");c.width=Math.round(w*scale);c.height=Math.round(h*scale);c.getContext("2d").drawImage(im,0,0,c.width,c.height);resolve(c.toDataURL("image/jpeg",0.88))};im.src=e.target.result};r.readAsDataURL(f)})}
el("go").addEventListener("click",async function(){
 if(!th.value){alert("TH select karo");return}if(!imageData){alert("Screenshot upload karo");return}
 status.textContent="🔍 Screenshot analyze + stored strategy match...";
 try{var r=await fetch("/api/ask",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({th:th.value,image:imageData,notes:el("notes").value})});var d=await r.json();if(!r.ok)throw new Error(d.error||"AI failed");render(d);status.textContent="✅ Attack plan ready";el("result").scrollIntoView({behavior:"smooth"})}catch(e){status.textContent="❌ "+e.message}
});
function card(n,q,r){return '<div class="unit"><img loading="lazy" src="/api/icon?name='+encodeURIComponent(n)+'"><b>'+esc(n)+'</b><div class="qty">'+esc(q)+'</div><div class="role">'+esc(r||"")+'</div></div>'}
function render(d){
 var p=d.plan||{},matches=d.matches||[d.strategy];
 el("matches").innerHTML=matches.map(function(m,i){return '<div class="match '+(i===0?"best":"")+'"><div class="rank">'+(i===0?"🏆 BEST SCREENSHOT MATCH":"#"+(i+1)+" ALTERNATIVE")+'</div><b>'+esc(m.name)+'</b><div class="role">'+esc(m.style)+'</div></div>'}).join("");
 el("strategyName").textContent=(d.strategy&&d.strategy.name)||"Strategy";el("meta").textContent="🔒 Stored strategy • "+((d.strategy&&d.strategy.style)||"")+" • Base-fit: "+(p.confidence||"");
 el("read").textContent=p.baseRead||"";el("why").textContent=p.why||"";
 el("army").innerHTML=(p.army||[]).map(function(x){return card(x.name,"×"+x.qty,x.role)}).join("");
 el("spells").innerHTML=(p.spells||[]).map(function(x){return card(x.name,"×"+x.qty,x.role)}).join("");
 el("heroes").innerHTML=(p.heroes||[]).map(function(x){return card(x.name,x.equipment,x.role)}).join("");
 el("siege").textContent=(p.siege?p.siege.name+" • CC: "+p.siege.cc:"");
 el("steps").innerHTML=(p.steps||[]).map(function(x,i){return '<div class="step"><b>'+(i+1)+'.</b> '+esc(x)+'</div>'}).join("");
 el("timing").innerHTML=(p.timing||[]).map(function(x){return '<div class="step">⏱️ '+esc(x)+'</div>'}).join("");
 el("backup").innerHTML=(p.backup||[]).map(function(x){return '<div class="step">🛡️ '+esc(x)+'</div>'}).join("");
 el("warnings").innerHTML=(p.warnings||[]).map(function(x){return '<div class="step">⚠️ '+esc(x)+'</div>'}).join("");
 el("result").style.display="block";lastMap=p.map||null;if(lastMap)drawMap(lastMap)
}
function drawMap(m){
 if(!preview.complete||!preview.naturalWidth)return;
 var r=preview.getBoundingClientRect(),dpr=window.devicePixelRatio||1;canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));canvas.style.width=r.width+"px";canvas.style.height=r.height+"px";
 var c=canvas.getContext("2d");c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,r.width,r.height);
 var arr=[m.entry,m.funnelL,m.funnelR,m.main,m.core,m.target].filter(Boolean),centers=[];
 arr.forEach(function(b,i){var x=r.width*b.x/100,y=r.height*b.y/100,w=r.width*b.width/100,h=r.height*b.height/100;c.strokeStyle="#ffd400";c.lineWidth=3;c.strokeRect(x,y,w,h);c.fillStyle="rgba(0,0,0,.65)";c.fillRect(x,y,Math.min(w,115),24);c.fillStyle="#fff";c.font="bold 11px Arial";c.fillText(b.label,x+4,y+16);centers.push([x+w/2,y+h/2])});
 c.strokeStyle="#ff3b30";c.lineWidth=4;c.beginPath();centers.forEach(function(p,i){if(i===0)c.moveTo(p[0],p[1]);else c.lineTo(p[0],p[1])});c.stroke();
 (m.spells||[]).forEach(function(b){var x=r.width*b.x/100,y=r.height*b.y/100,w=r.width*b.width/100,h=r.height*b.height/100;c.strokeStyle="#44e6ff";c.lineWidth=3;c.strokeRect(x,y,w,h)})
}
window.addEventListener("resize",function(){if(lastMap)drawMap(lastMap)});
})();
</script>
</body></html>`;