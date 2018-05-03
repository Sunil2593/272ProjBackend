var MongoClient = require('mongodb').MongoClient;
var db;
var connected = false;
var url='mongodb://Team22:team22@ds159866.mlab.com:59866/sportshub';
var array=[];


/**
 * Connects to the MongoDB Database with the provided URL
 */
exports.connect = function( callback){
    MongoClient.connect(url, function(err, _db){
        if (err) { throw new Error('Could not connect: '+err); }
        db = _db;
        connected = true;
        console.log(connected +" is connected?");
        callback(db);
    });
};

/**
 * Returns the collection on the selected database
 */
exports.collection = function(name){
    if (!connected) {
        throw new Error('Must connect to Mongo before calling "collection"');
    }
    return db.collection(name);

};

exports.setMatchStatistics = function(matchStatsWon,matchStatsPlayed){
    array.push(matchStatsWon);
    array.push(matchStatsPlayed)
};

exports.getMatchStatistics = function(){
    return array;
};

