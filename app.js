const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBstore = require("connect-mongodb-session")(session);
const errorController = require("./controllers/404");

const MONGODB_URI = "mongodb+srv://maciej:132639@cluster0-m9slc.mongodb.net/shop";

const app = express();
const store = new MongoDBstore({
    uri: MONGODB_URI,
    collection: "sessions"
});

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

app.use((req, res, next) => {
    User.findById("5d8921f01f0b3a3b4f55f0f1")
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use("/admin", adminRouter);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

// console.log(mongoConnect);
mongoose
    .connect(MONGODB_URI)
    .then(result => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: "Maciej",
                    email: "maciej.zajac.197@gmail.com",
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
        });
        app.listen(3000);
    })
    .catch(err => console.log(err));
