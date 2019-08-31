const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

const adminData = require("./routes/admin");
const shopRoutes = require("./routes/shop");
app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminData.router);
app.use(shopRoutes);

app.use((req, res, next) => {
    // res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
    res.status(404).render("404", { docTitle: "404 - not Found" });
});

app.listen(3000);
