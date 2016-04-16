/**
 * Send Google Analytics data to InfluxDB
 * Copyright (c) 2016, Steffen Konerow
 * Released under the MIT License
 * Inspired by gaToGraphite by Peter Hedenskog
 */

'use strict';
var influx = require('influx')



function InfluxSender(host, port, user, pass, database) {


  this.client = influx({

    host : host,
    port : port, // optional, default 8086
    protocol : 'http', // optional, default 'http'
    username : user,
    password : pass,
    database : database
  })
}

InfluxSender.prototype.send = function(series,points, cb) {

  this.client.writeSeries(series,points,cb);


};


module.exports = InfluxSender;
