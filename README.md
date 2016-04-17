# analytics2influx
Exports metrics from Google Analytics + Realtime Reporting API and writes the data to InfluxDB >= 0.9.x


## CREDITS
This project was inspired by https://github.com/soulgalore/gatographite from Peter Hedenskog. If you want to send your analytics data to Graphite, have a look at Gatographite!


## Install

`npm install analytics2influx`

## Google-API Authentication

To export data from Google Analytics you first have to create an Analytics developer API account and add the account to the related Analytics profiles. These instructions 
should hopefullx get you through  http://www.bentedder.com/server-to-server-authorization-for-google-analytics-api-with-node-js


## Metrics
You can fetch metrics from the Google Analytics API: https://developers.google.com/analytics/devguides/reporting/core/dimsmets

and metrics from the Google Realtime Reporting API: https://developers.google.com/analytics/devguides/reporting/realtime/dimsmets/

Please note, that you cannot combine metrics from both APIs. 



## Usage

You can either call `analytics2inlux` with commandline parameters or use the `export.sh` file to configure everything.

Analytics API
```
analytics2influx --metrics ga:pageviews,ga:sessions --dimensions ga:hostname --influxHost localhost --influxUser tester --influxPassword test  
```

Realtime Reporting API
```
analytics2influx --mode rt --rt_metrics rt:activeUsers --rt_dimensions rt:userType --influxHost localhost --influxUser tester --influxPassword test  
```

#### Time-Ranges

```
// Fetch data from yesterday and send to Graphite
analytics2influx
```


```
// Fetch data from three days back -> today and send to Graphite
analytics2influx 3
```


```
// Send data for a specific date
analytics2influx 2015-06-01
```

## Things you should probably know

For Google Analytics metrics the date & time dimensions are added automatically. Metric from the Google Realtime API
use the current system timestamp. Doublecheck your systems date and time settings before using the Realtime Reporting API.

All dimensions and their values are used as tags in InfluxDB. The Analytics ViewId is added as "ga_id" automatically for both APIs.

It doesn't matter how many metrics you select while querying the APIs, all values are stored in separate measurements named ga_[metricname] or rt_[metricname] with the tags mentioned above.