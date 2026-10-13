```js
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// عرض الصور من مجلد images
app.use(
  "/images",
  express.static(path.join(__dirname, "images"))
);

// الصفحة الرئيسية
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>HF4</title>

      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          width: 100%;
          min-height: 100%;
        }

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

    <body>
    </body>
    </html>
  `);
});

// تشغيل الموقع محليًا أو على الاستضافة
app.listen(PORT, "0.0.0.0", () => {
  console.log("HF4 website is running on port " + PORT);
});
```
