# analytics2influx
Exports metrics from Google Analytics + Realtime Reporting API and writes the data to InfluxDB >= 0.9.x


## CREDITS
This project was inspired by https://github.com/soulgalore/gatographite from Peter Hedenskog. If you want to send your analyticts data to Graphite, have a look at Gatographite!


## Install

`npm install analytics2influx`

## GA-API Configuration

To export data from Google Analytics you first have to create an Analytics developer API account and add the account to the related Analytics profiles. These instructions 
should get you through  http://www.bentedder.com/server-to-server-authorization-for-google-analytics-api-with-node-js


## Metrics
You can fetch metrics from the Google Analytics API: https://developers.google.com/analytics/devguides/reporting/core/dimsmets
and metrics from the Google Realtime Reporting API: https://developers.google.com/analytics/devguides/reporting/realtime/dimsmets/

Please not, that you cannot combine metrics from both APIs. 



## Usage

You can either call `analytics2inlux` with commandline parameters or use the `export.sh` file to configure everything.

Analytics API
``
analytics2influx --metrics ga:pageviews,ga:sessions --dimensions ga:hostname --influxHost localhost --influxUser tester --influxPassword test  
``

Realtime Reporting API
``
analytics2influx --mode rt --rt_metrics ga:activeUsers --rt_dimensions rt:userType --influxHost localhost --influxUser tester --influxPassword test  
``