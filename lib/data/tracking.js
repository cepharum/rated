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
	CONFIG = require( PATH.resolve( require.main.filename, "../../etc/config" ) );



function TrackingList( blocking ) {
	this._map = {};

	this.blockIp = function( ip ) {
		blocking.add( ip );
	};
}

TrackingList.prototype.capture = function( ip ) {
	if ( !CONFIG.whiteList[ip] ) {
		var msg = [ "capturing", ip ],
		    now = Math.round( new Date().getTime() / 1000 / CONFIG.granularity );

		if ( ip in this._map ) {
			var track = this._map[ip],
			    index = track.times.indexOf( now );

			if ( index >= 0 ) {
				var count = ++track.counts[index];

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

			this._map[ip] = {
				times: [ now ],
				counts: [ 1 ]
			};
		}

		console.log( msg.join( " " ) );
	}
};


/**
 *
 * @param {BlockingList} blocking
 * @returns {TrackingList}
 */

exports.createTrackingList = function( blocking ) {
	return new TrackingList( blocking );
};
