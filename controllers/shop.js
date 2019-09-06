const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
    Product.findAll()
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
    Product.findByPk(prodId)
        .then(product => {
            res.render("shop/product-detail", { product: product, docTitle: product.title, path: "/products" });
        })
        .catch(error => console.log(error));
};

exports.getIndex = (req, res) => {
    Product.findAll()
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
        .then(cart => {
            // console.log(cart);
            return cart
                .getProducts()
                .then(products => {
                    console.log("@@@@@@@@@@", products);
                    res.render("shop/cart", {
                        docTitle: "Your Cart",
                        path: "/cart",
                        products: products
                    });
                })
                .catch(err => console.log(err));
        })
        .catch(error => console.log(error));
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
    let fetchedCart;
    let newQuantity = 1;

    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: prodId } });
        })
        .then(products => {
            let product;
            if (products.length > 0) {
                product = products[0];
            }
            if (product) {
                const oldQuantity = product.cartItem.quantity;
                newQuantity = oldQuantity + 1;
                return product;
            }
            return Product.findByPk(prodId);
        })
        .then(product => {
            return fetchedCart.addProduct(product, { through: { quantity: newQuantity } });
        })
        .then(() => {
            res.redirect("/cart");
        })
        .catch(err => console.log(err));
};

exports.postDeteleItem = (req, res) => {
    const prodId = req.body.productId;
    res.cart
        .getCart()
        .then(cart => {
            return cart.getProducts({ where: { id: prodId } });
        })
        .then(products => {
            const product = products[0];
            product.cartItem.destroy();
        })
        .then(result => {
            res.redirect("/cart");
        })
        .catch(err => console.log(err));
};

exports.postOrder = (req, res) => {
    let fetchedCart;
    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts();
        })
        .then(products => {
            req.user
                .createOrder()
                .then(order => {
                    return order.addProducts(
                        products.map(product => {
                            product.orderItem = { quantity: product.catItem.quantity };
                            return product;
                        })
                    );
                })
                .catch(err => console.log(err));
        })
        .then(result => {
            return fetchedCart.setProducts(null);
        })
        .then(() => {
            res.redirect("/orders");
        })
        .catch(err => console.log(err));
};

exports.getOrders = (req, res) => {
    req.user
        .getOrders({ include: ["products"] })
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
