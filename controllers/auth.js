const User = require("../models/user");
const bcrypt = require("bcryptjs");
exports.getLogin = (req, res) => {
    res.render("auth/login", {
        docTitle: "Login",
        path: "/login",
        isAuthenticated: false
    });
};
exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;
    User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.redirect("/login");
            }
            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err);
                            res.redirect("/");
                        });
                    }
                    res.redirect("/login");
                })
                .catch(err => {
                    console.log(err);
                    res.redirect("/login");
                });
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/");
    });
};

exports.getSignup = (req, res, next) => {
    res.render("auth/signup", {
        path: "/signup",
        docTitle: "Signup",
        isAuthenticated: false
    });
};

exports.postSignup = (req, res, next) => {
    const { email, password, confirmPassword } = req.body;
    User.findOne({ email })
        .then(userDoc => {
            if (userDoc) {
                return res.redirect("/signup");
            }
            return bcrypt.hash(password, 12).then(hashedpassword => {
                const user = new User({ email: email, password: hashedpassword, cart: { items: [] } });
                return user.save();
            });
        })
        .then.then(() => {
            res.redirect("/login");
        })
        .catch(err => console.log(err));
};
