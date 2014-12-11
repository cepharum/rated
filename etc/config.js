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


/**
 * Defines number of requests per IP address to capture within single time slice
 * for adding filter rule to block further requests from that same IP address.
 *
 * @type {int}
 */

exports.limit = 360;

/**
 * Defines length of time slices in seconds.
 *
 * @type {int}
 */

exports.granularity = 120;

/**
 * Defines number of minutes (not seconds!) to wait before re-enabling blocked
 * IP address by removing previously added filter rule.
 *
 * @type {int}
 */

exports.cureTime = 360;

/**
 * Defines IP addresses to be never blocked.
 *
 * @type {Object.<string,boolean>}
 */

exports.whiteListIp = {};

/**
 * Defines prefixes of request URLs to be never blocked.
 *
 * @note Testing against this list is more expensive than testing white-listed
 *       IPs for every element in list must be tested for being prefix of some
 *       given URL. *Keep this list short!*
 *
 * @type {Array.<string>}
 */

exports.whiteListUrl = [];

/**
 * Defines pattern for extracting remote IP address from notification on
 * incoming request received by any selected receiver.
 *
 * The IP address must be contained in sub-match with index 1.
 *
 * @type {RegExp}
 */

exports.ipExtractor = /^(?:rated\/)?((?:\d+\.){3}\d+)(?:\s|\?|$)/;

/**
 * Defines pattern for extracting requested URL from notification on incoming
 * request received by any selected receiver.
 *
 * The requested URL must be contained in sub-match with index 1.
 *
 * @note Processing request URL is disabled unless providing some extracting
 *       pattern here.
 *
 * @note On using receiver `http` this extractor is applied on notification
 *       compiled from remote IP and request URL by combining either with some
 *       glue string as configured in `httpNotificationGlue`.
 *
 * @type {RegExp}
 */

exports.urlExtractor = /\s(\S+)(?:\s|\?|$)/;

/**
 * Defines port number receiver `http` is bound to for listening for incoming
 * notifications.
 *
 * @default 8080
 * @type {int}
 */

exports.httpPort = 8080;

/**
 * Defines IP address receiver `http` is bound to for listening for incoming
 * notifications.
 *
 * @default 127.0.0.1
 * @type {string}
 */

exports.httpAddress = "127.0.0.1";

/**
 * Defines port number receiver `syslog` is bound to for listening for incoming
 * notifications.
 *
 * @default 514
 * @type {int}
 */

exports.syslogPort = 514;

/**
 * Defines IP address receiver `syslog` is bound to for listening for incoming
 * notifications.
 *
 * @default 127.0.0.1
 * @type {string}
 */

exports.syslogAddress = "127.0.0.1";

/**
 * Defines pathname of Unix socket to receive notifications on incoming requests
 * on when using receiver `unix`.
 *
 * @default /var/run/rated.sock
 * @type {string}
 */

exports.unixSocket =  "/var/run/rated.sock";

/**
 * Defines HTTP status code returned by receiver `http` on receiving request
 * notification.
 *
 * This is 444 by default for improved integration of rated with nginx.
 *
 * @default 444
 * @type {number}
 */

exports.httpStatusCode = 444;

/**
 * Defines HTTP status text related to code given in httpStatusCode before.
 *
 * This is "No Response" by default for improved integration of rated with
 * nginx.
 *
 * @default No Response
 * @type {string}
 */

exports.httpStatusText = "No Response";

/**
 * Defines glue to put between remote IP and request URL for compiling
 * notification including request URL in receiver `http`.
 *
 * @note Combining IP and URL might be disabled by providing null here.
 *
 * @default " " (single whitespace)
 * @type {?string}
 */

exports.httpNotificationGlue = " ";
