const MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/test") {
      if (!env.AI) {
        return Response.json(
          { ok: false, error: "AI binding missing" },
          { status: 500 }
        );
      }

      try {
        const result = await env.AI.run(MODEL, {
          messages: [
            {
              role: "system",
              content: "You are a Clash of Clans strategy assistant."
            },
            {
              role: "user",
              content: "Reply only with: V11 AI WORKING"
            }
          ],
          max_tokens: 30
        });

        return Response.json({
          ok: true,
          model: MODEL,
          result
        });
      } catch (error) {
        return Response.json(
          {
            ok: false,
            error: String(error?.message || error)
          },
          { status: 500 }
        );
      }
    }

    return new Response(
`<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CoC V11</title>
<style>
body{
  margin:0;
  background:#07101d;
  color:#fff;
  font-family:Arial,sans-serif;
}
main{
  max-width:760px;
  margin:auto;
  padding:24px;
}
.card{
  margin-top:25px;
  padding:25px;
  border:1px solid #38557a;
  border-radius:25px;
  background:#101c2f;
}
.badge{
  display:inline-block;
  background:#ffc928;
  color:#111;
  padding:10px 16px;
  border-radius:20px;
  font-weight:900;
}
h1{font-size:38px}
button{
  width:100%;
  padding:18px;
  border:0;
  border-radius:16px;
  background:#ffc928;
  font-size:18px;
  font-weight:900;
}
#result{
  margin-top:18px;
  white-space:pre-wrap;
  color:#b9cae2;
}
</style>
</head>
<body>
<main>
  <div class="card">
    <span class="badge">V11 TEST</span>
    <h1>🏆 CoC War Intelligence</h1>
    <p>Cloudflare Workers AI connection test</p>
    <button onclick="testAI()">Test V11 AI</button>
    <div id="result"></div>
  </div>
</main>

<script>
async function testAI(){
  const out=document.getElementById("result");
  out.textContent="Testing AI...";

  try{
    const r=await fetch("/api/test");
    const data=await r.json();
    out.textContent=JSON.stringify(data,null,2);
  }catch(e){
    out.textContent="ERROR: "+e.message;
  }
}
</script>
</body>
</html>`,
      {
        headers: {
          "content-type": "text/html;charset=UTF-8"
        }
      }
    );
  }
};
