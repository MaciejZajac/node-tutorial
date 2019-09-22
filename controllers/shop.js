const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(products => {
            res.render("shop/product-list", {
                prods: products,
                docTitle: "All products",
                path: "/products"
            });
        })
        .catch(err => console.log(err));
};

exports.getProduct = (req, res) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            res.render("shop/product-detail", { product: product, docTitle: product.title, path: "/products" });
        })
        .catch(error => console.log(error));
    // Product.findByPk(prodId)
    //     .then(product => {
    //         res.render("shop/product-detail", { product: product, docTitle: product.title, path: "/products" });
    //     })
    //     .catch(error => console.log(error));
};

exports.getIndex = (req, res) => {
    Product.fetchAll()
        .then(products => {
            res.render("shop/index", {
                prods: products,
                docTitle: "Shop",
                path: "/"
            });
        })
        .catch(err => console.log(err));
};

exports.getCart = (req, res) => {
    req.user
        .getCart()
        .then(products => {
            res.render("shop/cart", {
                docTitle: "Your Cart",
                path: "/cart",
                products: products
            });
        })
        .catch(err => console.log(err));
    // Cart.getProducts(cart => {
    //     Product.fetchAll(products => {
    //         const cartProducts = [];
    //         for (product of products) {
    //             const cartProductData = cart.products.find(prod => prod.id === product.id);
    //             if (cartProductData) {
    //                 cartProducts.push({ productData: product, qty: cartProductData.qty });
    //             }
    //         }

    //         res.render("shop/cart", {
    //             docTitle: "Your Cart",
    //             path: "/cart",
    //             products: cartProducts
    //         });
    //     });
    // });
};

exports.postCart = (req, res) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(() => {
            res.redirect("/cart");
        });
};

exports.postDeteleItem = (req, res) => {
    const prodId = req.body.productId;
    req.user
        .deleteItemFromCart(prodId)
        .then(() => {
            res.redirect("/cart");
        })
        .catch(err => console.log(err));
};

exports.postOrder = (req, res) => {
    let fetchedCart;
    req.user
        .addOrder()
        .then(() => {
            res.redirect("/orders");
        })
        .catch(err => console.log(err));
};

exports.getOrders = (req, res) => {
    req.user
        .getOrders()
        .then(orders => {
            res.render("shop/orders", {
                docTitle: "Your Orders",
                path: "/orders",
                orders: orders
            });
        })
        .catch(err => console.log(err));
};

exports.getCheckout = (req, res) => {
    res.render("shop/checkout", {
        docTitle: "Checkout",
        path: "/checkout"
    });
};
