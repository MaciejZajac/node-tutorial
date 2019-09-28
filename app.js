const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const csrf = require("csurf");
const MongoDBstore = require("connect-mongodb-session")(session);
const errorController = require("./controllers/404");

const MONGODB_URI = "mongodb+srv://maciej:132639@cluster0-m9slc.mongodb.net/shop";

const app = express();
const store = new MongoDBstore({
    uri: MONGODB_URI,
    collection: "sessions"
});
const csrfProtection = csrf();

const User = require("./models/user");

app.set("view engine", "ejs");
app.set("views", "./views");

const adminRouter = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
    session({
        secret: "my secret",
        resave: false,
        saveUninitialized: false,
        store: store
    })
);
app.use(csrfProtection);

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use("/admin", adminRouter);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

mongoose
    .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        app.listen(3000);
    })
    .catch(err => console.log(err));
