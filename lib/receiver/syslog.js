/**
 * (c) 2014 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 cepharum GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @author: cepharum
 */


var PATH   = require( "path" ),
	UDP    = require( "dgram" ),
	CONFIG = require( PATH.resolve( require.main.filename, "../../etc/config" ) );


/**
 * Creates receiver for receiving notifications on incoming requests per
 * simulating syslog daemon.
 *
 * @note This is primarily intended for use with nginx 1.7+ using access_log
 *       with syslog redirection.
 *
 * @note This receiver hasn't been tested, yet. 2014-12-11
 *
 * @param {function(string)} messageProcessor
 * @returns {*}
 */

exports.createReceiver = function( messageProcessor ) {
	console.log( "Use of receiver 'syslog' has not been tested yet. (2014-12-11)" );

	var syslog = UDP.createSocket( "udp4", function( msg ) {
		messageProcessor( msg );
	} );

	syslog.bind( CONFIG.syslogPort || 514, CONFIG.syslogAddress || "127.0.0.1" );

	return syslog;
};
