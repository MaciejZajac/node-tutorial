const Product = require("../models/product");

exports.getAddProduct = (req, res) => {
    res.render("admin/edit-product", {
        docTitle: "Add Product",
        path: "/admin/add-product",
        editing: false
    });
};

exports.postAddProduct = (req, res) => {
    const { title, imageUrl, price, description } = req.body;
    req.user
        .createProduct({
            title,
            imageUrl,
            price,
            description
        })
        .then(result => {
            res.redirect("/admin/products");
        })
        .catch(err => console.log(err));
};

exports.getEditProduct = (req, res) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect("/");
    }
    const prodId = req.params.productId;
    req.user
        .getProducts({ where: { id: prodId } })
        // Product.findByPk(prodId)
        .then(products => {
            const product = products[0];
            if (!product) {
                return res.redirect("/");
            }
            res.render("admin/edit-product", {
                docTitle: "Edit Product",
                path: "/admin/edit-product",
                editing: editMode,
                product: product
            });
        })
        .catch(error => console.log(error));
};

exports.postEditProduct = (req, res) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;

    Product.findByPk(prodId)
        .then(product => {
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.updatedImageUrl = updatedImageUrl;
            product.description = updatedDesc;
            return product.save();
        })
        .then(result => {
            console.log("UPDATED PRODUCT!");
            res.redirect("/admin/products");
        })
        .catch(error => console.log(error));
};

exports.postDeleteProduct = (req, res) => {
    const prodId = req.body.productId;
    Product.findByPk(prodId)
        .then(product => product.destroy())
        .then(result => {
            console.log("DESTROYED PRODUCT");
            res.redirect("/admin/products");
        })
        .catch(err => console.log(err));
};

exports.getAdminProducts = (req, res) => {
    req.user
        .getProducts()
        .then(products => {
            res.render("admin/products", {
                prods: products,
                docTitle: "Admin Products",
                path: "/admin/products"
            });
        })
        .catch(error => console.log("error", error));
};
