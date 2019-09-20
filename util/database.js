const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;

let _db = undefined;

const mongoConnect = callback => {
    mongoClient
        .connect("mongodb+srv://maciej:132639@cluster0-m9slc.mongodb.net/shop?retryWrites=true&w=majority")
        .then(client => {
            console.log("connected!");
            _db = client.db();
            callback(client);
        })
        .catch(error => {
            throw error;
        });
};

const getDb = () => {
    if (_db) {
        return _db;
    }

    throw "No database found!";
};
// module.getDb = getDb;
// module.mongoConnect = mongoConnect;

module.exports = { getDb, mongoConnect };
