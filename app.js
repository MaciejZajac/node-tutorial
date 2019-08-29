const express = require("express");

const app = express();

app.use("/users", (req, res) => {
    console.log("First Middleware");
    res.send("<h1>jesteś na /users</h1>");
});

app.use("/", (req, res) => {
    console.log("Second Middleware");
    res.send("<h1>jesteś na /</h1>");
});

app.listen(3000);
