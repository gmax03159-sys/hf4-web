```js
require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// إعداد البروكسي لاستقبال عنوان IP من Render
app.set("trust proxy", 1);

app.use(express.json({ limit: "10kb" }));
app.use("/images", express.static(path.join(__dirname, "images")));

const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HF4 Website</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: Arial, sans-serif;
      background: #111 url('/images/noFilter.webp') center/cover fixed no-repeat;
      color: white;
    }
    .overlay {
      position: fixed;
      inset: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(0, 0, 0, .78);
    }
    .panel {
      width: 100%;
      max-width: 470px;
      padding: 28px;
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 18px;
      background: rgba(20,20,20,.96);
      text-align: center;
      box-shadow: 0 15px 50px rgba(0,0,0,.4);
    }
    h2 { margin-top: 0; }
    p { color: #ddd; line-height: 1.9; font-size: 15px; }
    .buttons {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }
    button {
      flex: 1;
      padding: 13px 10px;
      border: 0;
      border-radius: 9px;
      cursor: pointer;
      font-size: 15px;
      font-weight: bold;
    }
    #allow { background: #e0b82f; color: #171717; }
    #deny { background: #333; color: white; }
    button:disabled { opacity: .6; cursor: wait; }
    #status { font-size: 13px; }
    .hidden { display: none !important; }
  </style>
</head>
<body>
  <main id="consent" class="overlay">
    <section class="panel">
      <h2>موافقة على مشاركة معلومات الزيارة</h2>
      <p>
        عند اختيار «سماح ومتابعة»، ستتم مشاركة عنوان IP الخاص باتصالك،
        ووقت الموافقة، ونوع المتصفح ونظام التشغيل مع إدارة موقع HF4
        عبر إشعار خاص في ديسكورد. قد تتم معالجة عنوان IP تقنيًا
        بواسطة خادم الاستضافة أيضًا.
        <br><br>
        إذا اخترت «رفض ومتابعة»، فلن نرسل إشعار موافقة إلى ديسكورد،
        ويمكنك متابعة الدخول إلى الموقع.
      </p>
      <div class="buttons">
        <button id="allow">سماح ومتابعة</button>
        <button id="deny">رفض ومتابعة</button>
      </div>
      <p id="status"></p>
    </section>
  </main>

  <audio id="siteAudio" src="/images/s420jzh.wav" preload="auto"></audio>

  <script>
    const consent = document.getElementById("consent");
    const allow = document.getElementById("allow");
    const deny = document.getElementById("deny");
    const status = document.getElementById("status");
    const audio = document.getElementById("siteAudio");

    function continueToSite() {
      consent.classList.add("hidden");
      audio.play().catch(() => {});
    }

    function getBrowser() {
      const ua = navigator.userAgent;
      if (ua.includes("Edg/")) return "Edge";
      if (ua.includes("OPR/")) return "Opera";
      if (ua.includes("Firefox/")) return "Firefox";
      if (ua.includes("Chrome/")) return "Chrome";
      if (ua.includes("Safari/")) return "Safari";
      return "غير معروف";
    }

    function getOS() {
      const ua = navigator.userAgent;
      if (ua.includes("Windows")) return "Windows";
      if (ua.includes("Android")) return "Android";
      if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
      if (ua.includes("Mac OS")) return "macOS";
      if (ua.includes("Linux")) return "Linux";
      return "غير معروف";
    }

    allow.addEventListener("click", async () => {
      allow.disabled = true;
      deny.disabled = true;
      status.textContent = "جارٍ تسجيل الموافقة...";

      try {
        const response = await fetch("/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            browser: getBrowser(),
            os: getOS()
          })
        });

        if (!response.ok) {
          throw new Error("تعذّر تسجيل الموافقة");
        }
      } catch (error) {
        status.textContent =
          "تعذّر تسجيل الموافقة. حاول مرة أخرى أو اختر الرفض للمتابعة.";
        allow.disabled = false;
        deny.disabled = false;
        return;
      }

      continueToSite();
    });

    deny.addEventListener("click", () => {
      // لا يتم إرسال طلب الموافقة عند الرفض
      continueToSite();
    });
  </script>
</body>
</html>`;

app.get("/", (req, res) => {
  res.type("html").send(html);
});

app.post("/consent", async (req, res) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(500).json({
      error: "إعداد إشعار ديسكورد غير مكتمل"
    });
  }

  const browser = String(req.body?.browser || "غير معروف").slice(0, 100);
  const os = String(req.body?.os || "غير معروف").slice(0, 100);

  // عنوان الاتصال الذي يراه الخادم خلف بروكسي Render
  const ip = req.ip || "غير متوفر";

  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(new Date());

  try {
    const discordResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          title: "موافقة على مشاركة معلومات الزيارة",
          color: 0xE0B82F,
          fields: [
            { name: "وقت الموافقة", value: time, inline: false },
            { name: "عنوان IP", value: ip, inline: false },
            { name: "المتصفح", value: browser, inline: true },
            { name: "نظام التشغيل", value: os, inline: true }
          ],
          footer: { text: "HF4 Website" }
        }]
      })
    });

    if (!discordResponse.ok) {
      console.error("Discord webhook error:", discordResponse.status);
      return res.status(502).json({ error: "تعذّر إرسال الإشعار" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Consent notification failed:", error.message);
    return res.status(500).json({ error: "حدث خطأ أثناء إرسال الإشعار" });
  }
});

app.listen(PORT, () => {
  console.log("HF4 Website running on port " + PORT);
});
```
