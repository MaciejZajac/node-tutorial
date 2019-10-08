const Product = require("../models/product");
const fileHelper = require("../util/file");
const { validationResult } = require("express-validator/check");

exports.getAddProduct = (req, res) => {
    res.render("admin/edit-product", {
        docTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        hasError: false,
        errorMessage: undefined,
        validationErrors: []
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    if (!image) {
        return res.status(422).render("admin/edit-product", {
            docTitle: "Add product",
            path: "/admin/add-product",
            errorMessage: "Attached file is not an image.",
            editing: false,
            hasError: true,
            product: {
                title,
                price,
                description
            },
            validationErrors: []
        });
    }
    const imageUrl = image.path;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render("admin/edit-product", {
            docTitle: "Add product",
            path: "/admin/add-product",
            errorMessage: errors.array()[0].msg,
            editing: false,
            hasError: true,
            product: {
                title,
                imageUrl,
                price,
                description
            },
            validationErrors: errors.array()
        });
    }

    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user
    });

    product
        .save()
        .then(result => {
            res.redirect("/admin/products");
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(err);
        });
};

exports.getEditProduct = (req, res) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect("/");
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return res.redirect("/");
            }
            res.render("admin/edit-product", {
                docTitle: "Edit Product",
                path: "/admin/edit-product",
                editing: editMode,
                product: product,
                hasError: false,
                errorMessage: undefined,
                validationErrors: []
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(err);
        });
};

exports.postEditProduct = (req, res) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updatedDesc = req.body.description;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render("admin/edit-product", {
            docTitle: "Edit product",
            path: "/product",
            editing: true,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            product: {
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDesc,
                _id: prodId
            },
            validationErrors: errors.array()
        });
    }

    // const product = new Product(updatedTitle, updatedPrice, updatedDesc, updatedImageUrl, prodId);
    Product.findById(prodId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect("/");
            }
            product.title = updatedTitle;
            product.price = updatedPrice;
            if (image) {
                fileHelper.deleteFile(product.imageUrl);
                product.imageUrl = image.path;
            }
            product.description = updatedDesc;

            return product.save().then(result => {
                res.redirect("/admin/products");
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(err);
        });
};

exports.deleteProduct = (req, res) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return next(new Error("product not found."));
            }
            fileHelper.deleteFile(product.imageUrl);
            return Product.deleteOne({ _id: prodId, userId: req.user._id });
        })
        .then(() => {
            // res.redirect("/admin/products");
            res.status(200).json({
                message: "Success!"
            });
        })
        .catch(err => {
            res.status(500).json({
                message: "Deleting product failed."
            });
            // const error = new Error(err);
            // error.httpStatusCode = 500;
            // return next(err);
        });
};

exports.getAdminProducts = (req, res) => {
    Product.find({ userId: req.user._id })
        // .select("title price -_id")
        // .populate("userId", "name")
        .then(products => {
            res.render("admin/products", {
                prods: products,
                docTitle: "Admin Products",
                path: "/admin/products"
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(err);
        });
};
