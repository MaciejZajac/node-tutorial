const Product = require("../models/product");

exports.getAddProduct = (req, res) => {
    res.render("admin/add-product", {
        docTitle: "Add Product",
        path: "/admin/add-product",
        productCSS: true,
        activeAddProduct: true
    })
};

exports.postAddProduct = (req, res) => {
    const { title, imageUrl, price, description } = req.body;
    const product = new Product(title, imageUrl, price, description);
    product.save();
    res.redirect("/");
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
