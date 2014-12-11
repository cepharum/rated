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
	CONFIG = require( PATH.resolve( require.main.filename, "../../etc/config" ) ),
	CRC    = require( "../crc32" );


var whiteListIp  = CONFIG.whiteListIp || {},
    whiteListUrl = CONFIG.whiteListUrl || [];



function TrackingList( blocking ) {
	this._map = {};

	this.blockIp = function( ip ) {
		blocking.add( ip );
	};
}

/**
 * Captures notification on incoming request from provided IP address for
 * optionally given URL to be tracked internally.
 *
 * @param {string} ip
 * @param {?string} url
 */

TrackingList.prototype.capture = function( ip, url ) {
	var crc = false, track, index, count, map, urls;


	if ( whiteListIp[ip] ) {
		// request is white-listed by remote IP
		return;
	}

	if ( url ) {
		for ( var i = 0, l = whiteListUrl.length; i < l; i++ ) {
			if ( whiteListUrl[i].substr( 0, url.length ) === url ) {
				// request is white-listed by request URL
				return;
			}
		}

		crc = CRC.calculate( url );
	}


	var msg = [ "capturing", ip ],
	    now = Math.round( new Date().getTime() / 1000 / CONFIG.granularity );

	if ( ip in this._map ) {
		track = this._map[ip];
		index = track.times.indexOf( now );

		if ( index >= 0 ) {
			// IP has been tracked before

			if ( crc !== false ) {
				// got CRC of request URL for putting more weight on repeating
				// requests for same URL
				urls = track.urls[index];

				if ( crc in urls ) {
					// got request for same URL as before
					// -> increasingly put weight on this request
					count = ( track.counts[index] += ++urls[crc] );
				} else {
					// different URL as before
					// -> keep track of this URL for putting increasing weight
					//    on succeeding requests for same URL
					count = ( track.counts[index] += ( urls[crc] = 1 ) );
				}
			} else {
				// capturing IPs only
				// -> separately count every request
				count = ++track.counts[index];
			}

			msg.push( "count" );
			msg.push( count );

			if ( count > CONFIG.limit ) {
				msg.push( "(exceeding limit)" );
				this.blockIp( ip );
			}
		} else {
			msg.push( "new, count 1" );

			track.times.unshift( now );
			track.counts.unshift( 1 );
		}

		if ( track.times.length > 3 ) {
			track.times.splice( 3 );
			track.counts.splice( 3 );
		}
	} else {
		msg.push( "new, count 1" );

		map = this._map[ip] = {
			times: [ now ],
			counts: [ 1 ],
			urls: [ {} ]
		};

		if ( crc !== false ) {
			map.urls[0][crc] = 1;
		}
	}

	console.log( msg.join( " " ) );
};


/**
 *
 * @param {BlockingList} blocking
 * @returns {TrackingList}
 */

exports.createTrackingList = function( blocking ) {
	return new TrackingList( blocking );
};
