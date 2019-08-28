const http = require("http");
const express = require("express");
const app = express();

app.use("/add-product", (req, res, next) => {
    res.send("<h1>Add product</h1>");

    // allows the request to continue to the next middleware
});

app.use("/", (req, res, next) => {
    res.send("<h1>Hello from express</h1>");
});

const server = http.createServer(app);

server.listen(3000);
