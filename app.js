const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const errorController = require("./controllers/404");
const app = express();

const mongoConnect = require("./util/database").mongoConnect;

app.set("view engine", "ejs");
app.set("views", "./views");

const adminRouter = require("./routes/admin");
// const shopRoutes = require("./routes/shop");

app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    next();
});

app.use("/admin", adminRouter);
// app.use(shopRoutes);
app.use(errorController.get404);

console.log(mongoConnect);
mongoConnect(() => {
    app.listen(3000);
});
