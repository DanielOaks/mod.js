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

    this.prototype.sampleCount     = 31;
    this.prototype.samplePositions = [];
    for (var i = 0; i < this.prototype.sampleCount; i ++) {
        this.prototype.samplePositions[i] = 20 + i * 30;
    }

    this.prototype.isSample = function(pos) {
        return (this.samplePositions.indexOf(pos) > -1);
    }

    this.prototype.init = function() {
        this.data = undefined;
        this.samples = [];
        this.sampleData = [];
        this.positions = [];
        this.patternCount = 0;
        this.patterns = [];
        this.channelCount = 0;
    }

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
            } else if (this.isSample(pos)) {
                if (remaining < 30) break; // Need 30 bytes for sample.

                console.log("[decoder] Sample @ " + pos);
                this.samples[this.samples.length] = this.getSample();
            } else if (pos == 950) {
// Messy, messy, messy...
    var data = stream.readString(130);
	this.positionCount = data.charCodeAt(0);
	this.positionLoopPoint = data.charCodeAt(1);
	for (var i = 0; i < 128; i++) {
		this.positions[i] = data.charCodeAt(2+i);
		if (this.positions[i] >= this.patternCount) {
			this.patternCount = this.positions[i]+1;
		}
	}

console.log(stream.offset)

	var identifier = stream.readString(4);
	
	this.channelCount = MODDemuxer.channelCountByIdentifier[identifier];
	if (!this.channelCount) {
		this.channelCount = 4;
	}


	var pattern       = undefined;
	for (var pat = 0; pat < this.patternCount; pat++) {
		this.patterns[pat] = [];
		for (var row = 0; row < 64; row++) {
            console.log("[decoder] patterns[" + pat + "][" +  row + "] @ " + stream.offset);
			this.patterns[pat][row] = [];
			for (var chan = 0; chan < this.channelCount; chan++) {
//console.log("[decoder] \"pattern\" @ " + stream.offset);
                var pattern = stream.readString(4);
				b0 = pattern.charCodeAt(0);
				b1 = pattern.charCodeAt(1);
				b2 = pattern.charCodeAt(2);
				b3 = pattern.charCodeAt(3);
				var eff = b2 & 0x0f;
				this.patterns[pat][row][chan] = {
					sample: (b0 & 0xf0) | (b2 >> 4),
					period: ((b0 & 0x0f) << 8) | b1,
					effect: eff,
					effectParameter: b3
				};
				if (eff == 0x0E) {
					this.patterns[pat][row][chan].extEffect = (b3 & 0xF0) >> 4;
					this.patterns[pat][row][chan].extEffectParameter = (b3 & 0x0F);
				}
			}
		}
	}

    var offset = 0,
        data   = undefined;
	for (var s = 0; s < this.sampleCount; s++) {
console.log("[decoder] sample data @ " + stream.offset);
        offset = stream.offset
		this.samples[s].startOffset = offset;
		this.sampleData[s] = new Uint8Array(this.samples[s].length, "uint8");
        data = stream.readString(this.samples[s].length);
		var i = 0;
		for (var o = 0; o < this.samples[s].length; o++) {
			this.sampleData[s][i] = data.charCodeAt(o);
			i++;
		}
	}
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
