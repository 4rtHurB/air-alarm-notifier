const fs = require("fs");
const express = require("express");
const logger = require("morgan");
const deepai = require("deepai");
const cors = require("cors");

deepai.setApiKey("b0230f15-9826-4a94-b326-7b09f1ebd62f");

const app = express();
app.use(logger("dev"));
app.use(cors());
app.get("/", async function (req, res, next) {
  res.send("It works :)");
});
app.get("/:name", async function (req, res, next) {
  console.log(req.params.name);
  try {
    const result = await deepai.callStandardApi("image-similarity", {
      image1: fs.createReadStream(`../${req.params.name}`),
      image2: "https://i.ibb.co/ft46v8C/photo1645977046.jpg",
    });
    console.log(result);
    res.json(result.output);
  } catch (e) {
    console.error(e.message);
  }
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`Start image-comparer (port=${PORT})`);
});

module.exports = app;
