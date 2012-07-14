/*
 * mod.js - MOD decoder in JavaScript, using Aurora.js
 * Original JavaScript version from jsmodplayer Copyright (C) 2010 Matt Westcott ("Gasman"),
 * William Wenge-Murphy ("BillyWM"), and Sean Neilan ("sneilan").
 *
 * Aurora.js port by Nick Markwell ("duckinator")
 *
 * Licensed under the same terms as the original. The original license follows.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

MODDemuxer = Demuxer.extend(function() {
    Demuxer.register(this);

    this.probe = function(buffer) {
        /*
         * As far as I know, there's nothing that signifies whether or not this
         * is a MOD file, so we just assume it is and barf later if that's not
         * actually the case.
         */
        return true;
    }

    // Remove null bytes from a string
	function trimNulls(str) {
		return str.replace(/\x00+$/, '');
	}

    this.prototype.readChunk = function() {
        var stream = this.stream,
            pos    = stream.offset;

        if (pos == 0) {
            // The title is 20 bytes long, with all null bytes trimmed.
            if (this.stream.available(20)) {
                var title = trimNulls(stream.readString(20));
                this.emit('metadata', {
                    'title': title
                });
            }

            while (stream.available(1)) {
                buf = stream.readSingleBuffer(stream.remainingBytes());
                this.emit('data', buf);
                console.log('data!', buf);
            }
        } else {
            // Holy shit the universe is broken.
            this.emit('error', "MODDemuxer received data starting after byte 0. This should not happen.")
        }
    }
});
