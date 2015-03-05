var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var url = "mongodb://192.168.59.103:27017/dashboard-rd";

var insert = function(collectionName, array, callback) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);

        // Get the documents collection
        var collection = db.collection(collectionName);

        // Insert some documents
        collection.insert(array, function(err, result) {
            if (callback) {
                callback(result);
            }
        });

        db.close();
    });
};

var find = function(collectionName, criteria, callback) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);

        // Get the documents collection
        var collection = db.collection(collectionName);

        // Find some documents
        collection.find(criteria).toArray(function(err, result) {
            if (callback) {
                callback(result);
            }
        });
    });
};

var findAll = function(collectionName, callback) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);

        // Get the documents collection
        var collection = db.collection(collectionName);

        // Find some documents
        collection.find({}).toArray(function(err, result) {
            assert.equal(null, err);

            if (callback) {
                callback(result);
            }
        });
    });
};

var removeAll = function(collectionName, callback) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);

        // Get the documents collection
        var collection = db.collection(collectionName);

        // Find some documents
        collection.find({}).toArray(function(err, result) {
            assert.equal(null, err);

            if (callback) {
                callback(result);
            }
        });
    });
};

module.exports.insert = insert;
module.exports.findAll = findAll;
module.exports.removeAll = removeAll;
module.exports.find = find;
