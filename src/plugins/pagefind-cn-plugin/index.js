const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

function generateChineseTokens(text) {
  const result = [];

  const chars =
    text.match(/[\u4e00-\u9fa5]/g) || [];

  result.push(...chars);

  for (let i = 0; i < chars.length - 1; i++) {
    result.push(chars[i] + chars[i + 1]);
  }

  return result;
}

function processHtml(html) {
  const $ = cheerio.load(html);

  let index = 0;

  $("p,li,h1,h2,h3,h4").each(
    (_, el) => {
      $(el).attr(
        "id",
        `pf-${index++}`,
      );
    },
  );

  const text = $("body").text();

  const chineseText =
    text.match(/[\u4e00-\u9fa5]+/g) || [];

  const tokens = chineseText.flatMap(
    generateChineseTokens,
  );

  $("body").append(`
    <div hidden data-pagefind-body>
      ${tokens.join(" ")}
    </div>
  `);

  return $.html();
}

function walk(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith(".html")) {
      const html =
        fs.readFileSync(fullPath, "utf-8");

      const processed =
        processHtml(html);

      fs.writeFileSync(
        fullPath,
        processed,
      );
    }
  });
}

walk("./build");