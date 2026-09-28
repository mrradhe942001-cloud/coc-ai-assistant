const MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

const VALID = {
  troops: [
    "Barbarian","Archer","Giant","Goblin","Wall Breaker","Balloon","Wizard","Healer",
    "Dragon","P.E.K.K.A","Baby Dragon","Miner","Electro Dragon","Yeti","Dragon Rider",
    "Electro Titan","Root Rider","Thrower",
    "Minion","Hog Rider","Valkyrie","Golem","Witch","Lava Hound","Bowler","Ice Golem",
    "Headhunter","Apprentice Warden"
  ],
  spells: [
    "Lightning Spell","Healing Spell","Rage Spell","Jump Spell","Freeze Spell",
    "Clone Spell","Invisibility Spell","Recall Spell","Revive Spell",
    "Poison Spell","Earthquake Spell","Haste Spell","Skeleton Spell","Bat Spell"
  ],
  heroes: ["Barbarian King","Archer Queen","Grand Warden","Royal Champion","Minion Prince"],
  sieges: ["None","Wall Wrecker","Battle Blimp","Stone Slammer","Siege Barracks","Log Launcher","Flame Flinger","Battle Drill"]
};

function json(data, status=200){
  return new Response(JSON.stringify(data), {
    status,
    headers: {"content-type":"application/json; charset=utf-8"}
  });
}

function extractText(r){
  if (typeof r === "string") return r;
  if (r?.response) return r.response;
  if (r?.result && typeof r.result === "string") return r.result;
  if (r?.choices?.[0]?.message?.content) return r.choices[0].message.content;
  return JSON.stringify(r);
}

function schema(){
  const point = {
    type:"object",
    properties:{
      x:{type:"number",minimum:0,maximum:100},
      y:{type:"number",minimum:0,maximum:100},
      label:{type:"string"}
    },
    required:["x","y","label"],
    additionalProperties:false
  };
  return {
    type:"object",
    properties:{
      title:{type:"string"},
      baseRead:{type:"string"},
      confidence:{type:"string",enum:["high","medium","low"]},
      army:{type:"array",items:{type:"object",properties:{
        name:{type:"string",enum:VALID.troops},qty:{type:"integer",minimum:1},role:{type:"string"}
      },required:["name","qty","role"],additionalProperties:false}},
      spells:{type:"array",items:{type:"object",properties:{
        name:{type:"string",enum:VALID.spells},qty:{type:"integer",minimum:1},role:{type:"string"}
      },required:["name","qty","role"],additionalProperties:false}},
      heroes:{type:"array",items:{type:"object",properties:{
        name:{type:"string",enum:VALID.heroes},role:{type:"string"},ability:{type:"string"}
      },required:["name","role","ability"],additionalProperties:false}},
      siege:{type:"object",properties:{
        name:{type:"string",enum:VALID.sieges},cc:{type:"string"}
      },required:["name","cc"],additionalProperties:false},
      map:{type:"object",properties:{
        entry:point,funnelA:point,funnelB:point,main:point,core:point,target:point,
        spells:{type:"array",items:point}
      },required:["entry","funnelA","funnelB","main","core","target","spells"],additionalProperties:false},
      deployment:{type:"array",items:{type:"string"}},
      timing:{type:"array",items:{type:"string"}},
      backup:{type:"array",items:{type:"string"}},
      warnings:{type:"array",items:{type:"string"}}
    },
    required:["title","baseRead","confidence","army","spells","heroes","siege","map","deployment","timing","backup","warnings"],
    additionalProperties:false
  };
}

function validatePlan(p){
  const bad=[];
  for(const x of p.army||[]) if(!VALID.troops.includes(x.name)) bad.push("troop:"+x.name);
  for(const x of p.spells||[]) if(!VALID.spells.includes(x.name)) bad.push("spell:"+x.name);
  for(const x of p.heroes||[]) if(!VALID.heroes.includes(x.name)) bad.push("hero:"+x.name);
  if(p.siege && !VALID.sieges.includes(p.siege.name)) bad.push("siege:"+p.siege.name);
  return bad;
}

async function makePlan(env, body){
  const th = Math.max(1, Math.min(18, Number(body.th)||18));
  const mode = String(body.mode||"war");
  const question = String(body.question||"").slice(0,2000);

  const prompt = `You are a careful Clash of Clans attack planner.
Selected Town Hall: TH${th}. Goal: ${mode}.
Analyze the supplied base screenshot if present.
Never invent a troop, spell, hero, siege, building, or mechanic.
Use ONLY names allowed by the JSON schema.
Recommend a practical COMPLETE attack composition suitable for the selected TH; do not claim a guaranteed 3-star.
If an item is not available at the selected TH, do not use it.
Give concrete deployment order, funnel instructions, spell timing, hero ability timing and backup plan.
Map coordinates are percentages of the uploaded screenshot: x=0 left, x=100 right, y=0 top, y=100 bottom.
Place ENTRY on the actual deployment edge, FUNNEL A/B on both funnel sides, MAIN on main deployment, CORE on core, TARGET on the main objective.
User note: ${question || "none"}`;

  const input = {
    messages:[
      {role:"system",content:"Return only the requested structured attack plan. Be conservative when the screenshot is unclear."},
      {role:"user",content:prompt}
    ],
    guided_json:schema(),
    max_tokens:2200,
    temperature:0.15
  };

  if(body.image){
    // Data URL -> raw bytes. This keeps V11 compatible with the working vision path.
    const b64 = String(body.image).split(",")[1] || "";
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
    input.image = [...bytes];
  }

  const result = await env.AI.run(MODEL, input);
  let text = extractText(result);
  let plan;
  try { plan = typeof text === "string" ? JSON.parse(text) : text; }
  catch(e){ throw new Error("AI returned invalid JSON"); }

  const bad = validatePlan(plan);
  if(bad.length) throw new Error("Invalid game names rejected: "+bad.join(", "));
  return plan;
}

const HTML = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>CoC Battle AI V11</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#07111f;color:#eef5ff;font-family:system-ui,Arial}
main{max-width:850px;margin:auto;padding:18px}.card{background:#0e1d32;border:1px solid #315276;border-radius:24px;padding:20px;margin:14px 0}
.badge{display:inline-block;background:#ffc62d;color:#101010;padding:10px 16px;border-radius:30px;font-weight:900}
h1{font-size:34px;margin:14px 0}label{font-weight:800;display:block;margin:13px 0 6px}
select,textarea,input,button{width:100%;font:inherit;border-radius:14px;padding:13px;border:1px solid #41658d;background:#09182a;color:white}
button{background:#ffc62d;color:#111;border:0;font-weight:900;margin-top:14px}.stage{position:relative;margin-top:15px;display:none}
#preview,#map{width:100%;border-radius:16px;display:block}#map{position:absolute;inset:0;height:100%}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:10px}.unit{padding:11px;border:1px solid #35577d;border-radius:14px;background:#09182a}
small{color:#a9bdd4}.err{color:#ff9a9a;white-space:pre-wrap}.steps li{margin:8px 0}
</style></head><body><main>
<div class="card"><span class="badge">V11</span><h1>⚔️ CoC Battle AI</h1>
<label>Town Hall</label><select id="th"></select>
<label>Mode</label><select id="mode"><option value="war">War Attack</option><option value="farming">Farming</option></select>
<label>Base Screenshot (max 20 MB)</label><input id="file" type="file" accept="image/png,image/jpeg,image/webp">
<div class="stage" id="stage"><img id="preview"><canvas id="map"></canvas></div>
<label>Extra note (optional)</label><textarea id="q" rows="3" placeholder="Example: Queen charge avoid karna hai"></textarea>
<button id="go">Analyze & Make Strategy</button><div id="status"></div></div>
<div id="out"></div>
</main><script>
const th=document.getElementById("th");for(let i=1;i<=18;i++){let o=document.createElement("option");o.value=i;o.textContent="TH"+i;if(i===18)o.selected=true;th.appendChild(o)}
let imageData="",lastMap=null;
const file=document.getElementById("file"),preview=document.getElementById("preview"),stage=document.getElementById("stage");
file.onchange=async()=>{const f=file.files[0];if(!f)return;if(f.size>20*1024*1024){alert("20 MB se chhoti image select karo");return}
 const url=URL.createObjectURL(f),im=new Image();im.onload=()=>{let w=im.width,h=im.height,m=Math.max(w,h);if(m>1600){let s=1600/m;w=Math.round(w*s);h=Math.round(h*s)}
 let c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(im,0,0,w,h);imageData=c.toDataURL("image/jpeg",.88);preview.src=imageData;stage.style.display="block";preview.onload=()=>{if(lastMap)draw(lastMap)}};im.src=url};

function esc(s){return String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]))}
function cards(a){return '<div class="grid">'+(a||[]).map(x=>'<div class="unit"><b>'+esc(x.qty?x.qty+" × ":"")+esc(x.name)+'</b><br><small>'+esc(x.role||x.ability||"")+'</small></div>').join("")+'</div>'}
function list(a){return '<ol class="steps">'+(a||[]).map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol>'}
function draw(m){lastMap=m;if(!preview.complete)return;const c=document.getElementById("map"),r=preview.getBoundingClientRect(),d=devicePixelRatio||1;c.width=Math.round(r.width*d);c.height=Math.round(r.height*d);c.style.width=r.width+"px";c.style.height=r.height+"px";let x=c.getContext("2d");x.scale(d,d);
 const pts=[m.entry,m.funnelA,m.main,m.core,m.target,m.funnelB].filter(Boolean);x.lineWidth=4;x.strokeStyle="#ffd12f";x.fillStyle="#ffd12f";
 function P(p){return [p.x*r.width/100,p.y*r.height/100]}function arrow(a,b){let A=P(a),B=P(b);x.beginPath();x.moveTo(...A);x.lineTo(...B);x.stroke();let ang=Math.atan2(B[1]-A[1],B[0]-A[0]);x.beginPath();x.moveTo(B[0],B[1]);x.lineTo(B[0]-14*Math.cos(ang-.55),B[1]-14*Math.sin(ang-.55));x.lineTo(B[0]-14*Math.cos(ang+.55),B[1]-14*Math.sin(ang+.55));x.closePath();x.fill()}
 if(m.entry&&m.main)arrow(m.entry,m.main);if(m.funnelA&&m.main)arrow(m.funnelA,m.main);if(m.funnelB&&m.main)arrow(m.funnelB,m.main);if(m.main&&m.core)arrow(m.main,m.core);if(m.core&&m.target)arrow(m.core,m.target);
 [...pts,...(m.spells||[])].forEach(p=>{let q=P(p);x.beginPath();x.arc(q[0],q[1],9,0,Math.PI*2);x.fill();x.font="bold 12px system-ui";x.fillStyle="#fff";x.strokeStyle="#000";x.lineWidth=4;x.strokeText(p.label,q[0]+12,q[1]-8);x.fillText(p.label,q[0]+12,q[1]-8);x.fillStyle="#ffd12f";x.strokeStyle="#ffd12f";x.lineWidth=4})}
window.onresize=()=>lastMap&&draw(lastMap);

document.getElementById("go").onclick=async()=>{let st=document.getElementById("status"),out=document.getElementById("out");st.innerHTML="<p>AI base analyze kar raha hai...</p>";out.innerHTML="";
 try{let r=await fetch("/api/plan",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({th:th.value,mode:document.getElementById("mode").value,question:document.getElementById("q").value,image:imageData})});let d=await r.json();if(!r.ok)throw Error(d.error||"Request failed");draw(d.map);
 out.innerHTML='<div class="card"><h2>'+esc(d.title)+'</h2><p>'+esc(d.baseRead)+'</p><small>Confidence: '+esc(d.confidence)+'</small></div>'+
 '<div class="card"><h2>Army</h2>'+cards(d.army)+'</div><div class="card"><h2>Spells</h2>'+cards(d.spells)+'</div>'+
 '<div class="card"><h2>Heroes</h2>'+cards(d.heroes)+'</div><div class="card"><h2>Siege / CC</h2><p><b>'+esc(d.siege.name)+'</b> — '+esc(d.siege.cc)+'</p></div>'+
 '<div class="card"><h2>Deployment Order</h2>'+list(d.deployment)+'</div><div class="card"><h2>Timing</h2>'+list(d.timing)+'</div>'+
 '<div class="card"><h2>Backup Plan</h2>'+list(d.backup)+'</div><div class="card"><h2>Warnings</h2>'+list(d.warnings)+'</div>';st.innerHTML="<p>✅ Strategy ready. Screenshot par roadmap bhi draw ho gaya.</p>";
 }catch(e){st.innerHTML='<p class="err">❌ '+esc(e.message)+'</p>'}}
</script></body></html>`;

export default {
  async fetch(request, env){
    const url=new URL(request.url);
    if(request.method==="POST" && url.pathname==="/api/plan"){
      try{
        const body=await request.json();
        const plan=await makePlan(env,body);
        return json(plan);
      }catch(e){return json({error:e.message||String(e)},500)}
    }
    return new Response(HTML,{headers:{"content-type":"text/html; charset=utf-8"}});
  }
};
