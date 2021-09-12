const express = require("express");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

function waitAndRespond(waitDuration = 5000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Promise -> Done");
    }, waitDuration);
  });
}

function updateHtmlStr(str, option) {
  // Update Wait Time
  str = str.replace("{htmlWait}", option.htmlWait);
  str = str.replace("{cssWait}", option.cssWait);
  str = str.replace("{jsWait}", option.jsWait);

  // Update JavaScript Load Attribute
  str = str.replace(
    'src="./main.js"',
    `src="./main.js" ${option.jsLoadingAttr}`
  );

  return str;
}

function cookieParse(cookie) {
  const values = cookie.split(";").reduce((res, item) => {
    const data = item.trim().split("=");
    return { ...res, [data[0]]: data[1] };
  }, {});

  return values;
}

app.get(["/", "/*.html"], (req, res) => {
  console.log("loading : ", req.path);

  const {
    htmlWait = 0,
    cssWait = 0,
    jsWait = 0,
    jsLoadingAttr = "",
  } = req.query;

  const derievedQueryObj = { htmlWait, cssWait, jsWait, jsLoadingAttr };

  res.cookie("htmlWait", htmlWait);
  res.cookie("cssWait", cssWait);
  res.cookie("jsWait", jsWait);

  let htmlPath = req.path;

  if (req.path === "/") {
    htmlPath = "/index.html";
  }

  fs.readFile(
    `src/server/static-files${htmlPath}`,
    "utf8",
    async function (err, data) {
      if (err) throw err;
      const updatedData = updateHtmlStr(data, {
        ...derievedQueryObj,
        jsLoadingAttr,
      });
      await waitAndRespond(htmlWait);
      res.send(updatedData);
    }
  );
});

app.get("/*.css", (req, res) => {
  console.log("loading : ", req.path);
  const cookieValues = cookieParse(req.headers.cookie);

  fs.readFile(
    `src/server/static-files${req.path}`,
    "utf8",
    async function (err, data) {
      if (err) throw err;
      await waitAndRespond(cookieValues.cssWait);
      res.type("css");
      res.send(data);
    }
  );
});

app.get("/*.js", (req, res) => {
  console.log("loading : ", req.path);
  const cookieValues = cookieParse(req.headers.cookie);

  fs.readFile(
    `src/server/static-files${req.path}`,
    "utf8",
    async function (err, data) {
      if (err) throw err;
      await waitAndRespond(cookieValues.jsWait);
      res.send(data);
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
