var util = require('util'),
    twitter = require('twitter'),
    cronJob = require('cron').CronJob,
    mongo = require('mongodb'),
    Server = mongo.Server,
    Db = mongo.Db,
    http = require('http');

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/';

var twit = new twitter();

mongo.Db.connect(mongoUri, function (err, db) {
    db.collection('codes', function (err, collection) {
        new cronJob('* * * * * 0', function () {
            twit.search('@royalmail', function (data) {
                if (data.results) {
                    //console.log(data);
                    data.results.forEach(function (tweet) {
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

        var port = process.env.PORT || 5000;

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
        }).listen(port);

        console.log('Server running at http://127.0.0.1:' + port + '/');
    });
});