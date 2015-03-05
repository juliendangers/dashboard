var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var url = "mongodb://192.168.59.103:27017/dashboard-rd";

var connect = function() {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
    });
};


var insert = function(db, collectionName, array, callback) {
    // Get the documents collection
    var collection = db.collection(collectionName);

    // Insert some documents
    collection.insert(array, function(err, result) {
        callback(result);
    });
};

var findAll = function(db, collectionName, callback) {
    // Get the documents collection
    var collection = db.collection(collectionName);

    // Find some documents
    collection.find({}).toArray(function(err, result) {
        callback(result);
    });
};

var removeAll = function(db, collectionName, callback) {
    // Get the documents collection
    var collection = db.collection(collectionName);

    // Find some documents
    collection.find({}).toArray(function(err, result) {
        callback(result);
    });
};

module.exports.connect = connect;
module.exports.insert = insert;
module.exports.findAll = findAll;
module.exports.removeAll = removeAll;
