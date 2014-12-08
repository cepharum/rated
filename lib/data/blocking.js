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
	CHILD  = require( "child_process" );


var adder   = PATH.resolve( require.main.filename, "../..", CONFIG.addFilterScript || "lib/filter/add-rule.sh" ),
    remover = PATH.resolve( require.main.filename, "../..", CONFIG.removeFilterScript || "lib/filter/remove-rule.sh" );


function _addRule( ip, restorer ) {
	var script = CHILD.spawn( adder, [ ip ], {
		stdio: [ "ignore", "ignore", process.stderr ]
	} );

	script.on( "close", function( code ) {
		if ( code ) {
			restorer && restorer( ip );
			restorer = null;

			console.error( "invoking script for adding filter on " + ip + " returned with #" + code );
		}
	} );

	script.on( "error", function( error ) {
		restorer && restorer( ip );
		restorer = null;

		if ( error.code === "ENOENT" ) {
			console.error( "missing script for adding filter: " + remover );
		} else {
			console.error( "error on invoking script for adding filter: " + error );
		}
	} );
}

function _removeRule( ip, restorer ) {
	var script = CHILD.spawn( remover, [ ip ], {
		stdio: [ "ignore", "ignore", process.stderr ]
	} );

	script.on( "close", function( code ) {
		if ( code ) {
			restorer && restorer( ip );
			restorer = null;

			console.error( "invoking script for removing filter on " + ip + " returned with #" + code );
		}
	} );

	script.on( "error", function( error ) {
		restorer && restorer( ip );
		restorer = null;

		if ( error.code === "ENOENT" ) {
			console.error( "missing script for removing filter: " + remover );
		} else {
			console.error( "error on invoking script for removing filter: " + error );
		}
	} );
}

function _flushRules( ruleSet, currentTime ) {
	Object.keys( ruleSet ).forEach( function( ip ) {
		if ( currentTime === true || ( ( currentTime - ruleSet[ip] ) / 1000 / 60 > ( CONFIG.cureTime || 360 ) ) ) {
			var timestamp = ruleSet[ip];

			_removeRule( ip, function() {
				// failed to remove rule
				// -> restore internal mark for trying again next time
				if ( !( ip in ruleSet ) ) {
					ruleSet[ip] = timestamp;
				}
			} );

			delete ruleSet[ip];
		}
	} );
}



function BlockingList() {
	var that = this;

	this._set = {};

	setInterval( function() {
		_flushRules( that._set, new Date().getTime() );
	}, 60 * 1000 );
}

BlockingList.prototype.add = function( ip ) {
	var that = this;

	if ( !( ip in this._set ) ) {
		_addRule( ip, function( ip ) {
			// failed to add rule
			// -> delete internal mark as well for trying again next time
			delete that._set[ip];
		} );
	}

	this._set[ip] = new Date().getTime();
};

BlockingList.prototype.flush = function() {
	_flushRules( this._set, true );
};



exports.createBlockingList = function() {
	return new BlockingList();
};
