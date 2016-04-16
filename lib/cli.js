/**
 * Send Google Analytics data to Graphite
 * Copyright (c) 2015, Peter Hedenskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var parseArgs = require('minimist');

var conf = parseArgs(process.argv.slice(2), {
	default: {
        mode : process.env.GA_MODE || 'ga',
		viewId: process.env.GA_VIEW_ID,
		email: process.env.GA_EMAIL,
		pemPath: process.env.GA_PEM_PATH,
		rt_metrics: process.env.RT_METRICS || 'rt:activeUsers',
		metrics: process.env.GA_METRICS,
		rt_dimensions : process.env.RT_DIMENSIONS || 'rt:userType' ,
		dimensions : process.env.GA_DIMENSIONS || 'ga:hostname,ga:pagePath' ,
		useMinutes: process.env.GA_MINUTES,
		maxResults: process.env.GA_MAX_RESULTS || 1000,
		influxHost: process.env.INFLUX_HOST || 'localhost',
		influxPort: process.env.INFLUX_PORT || 8086,
		influxDatabase: process.env.INFLUX_DATABASE || 'google_analytics',
	  	influxUser :  process.env.INFLUX_USER,
        influxPassword : process.env.INFLUX_PASSWORD,
		debug: false
	}
});

if (conf.help) {
	console.log('Get metrics from Google Analytics and send them to Graphite');
	console.log('Setup your PEM: http://www.bentedder.com/server-to-server-authorization-for-google-analytics-api-with-node-js/');
	console.log('And choose values: https://developers.google.com/analytics/devguides/reporting/core/dimsmets')
	console.log('Configuration:');
	console.log('--viewId <ID> - the Google Analytics View ID');
	console.log('--email <EMAIL> - the email address for the Google Analytics user');
	console.log('--pemPath <PATH> - the full path to your PEM file');
	console.log('--metrics <LIST> - the metrics to fetch from GA. Example: ga:pageviews,ga:sessions,ga:avgTimeOnSite');
	console.log('--rt_metrics <LIST> - the metrics to fetch from Realtime Reporting API. Example: rt:activeUsers');
	console.log('--dimensions <LIST> - the dimensions to fetch from GA. Default: ga:hostname,ga:pagePath,ga:date,ga:hour');
	console.log('--rt_dimensions <LIST> - the dimensions to fetch from Realtime Reporting API. Default: rt:userType,rt:minutesAgo');
	console.log('--useMinutes <BOOLEAN> - fetch metrics gropued by hour or minute');
	console.log('--maxResults <INTEGER> - max results from the Google API');
	console.log('--influxHost <HOST> - the host of your InfluxDB instance');
	console.log('--influxPort <INTEGER> - the InfluxDB port');
	console.log('--influxDatabase <STRING> - name of the InfluxDB Database');
	console.log('--influxUser <STRING> - name of the InfluxDB User');
	console.log('--influxPassword <STRING> - password of the InfluxDB User');
	console.log('--domain <STRING> - the domain to filter for');
	console.log('--debug - show extra debug info in the console ');
	process.exit(0);
}

var isMissing = false;
Object.keys(conf).forEach(function(key) {
	if (conf[key] === undefined) {
		console.error('Missing configuration for parameter ' + key);
		isMissing = true;
	}

});

if (isMissing) {
	console.log(JSON.stringify(process.env));
	process.exit(1);
}

if (conf.debug) {
	Object.keys(conf).forEach(function(key) {
		console.log(key + ':' + conf[key]);
	});
}

module.exports = conf;
