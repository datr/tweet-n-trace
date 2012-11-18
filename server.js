var util = require('util'),
    twitter = require('twitter'),
    cronJob = require('cron').CronJob,
    mongo = require('mongodb'),
    Server = mongo.Server,
    Db = mongo.Db,
    http = require('http');

var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('twitter_consignments', server);

var twit = new twitter();

db.open(function(err, db) {
    if(!err) {
        db.collection('codes', function(err, collection) {
            new cronJob('* * * * * 0', function() {
                twit.search('@royalmail', function(data) {
                    if (data.results) {
                        //console.log(data);
                        data.results.forEach(function(tweet) {
                            var regex = /([A-Z]{2}[0-9]{9}[A-Z]{2})/ig;
                            tweet.text.match(regex).forEach(function(tracking_number) {
                                var now = new Date();
                                collection.findOne({code: tracking_number}, function(err, item) {
                                    if (!err && !item) {
                                        collection.insert([{'code': tracking_number, 'date': now}], {safe:false}, function(err, result) {});
                                    }
                                });
                            });
                        });
                    }
                });
            }, null, true, "America/Los_Angeles");

            http.createServer(function (req, res) {
                collection.find().toArray(function(err, items) {
                    if (!err && items) {
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        items.forEach(function(item) {
                            res.write(item.code + "\r\n");
                        });
                        res.end();
                    }
                });
            }).listen(1337, '192.168.56.101');

            console.log('Server running at http://127.0.0.1:1337/');
        });
    }
});