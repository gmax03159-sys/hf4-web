```js
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>HF4</title>
  <style>
    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      background: #111116 url("/images/noFilter.webp") center/cover no-repeat;
      font-family: Arial, sans-serif;
      color: white;
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.78);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      z-index: 10;
    }

    .panel {
      width: 100%;
      max-width: 420px;
      padding: 26px;
      border: 1px solid #6c5ce7;
      border-radius: 16px;
      background: #191922;
      text-align: center;
      box-shadow: 0 12px 45px #0008;
    }

    h2 { margin-top: 0; }

    p {
      color: #d0d0da;
      line-height: 1.8;
    }

    button {
      width: 100%;
      padding: 13px;
      margin-top: 10px;
      border: 0;
      border-radius: 9px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
    }

    .allow { background: #6c5ce7; color: white; }
    .deny { background: #333340; color: white; }
  </style>
</head>
<body>
  <audio id="scream" src="/images/s420jzh.wav" preload="auto"></audio>

  <div class="overlay" id="consent">
    <div class="panel">
      <h2>🌐 مرحبًا بك في HF4</h2>
      <p>
        بنطلب موافقتك لمشاركة وقت الزيارة ونوع المتصفح
        ونظام التشغيل مع إدارة الموقع عبر إشعار خاص في ديسكورد.
        رفض المشاركة لن يمنعك من دخول الموقع.
      </p>
      <button class="allow" onclick="choose(true)">
        ✅ سماح ومتابعة
      </button>
      <button class="deny" onclick="choose(false)">
        ❌ رفض ومتابعة
      </button>
    </div>
  </div>

  <script>
    async function choose(consent) {
      const overlay = document.getElementById("consent");
      const scream = document.getElementById("scream");

      overlay.style.display = "none";

      if (!consent) return;

      scream.volume = 1;
      scream.currentTime = 0;
      scream.play().catch(() => {
        console.log("تعذّر تشغيل الصوت.");
      });

      const ua = navigator.userAgent || "";

      const browser =
        /Edg\//.test(ua) ? "Edge" :
        /Firefox\//.test(ua) ? "Firefox" :
        /Chrome\//.test(ua) ? "Chrome" :
        /Safari\//.test(ua) ? "Safari" : "غير معروف";

      const os =
        /Android/i.test(ua) ? "Android" :
        /iPhone|iPad|iPod/i.test(ua) ? "iOS" :
        /Windows/i.test(ua) ? "Windows" :
        /Mac OS/i.test(ua) ? "macOS" :
        /Linux/i.test(ua) ? "Linux" : "غير معروف";

      try {
        await fetch("/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ browser, os })
        });
      } catch (error) {
        console.log("تعذّر إرسال الإشعار.");
      }
    }
  </script>
</body>
</html>`);
});

app.post("/consent", async (req, res) => {
  const webhook = process.env.DISCORD_WEBHOOK_URL;

  if (!webhook) return res.sendStatus(204);

  const browser = String(req.body?.browser || "غير معروف").slice(0, 50);
  const os = String(req.body?.os || "غير معروف").slice(0, 50);

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          title: "✅ موافقة على مشاركة معلومات الزيارة",
          color: 0x6c5ce7,
          fields: [
            {
              name: "وقت الموافقة",
              value: new Date().toLocaleString("en-GB", {
                timeZone: "Asia/Jerusalem"
              })
            },
            { name: "المتصفح", value: browser },
            { name: "نظام التشغيل", value: os }
          ],
          footer: { text: "HF4 Website" }
        }]
      })
    });

    if (!response.ok) {
      console.error("Discord webhook status:", response.status);
    }
  } catch (error) {
    console.error("Webhook notification failed:", error.message);
  }

  res.sendStatus(204);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("HF4 website is running on port " + PORT);
});
```
