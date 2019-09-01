const Product = require("../models/product");

exports.getAddProduct = (req, res) => {
    res.render("admin/edit-product", {
        docTitle: "Add Product",
        path: "/admin/add-product",
        editing: false
    })
};

exports.postAddProduct = (req, res) => {
    const { title, imageUrl, price, description } = req.body;
    const product = new Product(null, title, imageUrl, price, description);
    product.save();
    res.redirect("/");
}


exports.getEditProduct = (req, res) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect("/");
    }
    const prodId = req.params.productId;
    Product.findById(prodId, product => {
        if (!product) {
            return res.redirect("/");
        }
        res.render("admin/edit-product", {
            docTitle: "Edit Product",
            path: "/admin/edit-product",
            editing: editMode,
            product: product
        })
    })
};

exports.postEditProduct = (req, res) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;
    const updatedProduct = new Product(prodId, updatedTitle, updatedImageUrl, updatedPrice, updatedDesc);
    updatedProduct.save();
    res.redirect("/admin/products");
}

exports.postDeleteProduct = (req, res) => {
    const prodId = req.body.productId;
    Product.deleteById(prodId);
    res.redirect("/admin/products");
}

exports.getAdminProducts = (req, res) => {
    Product.fetchAll((products) => {
        res.render("admin/products", {
            prods: products,
            docTitle: "Admin Products",
            path: "/admin/products"
        });

    });
};
