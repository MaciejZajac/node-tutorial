const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

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

exports.getReset = (req, res) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    res.render("auth/reset", {
        docTitle: "Reset",
        path: "/reset",
        errorMessage: message
    });
};

exports.postReset = (req, res) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect("/reset");
        }
        const token = buffer.toString("hex");
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash("error", "No account with that email found.");
                    return res.redirect("/reset");
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                res.redirect("/");
                transporter.sendMail({
                    to: req.body.email,
                    from: "shop@node-complete.com",
                    subject: "Password reset",
                    html: `
                <p>You requested a password reset</p>
                <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                `
                });
            })
            .catch(err => console.log(err));
    });
};

exports.getNewPassword = (req, res) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            let message = req.flash("error");
            if (message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }

            res.render("auth/new-password", {
                docTitle: "New password",
                path: "/new-password",
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token
            });
        })
        .catch(err => console.log(err));
};

exports.postNewPassword = (req, res) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedpassword => {
            resetUser.password = hashedpassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(result => {
            res.redirect("/login");
        })
        .catch(err => console.log(err));
};
