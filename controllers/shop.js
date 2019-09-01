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
    Cart.getProducts(cart => {
        Product.fetchAll(products => {
            const cartProducts = [];
            for (product of products) {
                const cartProductData = cart.products.find(prod => prod.id === product.id);
                if (cartProductData) {
                    cartProducts.push({ productData: product, qty: cartProductData.qty });
                }
            }

            res.render("shop/cart", {
                docTitle: "Your Cart",
                path: "/cart",
                products: cartProducts
            })
        })
    })
};

exports.postCart = (req, res) => {
    const prodId = req.body.productId;
    Product.findById(prodId, (product) => {
        Cart.addProduct(prodId, product.price);
    })
    res.redirect("/cart");
};

exports.postDeteleItem = (req, res) => {
    const prodId = req.body.productId;
    console.log("prodId", prodId);
    Product.findById(prodId, product => {
        console.log("product", product);
        Cart.deleteProduct(prodId, product.price);
        res.redirect("/cart");
    })
}

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