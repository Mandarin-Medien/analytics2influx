#!/usr/bin/env node

/**
 * Send Google Analytics data to Graphite
 * Copyright (c) 2015, Peter Hedenskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var conf = require('../lib/cli'),
    analytics2influx = require('../lib/analytics2influx');


if ('rt' == conf.mode)
{
    analytics2influx.realtime(conf);

} else {
    analytics2influx.collect(conf);
}
