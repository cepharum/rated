/**
 * (c) 2014 cepharum GmbH, Berlin, http://cepharum.de
 *
 *    Derived from: http://stackoverflow.com/questions/18638900/javascript-crc32
 * Original Author: http://stackoverflow.com/users/1775178/alex
 *
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


var crcTable = (function () {
	var n, k, c, table = [];

	for ( n = 0; n < 256; n++ ) {
		c = n;

		for ( k = 0; k < 8; k++ ) {
			c = ( ( c & 1 ) ? ( 0xEDB88320 ^ ( c >>> 1 ) ) : ( c >>> 1 ) );
		}

		table[n] = c;
	}

	return table;
})();


/**
 * Calculates CRC32 of provided string.
 *
 * @param {string} str some arbitrary string
 * @returns {number} CRC32 of provided string
 */

exports.calculate = function ( str ) {
	var crc = 0 ^ (-1);

	for ( var i = 0; i < str.length; i++ ) {
		crc = ( crc >>> 8 ) ^ crcTable[( crc ^ str.charCodeAt( i ) ) & 0xFF];
	}

	return ( crc ^ ( -1 ) ) >>> 0;
};
