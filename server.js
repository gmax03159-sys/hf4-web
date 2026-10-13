
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/images", express.static(path.join(__dirname, "images")));

app.get("/", async (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HF4</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; min-height: 100%; }
    body {
      min-height: 100vh;
      background-image: url("/images/noFilter.webp");
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      background-color: #111116;
    }
  </style>
</head>
<body></body>
</html>`);

  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (webhook) {
    const agent = req.get("user-agent") || "غير معروف";
    const browser = /Edg/i.test(agent) ? "Edge"
      : /Chrome/i.test(agent) ? "Chrome"
      : /Firefox/i.test(agent) ? "Firefox"
      : /Safari/i.test(agent) ? "Safari"
      : "متصفح غير معروف";

    fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          title: "🌐 تم فتح موقع HF4",
          color: 0x6c5ce7,
          fields: [
            { name: "وقت الزيارة", value: new Date().toLocaleString("en-GB", { timeZone: "Asia/Jerusalem" }) },
            { name: "المتصفح", value: browser },
            { name: "الحالة", value: "وصل طلب إلى الموقع" }
          ],
          footer: { text: "HF4 Website" }
        }]
      })
    }).catch(() => {});
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("HF4 website is running on port " + PORT);
});
