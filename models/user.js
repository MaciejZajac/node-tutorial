const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;

class User {
    constructor(username, email, cart, id) {
        this.name = username;
        this.email = email;
        this.cart = cart;
        this._id = id;
    }

    save() {
        const db = getDb();
        db.collection("users").insertOne(this);
    }

    addToCart(product) {
        const cartProductIndex = this.cart.items.findIndex(cp => {
            return cp.productId == product._id;
        });
        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];

        if (cartProduct >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            updatedCartItems.push({
                productId: new mongodb.ObjectID(product._id),
                quantity: newQuantity
            });
        }
        const updatedCart = { items: updatedCartItems };
        const db = getDb();
        return db
            .collection("users")
            .updateOne({ _id: new mongodb.ObjectID(this._id) }, { $set: { cart: updatedCart } });
    }

    static findById(userId) {
        const db = getDb();
        return db
            .collection("users")
            .findOne({ _id: new mongodb.ObjectID(userId) })
            .then(user => {
                return user;
            })
            .catch(err => console.log(err));
    }
}
module.exports = User;
