const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const csrf = require("csurf");
const MongoDBstore = require("connect-mongodb-session")(session);
const errorController = require("./controllers/404");
const shopController = require("./controllers/shop");
const isAuth = require("./middleware/is-auth");

const flash = require("connect-flash");
const multer = require("multer");
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

const fileStorate = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + "-" + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(bodyparser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorate, fileFilter: fileFilter }).single("image"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
    session({
        secret: "my secret",
        resave: false,
        saveUninitialized: false,
        store: store
    })
);
app.use(flash());

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => {
            throw new Error(err);
        });
});

app.post("/create-order", isAuth, shopController.postOrder);

app.use(csrfProtection);

app.use((error, req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use("/admin", adminRouter);
app.use(shopRoutes);
app.use(authRoutes);

app.use("/500", errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
    // res.status(error.httpStatusCode).render(...);
    // res.redirect('/500');
    res.status(500).render("500", {
        docTitle: "Error!",
        path: "/500",
        isAuthenticated: req.session.isLoggedIn
    });
});

mongoose
    .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        app.listen(3000);
    })
    .catch(err => console.log(err));
