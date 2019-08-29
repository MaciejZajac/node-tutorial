const express = require("express");
const path = require("path");
const rootDir = require("../util/path");
const router = express.Router();

router.get("/add-product", (req, res) => {
    res.sendFile(path.join(rootDir, "views", "add-product.html"));
    // res.send(
    //     "<form action='/admin/product' method='POST'><input type='text' name='title'></input><button type='submit'>Send</button></form>"
    // );
});

router.post("/add-product", (req, res) => {
    console.log("req.body", req.body);
    res.redirect("/");
});

module.exports = router;
