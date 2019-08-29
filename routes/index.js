const express = require("express");
const router = express.Router();
const path = require("path");
const dirPath = require("../utils/path");

router.get("/", (res, req, next) => {
    req.sendFile(path.join(dirPath, "views", "index.html"));
});

router.get("/users", (res, req, next) => {
    req.sendFile(path.join(dirPath, "views", "users.html"));
});

module.exports = router;
