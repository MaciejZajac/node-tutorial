const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const Product = require("../models/product");
const Order = require("../models/order");

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render("shop/product-list", {
                prods: products,
                docTitle: "All products",
                path: "/products",
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(err);
        });
};

exports.getProduct = (req, res) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            res.render("shop/product-detail", {
                product: product,
                docTitle: product.title,
                path: "/products"
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(err);
        });
};

exports.getIndex = (req, res) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render("shop/index", {
                prods: products,
                docTitle: "Shop",
                path: "/",
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(err);
        });
};

exports.getCart = (req, res) => {
    req.user
        .populate("cart.items.productId")
        .execPopulate()
        .then(user => {
            const products = user.cart.items;
            res.render("shop/cart", {
                docTitle: "Your Cart",
                path: "/cart",
                products: products
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(err);
        });
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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(err);
        });
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
                    email: req.user.email,
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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(err);
        });
};

exports.getOrders = (req, res) => {
    Order.find({
        "user.userId": req.user._id
    })
        .then(orders => {
            res.render("shop/orders", {
                docTitle: "Your Orders",
                path: "/orders",
                orders: orders
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(err);
        });
};

exports.getCheckout = (req, res) => {
    res.render("shop/checkout", {
        docTitle: "Checkout",
        path: "/checkout"
    });
};

exports.getInvoice = (req, res) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then(order => {
            if (!order) {
                return next(new Error("No order found."));
            }
            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error("Unauthorized"));
            }
            const invoiceName = "invoice" + orderId + ".pdf";
            const invoicePath = path.join("data", "invoices", invoiceName);

            const pdfDoc = new PDFDocument();
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", 'inline; filename="' + invoiceName + '"');
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);
            pdfDoc.fontSize(26).text("Invoice", {
                underline: true
            });

            pdfDoc.text("----------------------");
            let totalPrice = 0;
            order.products.forEach(prod => {
                totalPrice += prod.quantity * prod.product.price;
                pdfDoc.fontSize(14).text(prod.product.title + " - " + prod.quantity + " x " + "$" + prod.product.price);
            });

            pdfDoc.text("----------------------");
            pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);

            pdfDoc.end();

            // fs.readFile(invoicePath, (err, data) => {
            //     if (err) {
            //         return next();
            //     }
            //     res.setHeader("Content-Type", "application/pdf");
            //     res.setHeader("Content-Disposition", 'attachment; filename="' + invoiceName + '"');
            //     res.send(data);
            // });
            const file = fs.createReadStream(invoicePath);

            file.pipe(res);
        })
        .catch(err => console.log(err));
};
