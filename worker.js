export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/api/ask") {
      try {
        const { message } = await request.json();
        if (!message?.trim()) return reply({error:"Message required"},400);
        if (!env.AI) return reply({error:"Workers AI binding 'AI' is missing."},500);
        const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
          messages: [
            {role:"system",content:"You are a Clash of Clans strategy assistant. Help with manual attack strategy, army composition, spell and hero timing, war planning, base analysis, upgrade priorities, and practice. Do not automate gameplay, control the game, evade bans, or promise guaranteed results. Give concise practical advice and ask for Town Hall/base details when needed."},
            {role:"user",content:message}
          ]
        });
        return reply({answer: result?.response || "No response received."});
      } catch(e) { return reply({error:e?.message || "Request failed"},500); }
    }
    return new Response(HTML,{headers:{"content-type":"text/html;charset=UTF-8"}});
  }
};
function reply(x,status=200){return new Response(JSON.stringify(x),{status,headers:{"content-type":"application/json"}})}
const HTML=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CoC AI Assistant</title><style>
*{box-sizing:border-box}body{margin:0;background:#0b1020;color:white;font-family:system-ui}.w{max-width:720px;margin:auto;padding:20px}.c{background:#151c32;border-radius:20px;padding:20px}h1{margin:0}.s{color:#aeb8d4;margin:6px 0 18px}.chat{min-height:320px;max-height:55vh;overflow:auto}.m{padding:12px;margin:10px 0;border-radius:14px;white-space:pre-wrap}.u{background:#274690;margin-left:15%}.b{background:#202943;margin-right:10%}.r{display:flex;gap:8px}textarea{flex:1;background:#0f1629;color:white;border:1px solid #34405f;border-radius:14px;padding:12px;font-size:16px}button{border:0;border-radius:14px;padding:0 18px;background:#ffd54a;font-weight:700}.n{font-size:12px;color:#8f9ab8;margin-top:12px}</style></head><body><div class="w"><div class="c"><h1>⚔️ CoC AI Assistant</h1><div class="s">Attack strategy • War planning • Upgrade advice</div><div id="chat" class="chat"><div class="m b">Hi! Tell me your Town Hall level and what you need help with.</div></div><div class="r"><textarea id="x" rows="3" placeholder="Example: TH12 war attack strategy..."></textarea><button onclick="send()">Send</button></div><div class="n">Strategy assistant only — it does not control or automate Clash of Clans.</div></div></div><script>
async function send(){let x=document.getElementById('x'),c=document.getElementById('chat'),t=x.value.trim();if(!t)return;let a=document.createElement('div');a.className='m u';a.textContent=t;c.appendChild(a);x.value='';let b=document.createElement('div');b.className='m b';b.textContent='Thinking…';c.appendChild(b);try{let r=await fetch('/api/ask',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message:t})}),j=await r.json();b.textContent=j.answer||('Error: '+j.error)}catch(e){b.textContent='Error: '+e.message}c.scrollTop=c.scrollHeight}</script></body></html>`;