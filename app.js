const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const users = [];

app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", (req, res) => {
    res.render("users", { pageTitle: "List of users", users: users })
})
app.get("/add-user", (req, res) => {
    res.render("add-user", { pageTitle: "Add User" })
})

app.post("/add-user", (req, res) => {
    users.push({ name: req.body.user });
    res.redirect("/users");
})


app.listen(3000);