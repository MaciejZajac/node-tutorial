const express = require("express");
const { check, body } = require("express-validator/check");

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
    "/login",
    [
        body("email", "Please enter a valid email")
            .isEmail()
            .normalizeEmail(),
        body("password", "Please enter a passowrd")
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim()
    ],
    authController.postLogin
);

router.post(
    "/signup",
    [
        check("email")
            .isEmail()
            .withMessage("Please enter a valid email")
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then(userDoc => {
                    if (userDoc) {
                        return Promise.reject("This email already exits.");
                    }
                });
            })
            .normalizeEmail(),
        body("password", "Please enter a password")
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim(),
        body("confirmPassword")
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error("Password have to match!");
                }
                return true;
            })
            .trim()
    ],
    authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.post("/new-password", authController.postNewPassword);

router.get("/reset/:token", authController.getNewPassword);

module.exports = router;
