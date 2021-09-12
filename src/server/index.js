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

function updateResponseTime(str, data) {
  str = str.replace("{htmlWait}", data.htmlWait);
  str = str.replace("{cssWait}", data.cssWait);
  str = str.replace("{jsWait}", data.jsWait);

  return str;
}

function cookieParse(cookie) {
  const values = cookie.split(";").reduce((res, item) => {
    const data = item.trim().split("=");
    return { ...res, [data[0]]: data[1] };
  }, {});

  return values;
}

app.get("/", (req, res) => {
  const { htmlWait = 0, cssWait = 0, jsWait = 0 } = req.query;

  const derievedQueryObj = { htmlWait, cssWait, jsWait };

  res.cookie("htmlWait", htmlWait);
  res.cookie("cssWait", cssWait);
  res.cookie("jsWait", jsWait);

  fs.readFile("src/server/dist/index.html", "utf8", async function (err, data) {
    if (err) throw err;
    const updatedData = updateResponseTime(data, derievedQueryObj);
    await waitAndRespond(htmlWait);

    res.send(updatedData);
  });

  // console.log("end");
});

app.get("/*.css", (req, res) => {
  console.log();
  const cookieValues = cookieParse(req.headers.cookie);
  console.log(">>>> 🔥   cookieValues", cookieValues.cssWait);

  fs.readFile(`src/server/dist${req.path}`, "utf8", async function (err, data) {
    if (err) throw err;
    await waitAndRespond(cookieValues.cssWait);
    res.type("css");
    res.send(data);
  });
});

app.get("/*.js", (req, res) => {
  const cookieValues = cookieParse(req.headers.cookie);
  console.log(">>>> 🔥   cookieValues", cookieValues.jsWait);

  fs.readFile(`src/server/dist${req.path}`, "utf8", async function (err, data) {
    if (err) throw err;
    await waitAndRespond(cookieValues.jsWait);
    // res.type("css");
    res.send(data);
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
