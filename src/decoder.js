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

/*
 * Notes:
 * - The first 20 bytes of the file are *ALWAYS* taken by the demuxer, for the title.
 */

MODDecoder = Decoder.extend(function() {
    Decoder.register('mod', this);

    // Remove null bytes from a string
	function trimNulls(str) {
		return str.replace(/\x00+$/, '');
	}

    // Get a word. Mmmmm, magic. Tastes like chicken.
	function getWord(str, pos) {
		return (str.charCodeAt(pos) << 8) + str.charCodeAt(pos+1)
	}

    var samplePositions = [];
    for (var i = 0; i < 31; i ++) {
        samplePositions[i] = 20 + i * 30;
    }

    function isSample(pos) {
        for (var i = 0; i < samplePositions.length; i++) {
            if (samplePositions[i] == pos)
                return true;
        }

        return false;
    }

    this.prototype.init = function() {
        this.data = undefined;
        this.samples = [];
        this.sampleData = [];
        this.positions = [];
        this.patternCount = 0;
        this.patterns = [];
    }

    var sample_count = 31, // I think this varies, but for now we don't care.
        channels     = 4;

    this.prototype.getSample = function(str) {
        if (!this.stream.available(30))
            return; // return if there isn't a full sample loaded.

        var sampleInfo = this.stream.readString(30),
            sampleName = trimNulls(sampleInfo.substr(0, 22));

        return {
            length: getWord(sampleInfo, 22) * 2,
            finetune: sampleInfo.charCodeAt(24),
            volume: sampleInfo.charCodeAt(25),
            repeatOffset: getWord(sampleInfo, 26) * 2,
            repeatLength: getWord(sampleInfo, 28) * 2,
        };
    }

    this.prototype.readChunk = function() {
        var stream    = this.stream,
            pos       = 0,
            remaining = 0;

        while ((remaining = stream.remainingBytes()) > 0) {
            pos = stream.offset;

            if (pos == 0) {
                if (remaining < 20) break; // Need 20 bytes for title.

                console.log("[decoder] Title");
                stream.readString(20); // Ignore title. Caught from the Demuxer.
            } else if (isSample(pos)) {
                if (remaining < 30) break; // Need 30 bytes for sample.

                console.log("[decoder] Sample @ " + pos);
                this.samples[this.samples.length] = this.getSample();
            } else {
                console.log("[decoder] Found something @ " + pos);
                console.log("[decoder] Remaining: " + remaining);
                break;
            }
        }

        console.log("[decoder] Remaining: " + stream.remainingBytes());
        this.once('available', this.readChunk);
        //console.log(stream, stream.offset, stream.remainingBytes(), stream.list.availableBytes);
    }
});
