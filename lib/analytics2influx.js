/**
 * Send Google Analytics data to InfluxDB
 * Copyright (c) 2016, Steffen Konerow
 * Idea and scaffolding inspired by
 * Gatographite by Peter Hedenskog
 * Released under the Apache 2.0 License
 */
'use strict';
var google = require('googleapis'),
    moment = require('moment'),
    InfluxSender = require('./influxSender');


module.exports = {
  collect: function(conf) {
    var analytics = google.analytics('v3');

    var jwtClient = new google.auth.JWT(
        conf.email,
        conf.pemPath,
        null, ['https://www.googleapis.com/auth/analytics.readonly']
    );

    // setup the dates
    var dateFormat = 'YYYY-MM-DD';
    var endDate = moment().format(dateFormat);
    var startDate;
    var daysBack = 1;
    if (conf._.length === 1) {
      daysBack = conf._[0];
    }
    // default is one day back
    if (isNaN(daysBack)) {
      startDate = daysBack;
      endDate = daysBack;
      console.log('Fetch data from ' + startDate);

    } else {
      startDate = moment().subtract(daysBack, 'days').format(dateFormat);
      endDate = moment().subtract(1, 'days').format(dateFormat);
      console.log('Fetch data from ' + daysBack + ' day(s) back, starting from ' + startDate + ' to ' + endDate);
    }


    jwtClient.authorize(function(err, tokens) {
      if (err) {
        console.error('Couldn\'t authorize. Check your pem file, email and view id:' + err);
        return;
      } else {
        analytics.data.ga.get({
              auth: jwtClient,
              'ids': 'ga:' + conf.viewId,
              'metrics': conf.metrics,
              'start-date': startDate,
              'end-date': endDate,
              'dimensions': 'ga:date,ga:hour' + ((conf.useMinutes === 'true') ? ',ga:minute' : '') + ',' +conf.dimensions,
              'max-results': conf.maxResults
            }, function(error, response) {
              if (error) {
                console.error('Couldn\'t fetch the data from GA:' + error);
                return;
              }

              if (conf.debug) {
                console.log('API response:' + JSON.stringify(response));
              }

              if (!response.rows)
              {
                console.log('The query didn\'t return any results');
                return;
              }


              var metrics = [];

              response.columnHeaders.forEach(function(column) {
                if (column.columnType === 'METRIC') {
                  metrics.push(column.name.substring(3));
                }
              });

              if (response.rows && response.rows.length === conf.maxResults) {
                console.log('Ooops we got ' + response.rows.length + ' rows from Google Analytics the same amount as the max results.');
              }

              var result = getInfluxData(metrics, response.rows, conf);
              if (conf.debug) {
                console.log('Sending the following data to InfluxDB:' + result);
              }
              if (!result) return;
              var sender = new InfluxSender(conf.influxHost, conf.influxPort, conf.influxUser, conf.influxPassword, conf.influxDatabase);
              sender.send(result, function(err) {
                if (err)
                {
                  console.log(err);
                }
                console.log('Finished sending the metrics to InfluxDB');
              });
            }

        );
      }
    });
  },
  realtime : function(conf)
  {
    var analytics = google.analytics('v3');

    var jwtClient = new google.auth.JWT(
        conf.email,
        conf.pemPath,
        null, ['https://www.googleapis.com/auth/analytics.readonly']
    );
    jwtClient.authorize(function(err, tokens) {
      if (err) {
        console.error('Couldn\'t authorize. Check your pem file, email and view id:' + err);
        return;
      } else {

        analytics.data.realtime.get({
              auth: jwtClient,
              'ids': 'ga:' + conf.viewId,
              'metrics': conf.rt_metrics,
              'dimensions': conf.rt_dimensions,
              'max-results': conf.maxResults
            }, function(error, response) {
              if (error) {
                console.error('Couldn\'t fetch the data from GA:' + error);
                return;
              }

              if (conf.debug) {
                console.log('API response:' + JSON.stringify(response));
              }

              if (!response.rows)
              {
                console.log('The query didn\'t return any results');
                return;
              }

              console.log(conf);

              var metrics = [];

              response.columnHeaders.forEach(function(column) {
                if (column.columnType === 'METRIC') {
                  metrics.push(column.name.substring(3));
                }
              });

              if (response.rows && response.rows.length === conf.maxResults) {
                console.log('Ooops we got ' + response.rows.length + ' rows from Google Analytics the same amount as the max results.');
              }

              var result = getInfluxRealtimeData(metrics, response.rows, conf);
              if (conf.debug) {
                console.log('Sending the following data to Graphite:' + result);
              }
              if (!result) return;
              var sender = new InfluxSender(conf.influxHost, conf.influxPort, conf.influxUser, conf.influxPassword, conf.influxDatabase);
              sender.send(result, function(err) {
                if (err)
                {
                  console.log(err);
                }
                console.log('Finished sending the metrics to Graphite');
              });
            }

        );
      }
    });
  }
};


function getDimensions(conf) {
  var dimensions = conf.dimensions.split(',');
  dimensions.forEach(function(v,k)
  {
    dimensions[k] = v.replace('ga:','ga_');
  });
  return dimensions;

}

function getRtDimensions(conf) {
  var dimensions = conf.rt_dimensions.split(',');
  dimensions.forEach(function(v,k)
  {
    dimensions[k] = v.replace('rt:','rt_');
  });
  return dimensions;

}


function getInfluxData(metrics, rows, conf) {
  var dimensions = getDimensions(conf);

  var series = {};

  rows.forEach(function(row) {

    //todo: Add domain(hostname) filter
    //if (row[0] != conf.domain) return;
    var time;
    var metricsArray;

    if (conf.useMinutes === 'true') {
      time = row[0] + ' ' + row[1] + ':' + row[2] + ':00';
      metricsArray = row.splice(3, row.length);
    } else {
      time = row[0] + ' ' + row[1] + ':00:00';
      metricsArray = row.splice(2, row.length);
    }

    var secondsSinceEpoch = (moment(time, 'YYYYMMDD HH:mm:ss')).unix() * 1000;
    var tags = {
      ga_id : conf.viewId
    };

    dimensions.forEach(function(d)
    {
      tags[d] = metricsArray.shift();
    });

    for (var i=0;i < metricsArray.length; ++i)
    {
      var seriesName = metrics[i];
      if (!series[seriesName]) series[seriesName] = [];

      series[seriesName].push([
        {
          time : secondsSinceEpoch,
          value : parseFloat(metricsArray[i])
        },
          tags
      ])
    }
  });

  return series;
}


function getInfluxRealtimeData(metrics, rows, conf) {
  var dimensions = getRtDimensions(conf);

  var series = {};
  var secondsSinceEpoch = new Date().getTime();

  rows.forEach(function(metricsArray) {

    var tags = {
      ga_id : conf.viewId
    };

    dimensions.forEach(function(d)
    {
      tags[d] = metricsArray.shift();
    });

    for (var i=0;i < metricsArray.length; ++i)
    {
      var seriesName = metrics[i];
      if (!series[seriesName]) series[seriesName] = [];

      series[seriesName].push([
        {
          time : secondsSinceEpoch,
          value : parseFloat(metricsArray[i])
        },
        tags
      ])
    }
  });

  return series;
}
