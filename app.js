const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

const adminRouter = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/404");

app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRouter);
app.use(shopRoutes);
app.use(errorController.get404);

app.listen(3000);
