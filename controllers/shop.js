const Product = require("../models/product");
const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            console.log(products);
            res.render("shop/product-list", {
                prods: products,
                docTitle: "All products",
                path: "/products",
                isAuthenticated: req.isLoggedIn
            });
        })
        .catch(err => console.log(err));
};

exports.getProduct = (req, res) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            res.render("shop/product-detail", {
                product: product,
                docTitle: product.title,
                path: "/products",
                isAuthenticated: req.isLoggedIn
            });
        })
        .catch(error => console.log(error));
    // Product.findByPk(prodId)
    //     .then(product => {
    //         res.render("shop/product-detail", { product: product, docTitle: product.title, path: "/products" });
    //     })
    //     .catch(error => console.log(error));
};

exports.getIndex = (req, res) => {
    Product.find()
        .then(products => {
            res.render("shop/index", {
                prods: products,
                docTitle: "Shop",
                path: "/",
                isAuthenticated: req.isLoggedIn
            });
        })
        .catch(err => console.log(err));
};

exports.getCart = (req, res) => {
    req.user
        .populate("cart.items.productId")
        .execPopulate()
        .then(user => {
            // console.log("products@@@@@", products);
            const products = user.cart.items;
            res.render("shop/cart", {
                docTitle: "Your Cart",
                path: "/cart",
                products: products,
                isAuthenticated: req.isLoggedIn
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

exports.postCartDeleteProduct = (req, res) => {
    const prodId = req.body.productId;
    req.user
        .removeFromCart(prodId)
        .then(() => {
            res.redirect("/cart");
        })
        .catch(err => console.log(err));
};

exports.postOrder = (req, res) => {
    req.user
        .populate("cart.items.productId")
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: { ...i.productId._doc } };
            });
            const order = new Order({
                user: {
                    name: req.user.name,
                    userId: req.user
                },
                products
            });
            return order.save();
        })
        .then(() => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect("/orders");
        })
        .catch(err => console.log(err));
};

exports.getOrders = (req, res) => {
    Order.find({
        "user.userId": req.user._id
    })
        .then(orders => {
            res.render("shop/orders", {
                docTitle: "Your Orders",
                path: "/orders",
                orders: orders,
                isAuthenticated: req.isLoggedIn
            });
        })
        .catch(err => console.log(err));
};

exports.getCheckout = (req, res) => {
    res.render("shop/checkout", {
        docTitle: "Checkout",
        path: "/checkout",
        isAuthenticated: req.isLoggedIn
    });
};
