const express = require("express");
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");
const { body } = require("express-validator/check");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// // /admin/products => GET
router.get("/products", isAuth, adminController.getAdminProducts);

// // /admin/products => POST
router.post(
    "/add-product",
    [
        body("title", "Title must have at least 3 letters")
            .isString()
            .isLength({ min: 3 })
            .trim(),
        body("price", "Price can only be a number").isFloat(),
        body("description", "Description must be at least 5 letter").isLength({ min: 5, max: 400 })
    ],
    isAuth,
    adminController.postAddProduct
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
    "/edit-product",
    [
        body("title", "Title must have at least 3 letters")
            .isString()
            .isLength({ min: 3 })
            .trim(),
        body("price", "Price can only be a number").isFloat(),
        body("description", "Description must be at least 5 letter").isLength({ min: 5, max: 400 })
    ],
    isAuth,
    adminController.postEditProduct
);

router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
