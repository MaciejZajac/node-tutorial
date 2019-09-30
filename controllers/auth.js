const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

const transporter = nodemailer.createTransport(
    sendgridTransport({
        auth: {
            api_user: "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"
        }
    })
);

exports.getLogin = (req, res) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render("auth/login", {
        docTitle: "Login",
        path: "/login",
        errorMessage: message
    });
};
exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;
    User.findOne({ email })
        .then(user => {
            if (!user) {
                req.flash("error", "Invalid email or password.");
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
                    req.flash("error", "Invalid email or password.");
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
        docTitle: "Signup"
    });
};

exports.postSignup = (req, res, next) => {
    const { email, password, confirmPassword } = req.body;
    User.findOne({ email })
        .then(userDoc => {
            if (userDoc) {
                req.flash("error", "This email already exits.");
                return res.redirect("/signup");
            }
            return bcrypt.hash(password, 12).then(hashedpassword => {
                const user = new User({ email: email, password: hashedpassword, cart: { items: [] } });
                return user.save();
            });
        })
        .then(() => {
            res.redirect("/login");

            return transporter.sendMail({
                to: email,
                from: "shop@node-complete.com",
                subject: "Signup succeeded!",
                html: "<h1>You Signed up!</h1>"
            });
        })
        .catch(err => console.log(err));
};
