const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const errorController = require("./controllers/404");
const app = express();

const mongoConnect = require("./util/database").mongoConnect;
const User = require("./models/user");

app.set("view engine", "ejs");
app.set("views", "./views");

const adminRouter = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    User.findById("5d865af39c72c125b42e51db")
        .then(user => {
            req.user = new User(user.name, user.email, user.cart, user._id);
            next();
        })
        .catch(err => console.log(err));
});

app.use("/admin", adminRouter);
app.use(shopRoutes);
app.use(errorController.get404);

console.log(mongoConnect);
mongoConnect(() => {
    app.listen(3000);
});
