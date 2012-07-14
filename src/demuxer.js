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

    this.channelCountByIdentifier = {
        'TDZ1': 1, '1CHN': 1, 'TDZ2': 2, '2CHN': 2, 'TDZ3': 3, '3CHN': 3,
        'M.K.': 4, 'FLT4': 4, 'M!K!': 4, '4CHN': 4, 'TDZ4': 4, '5CHN': 5, 'TDZ5': 5,
        '6CHN': 6, 'TDZ6': 6, '7CHN': 7, 'TDZ7': 7, '8CHN': 8, 'TDZ8': 8, 'OCTA': 8, 'CD81': 8,
        '9CHN': 9, 'TDZ9': 9,
        '10CH': 10, '11CH': 11, '12CH': 12, '13CH': 13, '14CH': 14, '15CH': 15, '16CH': 16, '17CH': 17,
        '18CH': 18, '19CH': 19, '20CH': 20, '21CH': 21, '22CH': 22, '23CH': 23, '24CH': 24, '25CH': 25,
        '26CH': 26, '27CH': 27, '28CH': 28, '29CH': 29, '30CH': 30, '31CH': 31, '32CH': 32
    }

    this.prototype.getIdentifier = function(stream) {
        // Bytes 1080-1084 contain 1 of the 47(?) "magic cookies" in channelCountByIdentifier.
        return stream.peekString(1080, 4);
    }

    this.probe = function(stream) {
        var identifier = this.prototype.getIdentifier(stream);
        return (identifier in MODDemuxer.channelCountByIdentifier);
    }

    // Remove null bytes from a string
	function trimNulls(str) {
		return str.replace(/\x00+$/, '');
	}

    this.prototype.readChunk = function() {
        var stream = this.stream,
            pos    = stream.offset;

        if (pos > 0) {
            console.log("Found more data @ " + pos);
            while (stream.available(1)) {
                buf = stream.readSingleBuffer(stream.remainingBytes());
                this.emit('data', buf);
            }
            return;
        }

        if (!stream.available(1084)) {
            console.log("Only " + stream.remainingBytes() + " of required 1084 bytes available. Waiting.");
            this.once('available', this.readChunk);
            return;
        }

        // The title is 20 bytes long, with all null bytes trimmed.
        var title = trimNulls(stream.peekString(0, 20));
        this.emit('metadata', {
            'title': title
        });

        // Store identifier if it's not already there.
        if (!('identifier' in this)) {
            this.identifier = this.getIdentifier(stream);

            if (!(this.identifier in MODDemuxer.channelCountByIdentifier)) {
                this.emit('error', "Invalid MOD file.");
            }
        }

        this.emit('format', {
            formatID: 'mod',
            sampleRate: '44100', // is this right?
            channelsPerFrame: MODDemuxer.channelCountByIdentifier[this.identifier],
            bitsPerChannel: 16   // is this right?
        });

        while (stream.available(1)) {
            buf = stream.readSingleBuffer(stream.remainingBytes());
            this.emit('data', buf);
        }
    }
});
