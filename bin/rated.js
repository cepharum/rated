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

// ----------------------------------------------------------------------------

var CONFIG   = require( "../etc/config" ),
	DOMAIN   = require( "domain" ),
	TRACKING = require( "../lib/data/tracking" ),
	BLOCKING = require( "../lib/data/blocking" );


// ----------------------------------------------------------------------------

var domain   = DOMAIN.create(),
	blocking = BLOCKING.createBlockingList();

domain.on( "error", function( error ) {
	console.error( "shutting down on error: " + error );

	try {
		blocking.flush();
	} catch ( e ) {
		console.error( "FATAL: failed to clear filter rules set by current instance" );
	}

	process.exit( 99 );
} );

domain.run( function() {
	var tracking = TRACKING.createTrackingList( blocking ),
	    pattern  = CONFIG.ipExtractor || /^((?:\d+\.){3}\d+)(?:\s|\?|$)/,
	    receiver;

	switch ( process.argv[2] ) {
		case "syslog" :
		case "unix" :
		case "http" :
			receiver = require( "../lib/receiver/" + process.argv[2] ).createReceiver( extractFromMessage );
			break;

		default :
			console.error( "invalid receiver mode, use one of: syslog, unix, http" );
			process.exit( 1 );
	}

	function extractFromMessage( msg ) {
		var text   = msg.toString( "utf8", 0, 2048 ),
		    parsed = pattern.exec( text );

		if ( parsed ) {
			tracking.capture( parsed[1] );
		}
	}
} );

function onTerminateService() {
	try {
		blocking.flush();
	} catch ( e ) {
		console.error( "FATAL: failed to clear filter rules set by current instance" );
	}

	process.exit( 128 )
}

process.on( "SIGINT", onTerminateService );
process.on( "SIGTERM", onTerminateService );
