var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

module.exports = function (config, logger) {
    var url = 'mongodb://' + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.database.default;

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

    /**
     * Remove all element from collection
     *
     * @param {string} collectionName
     * @param {function} callback
     */
    var removeAll = function(collectionName, callback) {
        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);

            // Get the documents collection
            var collection = db.collection(collectionName);

            // Remove all documents
            collection.remove({}, function(err, result) {
                assert.equal(null, err);

                if (callback) {
                    callback(result);
                }
            });
        });
    };

    return {
        "insert": insert,
        "findAll": findAll,
        "removeAll": removeAll,
        "find": find
    };
};
