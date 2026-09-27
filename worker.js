const MODEL="@cf/meta/llama-4-scout-17b-16e-instruct";

const SYSTEM=`You are CoC Battle AI. Give CURRENT practical Clash of Clans strategies, not nostalgic/outdated defaults.
Reply ONLY as valid JSON, no markdown.
Never invent troops, spells, heroes, pets, siege machines, buildings or copy links.
Use only units available at the player's selected Town Hall.
For screenshots, inspect only visible facts; hidden traps are unknown.
Choose the army based on visible base geometry/defenses and current practical meta, not a fixed TH army.
Return a COMPLETE army, not a partial example. If exact capacity is uncertain say so in warnings.
Coordinates x/y are percentages 0-100 measured from top-left of uploaded image.
JSON shape:
{
"title":"","confidence":"high|medium|low","baseRead":"",
"army":[{"name":"","qty":0,"role":""}],
"spells":[{"name":"","qty":0,"role":""}],
"heroes":[{"name":"","role":"","ability":""}],
"siege":{"name":"","cc":""},
"map":{"entry":{"x":50,"y":90,"label":"ENTRY"},"funnelA":{"x":25,"y":80,"label":"FUNNEL A"},"funnelB":{"x":75,"y":80,"label":"FUNNEL B"},"main":{"x":50,"y":85,"label":"MAIN"},"core":{"x":50,"y":50,"label":"CORE"},"target":{"x":50,"y":35,"label":"TARGET"},"spells":[{"x":50,"y":55,"label":"Rage"}]},
"path":["Entry","Funnel","Main Army","Core","Town Hall"],
"deployment":[{"step":1,"text":""}],
"timing":[""],"backup":[""],"practice":[""],"warnings":[""]
}
For non-screenshot questions still return the same shape; use sensible map defaults.
For war-base design, describe design in baseRead/deployment, but never fabricate a Clash layout URL.`;

const META_NOTE=`Meta freshness note: July 2026 official Supercell data said TH18-vs-TH18 war usage was led by Dragon armies often with Dragon Duke/Dragon Riders, while Throwers with Healers were also highly used. Do not blindly recommend either: use the screenshot and later balance context.`;

const ICONS={
"Barbarian":"⚔️",
"Archer":"🏹",
"Giant":"🛡️",
"Goblin":"💰",
"Wall Breaker":"💣",
"Balloon":"🎈",
"Wizard":"🧙",
"Healer":"✨",
"Dragon":"🐉",
"P.E.K.K.A":"🤖",
"Baby Dragon":"🐲",
"Miner":"⛏️",
"Electro Dragon":"⚡",
"Yeti":"❄️",
"Dragon Rider":"🐉",
"Root Rider":"🌳",
"Thrower":"🪃",
"Hog Rider":"🐗",
"Valkyrie":"🪓",
"Golem":"🪨",
"Witch":"🧙‍♀️",
"Bowler":"🔵",
"Ice Golem":"🧊",
"Headhunter":"🎯",
"Druid":"🌿",

"Barbarian King":"👑",
"Archer Queen":"👸",
"Minion Prince":"🦇",
"Grand Warden":"📘",
"Royal Champion":"🛡️",
"Dragon Duke":"🐲",

"Rage":"🟣",
"Freeze":"🧊",
"Heal":"💛",
"Jump":"🟢",
"Poison":"☠️",
"Invisibility":"👻",
"Recall":"↩️",
"Overgrowth":"🌿",
"Clone":"👥",
"Lightning":"⚡"
};

export default{
async fetch(request,env){

 const u=new URL(request.url);

 if(request.method==="POST"&&u.pathname==="/api/ask"){

  try{

   if(!env.AI)
     return J({error:"AI binding nahi mila."},500);

   const b=await request.json();

   const th=String(b.th||"");
   const mode=String(b.mode||"war");
   const msg=String(b.message||"");
   const image=b.image||null;

   if(!th)
     return J({error:"Town Hall select karo."},400);

   let p=
   `Player ${th}. Mode ${mode}. ${META_NOTE}
Request: ${msg||"Analyze screenshot and make the strongest practical plan."}`;

   if(image)
     p+=`
Image attached.
Map coordinates MUST match this exact screenshot.
Give complete army and exact funnel/deployment path.`;

   const input={
     messages:[
       {
         role:"system",
         content:SYSTEM
       },
       {
         role:"user",
         content:p
       }
     ],
     max_tokens:3000,
     temperature:.1
   };

   if(image)
     input.image=image;

   const r=await env.AI.run(MODEL,input);

   let raw=
     r?.response ??
     r?.result ??
     r;

   let plan=parsePlan(raw);

   plan=normalize(plan);

   return J({
     plan,
     icons:ICONS
   });

  }catch(e){

   return J({
     error:e?.message||"Unknown error"
   },500);

  }

 }

 return new Response(PAGE,{
   headers:{
     "content-type":"text/html;charset=UTF-8"
   }
 });

}};


function parsePlan(raw){

 if(typeof raw==="object")
   return raw;

 let s=String(raw||"")
   .trim()
   .replace(/^```json\s*/i,"")
   .replace(/```$/,"")
   .trim();

 const a=s.indexOf("{");
 const z=s.lastIndexOf("}");

 if(a>=0&&z>a)
   s=s.slice(a,z+1);

 try{

   return JSON.parse(s);

 }catch{

   throw new Error(
     "AI structured plan nahi bana paya. Dobara Strategy dabao."
   );

 }

}


function normalize(p){

 p=p||{};

 for(const k of [
   "army",
   "spells",
   "heroes",
   "deployment",
   "timing",
   "backup",
   "practice",
   "warnings"
 ]){

   if(!Array.isArray(p[k]))
     p[k]=[];

 }

 p.map=p.map||{};

 if(!Array.isArray(p.map.spells))
   p.map.spells=[];

 if(!Array.isArray(p.map.path))
   p.map.path=[];

 return p;

}


function J(x,s=200){

 return new Response(
   JSON.stringify(x),
   {
     status:s,
     headers:{
       "content-type":"application/json"
     }
   }
 );

}


const PAGE=`<!doctype html>

<html>

<head>

<meta charset="utf-8">

<meta
 name="viewport"
 content="width=device-width,initial-scale=1"
>

<title>CoC Battle AI V2</title>

<style>

*{
 box-sizing:border-box
}

body{
 margin:0;
 background:#070b12;
 color:#eef3ff;
 font-family:Arial,sans-serif
}

.app{
 max-width:820px;
 margin:auto;
 padding:14px
}

.hero,
.card{
 background:#111827;
 border:1px solid #27354d;
 border-radius:18px;
 padding:15px;
 margin-bottom:12px
}

.hero{
 background:linear-gradient(
   135deg,
   #17233a,
   #0d1422
 )
}

.badge{
 display:inline-block;
 background:#ffd12f;
 color:#111;
 padding:6px 10px;
 border-radius:20px;
 font-size:11px;
 font-weight:900
}

h1{
 margin:9px 0 4px
}

.muted{
 color:#9eacc2;
 font-size:13px
}

.grid{
 display:grid;
 grid-template-columns:1fr 1fr;
 gap:8px
}

.mode,
button,
select,
textarea{
 border-radius:11px;
 border:1px solid #34435e;
 background:#151f31;
 color:white;
 padding:12px;
 font-size:14px
}

.mode.on,
.go{
 background:#ffd12f;
 color:#111;
 font-weight:900
}

select,
textarea{
 width:100%
}

textarea{
 min-height:82px;
 margin-top:9px
}

.upload{
 display:block;
 text-align:center;
 border:2px dashed #40516f;
 padding:16px;
 border-radius:14px
}

.go{
 width:100%;
 margin-top:10px;
 border:0
}

#previewWrap{
 display:none;
 position:relative;
 margin-top:10px
}

#preview{
 width:100%;
 display:block;
 border-radius:12px
}

#map{
 position:absolute;
 inset:0;
 width:100%;
 height:100%;
 pointer-events:none
}

#result{
 display:none
}

.section{
 margin-top:12px
}

.section h3{
 margin:0 0 8px;
 color:#ffd12f
}

.units{
 display:grid;
 grid-template-columns:repeat(3,1fr);
 gap:8px
}

.unit{
 background:#0b1220;
 border:1px solid #2b3951;
 border-radius:12px;
 padding:10px;
 text-align:center
}

.ico{
 font-size:28px
}

.qty{
 font-weight:900;
 color:#ffd12f
}

.role{
 font-size:11px;
 color:#9eacc2;
 margin-top:4px
}

.step{
 background:#0b1220;
 border-left:3px solid #ffd12f;
 padding:10px;
 margin:6px 0;
 border-radius:8px
}

.path{
 padding:10px;
 background:#0b1220;
 border-radius:10px;
 color:#7ee7ff;
 font-weight:700
}

.warn{
 color:#ffbd77;
 font-size:12px
}

.status{
 margin-top:8px;
 color:#a9b7cc;
 font-size:13px
}

@media(max-width:520px){

 .units{
   grid-template-columns:repeat(2,1fr)
 }

}

</style>

</head>

<body>

<div class="app">


<div class="hero">

<span class="badge">
V2 • VISION + VISUAL MAP
</span>

<h1>
⚔️ CoC Battle AI
</h1>

<div class="muted">
Full army • base-specific funnel • visual roadmap • practice
</div>

</div>


<div class="card">

<b>
1️⃣ Town Hall
</b>

<select id="th">

<option value="">
Select TH
</option>

${Array.from(
 {length:18},
 (_,i)=>`<option>TH${i+1}</option>`
).join("")}

</select>

</div>


<div class="card">

<b>
2️⃣ Mode
</b>

<div
 class="grid"
 style="margin-top:9px"
>

<button
 class="mode"
 data-m="attack"
>
⚔️ Attack
</button>

<button
 class="mode"
 data-m="farming"
>
💰 Farming
</button>

<button
 class="mode on"
 data-m="war"
>
🏆 War Screenshot
</button>

<button
 class="mode"
 data-m="base"
>
🏰 War Base Design
</button>

</div>

</div>


<div class="card">

<b>
3️⃣ Screenshot
</b>

<label
 class="upload"
 for="file"
>

📷 Upload Base Screenshot

<br>

<span class="muted">
PNG/JPG/WebP • max 20MB • auto compressed
</span>

</label>

<input
 id="file"
 type="file"
 accept="image/*"
 hidden
>

<div id="previewWrap">

<img id="preview">

<canvas id="map"></canvas>

</div>

</div>


<div class="card">

<b>
4️⃣ Details
</b>

<textarea
 id="msg"
 placeholder="Hero/equipment/troop levels ya special requirement likho..."
></textarea>

<button
 class="go"
 id="go"
>
⚔️ Build Strategy
</button>

<div
 class="status"
 id="status"
></div>

</div>


<div
 class="card"
 id="result"
>

<h2 id="title"></h2>

<div
 id="confidence"
 class="muted"
></div>


<div class="section">

<h3>
🔎 Base Read
</h3>

<div id="baseRead"></div>

</div>


<div class="section">

<h3>
🪖 Full Army
</h3>

<div
 class="units"
 id="army"
></div>

</div>


<div class="section">

<h3>
🧪 Spells
</h3>

<div
 class="units"
 id="spells"
></div>

</div>


<div class="section">

<h3>
👑 Heroes
</h3>

<div
 class="units"
 id="heroes"
></div>

</div>


<div class="section">

<h3>
🚜 Siege + CC
</h3>

<div id="siege"></div>

</div>


<div class="section">

<h3>
🗺️ Attack Roadmap
</h3>

<div
 class="path"
 id="path"
></div>

</div>


<div class="section">

<h3>
🚀 Deployment Order
</h3>

<div id="deploy"></div>

</div>


<div class="section">

<h3>
⏱️ Spell / Ability Timing
</h3>

<div id="timing"></div>

</div>


<div class="section">

<h3>
🔁 Backup
</h3>

<div id="backup"></div>

</div>


<div class="section">

<h3>
🎯 Practice
</h3>

<div id="practice"></div>

</div>


<div
 class="section warn"
 id="warnings"
></div>


</div>


<div
 class="muted"
 style="text-align:center;padding:12px"
>
Unofficial fan strategy tool. Not endorsed by Supercell.
</div>


</div>


<script>

let mode="war";
let img=null;
let icons={};


document
.querySelectorAll(".mode")
.forEach(b=>b.onclick=()=>{

 document
 .querySelectorAll(".mode")
 .forEach(x=>x.classList.remove("on"));

 b.classList.add("on");

 mode=b.dataset.m;

});


file.onchange=async()=>{

 const f=file.files[0];

 if(!f)
   return;

 if(f.size>20*1024*1024)
   return alert("20MB max.");

 status.textContent=
   "Image optimize ho rahi hai...";

 img=await compress(f);

 preview.src=img;

 previewWrap.style.display=
   "block";

 status.textContent=
   "✅ Screenshot ready";

};


function compress(f){

 return new Promise((ok,no)=>{

   let r=new FileReader;

   r.onload=e=>{

     let im=new Image;

     im.onload=()=>{

       let m=1600;

       let s=Math.min(
         1,
         m/Math.max(
           im.width,
           im.height
         )
       );

       let c=
         document.createElement(
           "canvas"
         );

       c.width=
         Math.round(
           im.width*s
         );

       c.height=
         Math.round(
           im.height*s
         );

       c
       .getContext("2d")
       .drawImage(
         im,
         0,
         0,
         c.width,
         c.height
       );

       ok(
         c.toDataURL(
           "image/jpeg",
           .88
         )
       );

     };

     im.onerror=no;

     im.src=e.target.result;

   };

   r.onerror=no;

   r.readAsDataURL(f);

 });

}


go.onclick=async()=>{

 if(!th.value)
   return alert(
     "Town Hall select karo."
   );

 if(mode==="war"&&!img)
   return alert(
     "War Screenshot ke liye screenshot upload karo."
   );

 go.disabled=true;

 status.textContent=
   "🔍 Base + current strategy analyze ho rahi hai...";

 try{

   let r=await fetch(
     "/api/ask",
     {
       method:"POST",

       headers:{
         "content-type":
           "application/json"
       },

       body:JSON.stringify({
         th:th.value,
         mode,
         message:msg.value,
         image:img
       })
     }
   );

   let d=await r.json();

   if(!r.ok)
     throw Error(d.error);

   icons=d.icons||{};

   render(d.plan);

   status.textContent=
     "✅ Complete plan ready";

 }catch(e){

   status.textContent=
     "❌ "+e.message;

 }

 go.disabled=false;

};


function card(x,type){

 let n=x.name||"Unknown";

 let q=x.qty
   ? \` ×\${x.qty}\`
   : "";

 let role=
   x.role||
   x.ability||
   "";

 return \`
 <div class="unit">

   <div class="ico">
     \${icons[n]||fallback(type)}
   </div>

   <div>
     <b>\${safe(n)}</b>
     <span class="qty">\${q}</span>
   </div>

   <div class="role">
     \${safe(role)}
   </div>

 </div>\`;

}


function fallback(t){

 return t==="spell"
   ? "🧪"
   : t==="hero"
   ? "👑"
   : "🪖";

}


function safe(s){

 return String(s||"")
 .replace(
   /[&<>"']/g,
   c=>({
     "&":"&amp;",
     "<":"&lt;",
     ">":"&gt;",
     '"':"&quot;",
     "'":"&#39;"
   }[c])
 );

}


function rows(a){

 return (a||[])
 .map(
   (x,i)=>\`
   <div class="step">
   \${
     typeof x==="string"
     ? safe(x)
     : \`<b>\${x.step||i+1}.</b> \${safe(x.text)}\`
   }
   </div>\`
 )
 .join("");

}


function render(p){

 result.style.display=
   "block";

 title.textContent=
   p.title||
   "Attack Plan";

 confidence.textContent=
   "AI confidence: "+
   (p.confidence||"—");

 baseRead.textContent=
   p.baseRead||
   "—";

 army.innerHTML=
   (p.army||[])
   .map(x=>card(x,"unit"))
   .join("");

 spells.innerHTML=
   (p.spells||[])
   .map(x=>card(x,"spell"))
   .join("");

 heroes.innerHTML=
   (p.heroes||[])
   .map(x=>card(x,"hero"))
   .join("");

 siege.textContent=
   (
     (p.siege?.name||"—")+
     " | CC: "+
     (p.siege?.cc||"—")
   );

 path.textContent=
   (
     p.map?.path||
     p.path||
     []
   ).join(" → ");

 deploy.innerHTML=
   rows(p.deployment);

 timing.innerHTML=
   rows(p.timing);

 backup.innerHTML=
   rows(p.backup);

 practice.innerHTML=
   rows(p.practice);

 warnings.innerHTML=
   (p.warnings||[])
   .map(
     x=>"⚠️ "+safe(x)
   )
   .join("<br>");

 drawMap(
   p.map||{}
 );

 result.scrollIntoView({
   behavior:"smooth"
 });

}


function drawMap(m){

 if(!img)
   return;

 let c=map;

 let ctx=
   c.getContext("2d");

 let w=
   preview.clientWidth;

 let h=
   preview.clientHeight;

 c.width=
   w*devicePixelRatio;

 c.height=
   h*devicePixelRatio;

 c.style.width=
   w+"px";

 c.style.height=
   h+"px";

 ctx.scale(
   devicePixelRatio,
   devicePixelRatio
 );

 ctx.clearRect(
   0,
   0,
   w,
   h
 );


 let pts=[
   m.entry,
   m.funnelA,
   m.main,
   m.core,
   m.target
 ].filter(Boolean);


 if(pts.length>1){

   ctx.lineWidth=4;

   ctx.strokeStyle=
     "#00e5ff";

   ctx.beginPath();

   pts.forEach((p,i)=>{

     let x=
       p.x/100*w;

     let y=
       p.y/100*h;

     i
       ? ctx.lineTo(x,y)
       : ctx.moveTo(x,y);

   });

   ctx.stroke();

 }


 [
   ["#00ff88",m.entry],
   ["#ffd12f",m.funnelA],
   ["#ffd12f",m.funnelB],
   ["#00e5ff",m.main],
   ["#ff8c42",m.core],
   ["#ff4d6d",m.target]
 ]
 .forEach(
   ([col,p])=>
     mark(
       ctx,
       p,
       w,
       h,
       col
     )
 );


 (m.spells||[])
 .forEach(
   p=>
     mark(
       ctx,
       p,
       w,
       h,
       "#c77dff"
     )
 );

}


function mark(
 ctx,
 p,
 w,
 h,
 col
){

 if(!p)
   return;

 let x=
   p.x/100*w;

 let y=
   p.y/100*h;

 ctx.fillStyle=
   col;

 ctx.beginPath();

 ctx.arc(
   x,
   y,
   8,
   0,
   Math.PI*2
 );

 ctx.fill();


 ctx.font=
   "bold 11px Arial";

 let t=
   p.label||"";

 let tw=
   ctx.measureText(t).width;

 ctx.fillStyle=
   "rgba(0,0,0,.78)";

 ctx.fillRect(
   x+10,
   y-11,
   tw+8,
   17
 );

 ctx.fillStyle=
   "#fff";

 ctx.fillText(
   t,
   x+14,
   y+1
 );

}

</script>

</body>

</html>`;
