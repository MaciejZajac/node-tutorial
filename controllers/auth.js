const User = require("../models/user");

exports.getLogin = (req, res) => {
    res.render("auth/login", {
        docTitle: "Login",
        path: "/login",
        isAuthenticated: false
    });
};
exports.postLogin = (req, res, next) => {
    User.findById("5d8921f01f0b3a3b4f55f0f1")
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save(err => {
                console.log(err);
                res.redirect("/");
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
