const express = require("express");
const path = require("path");
const dirPath = require("./utils/path");
const app = express();
const indexRoute = require("./routes/index");

app.use(express.static(path.join(__dirname, "public")));

app.use(indexRoute);

app.use((res, req, next) => {
    req.sendFile(path.join(dirPath, "views", "404.html"));
});

app.listen(3000);
