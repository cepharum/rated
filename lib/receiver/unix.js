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


var FS     = require( "fs" ),
	PATH   = require( "path" ),
	NET    = require( "net" ),
    CONFIG = require( PATH.resolve( require.main.filename, "../../etc/config" ) );


/**
 *
 * @param {function(string)} messageProcessor
 * @returns {*}
 */

exports.createReceiver = function( messageProcessor ) {
	var socket = NET.createServer( function( connection ) {

		var message = new Buffer(), error = false;

		connection.on( "data", function( chunk ) {
			message = Buffer.concat( [ message, chunk ] );
		} );

		connection.on( "error", function( error ) {
			console.error( "socket receiver failure: " + error );

			error = true;
		} );

		connection.on( "end", function() {
			if ( !error ) {
				messageProcessor( message );
			}
		} );
	} );

	socket.on( "error", function( error ) {
		if ( error.code === "EADDRINUSE" ) {
			console.error( "Address in use, retrying..." );
			setTimeout(function () {
				socket.listen( "/var/run/rated.sock" );
			}, 1000);
		} else {
			console.error( error );
			process.exit( 1 );
		}
	} );

	socket.on( "close", function() {
		console.log( "trying to remove socket" );

		FS.unlink( CONFIG.unixSocket, function( error ) {
			if ( error ) console.error( error );
		} );
	} );

	socket.listen( CONFIG.unixSocket );


	return socket;
};
