const Product = require("../models/product");
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render("shop/product-list", {
            prods: products,
            docTitle: "All products",
            path: "/products"
        });

    });
}

exports.getProduct = (req, res) => {
    const prodId = req.params.productId;
    Product.findById(prodId, product => {
        res.render('shop/product-detail', { product, docTitle: product.title, path: "/products" });
    })
}

exports.getIndex = (req, res) => {
    Product.fetchAll((products) => {
        res.render("shop/index", {
            prods: products,
            docTitle: "Shop",
            path: "/"
        });

    });
}

exports.getCart = (req, res) => {
    res.render("shop/cart", {
        docTitle: "Your Cart",
        path: "/cart",
    })
};

exports.postCart = (req, res) => {
    const prodId = req.body.productId;
    Product.findById(prodId, (product) => {
        Cart.addProduct(prodId, product.price);
    })
    console.log("prodId", prodId);
    res.redirect("/cart");
};

exports.getOrders = (req, res) => {
    res.render("shop/orders", {
        docTitle: "Your Orders",
        path: "/orders",
    })
};

exports.getCheckout = (req, res) => {
    res.render("shop/checkout", {
        docTitle: "Checkout",
        path: "/checkout",
    })
};