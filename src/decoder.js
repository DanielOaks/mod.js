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
        this.rate = 44100; // This was hard-coded in jsmodplayer, too.

        this.samples = [];
        this.sampleData = [];
        this.positions = [];
        this.patternCount = 0;
        this.patterns = [];
        this.channelCount = 0;
        this.title = undefined;

        /* timing calculations */
        this.ticksPerSecond = 7093789.2; /* PAL frequency */
        this.ticksPerFrame; /* calculated by setBpm */
        this.ticksPerOutputSample = Math.round(this.ticksPerSecond / this.rate);
        this.ticksSinceStartOfFrame = 0;

        /* initial player state */
        this.framesPerRow = 6;
        this.currentFrame = 0;
        this.currentPattern = undefined;
        this.currentPosition = undefined;
        this.currentRow = undefined;
        this.exLoop = false;        //whether E6x looping is currently set
        this.exLoopStart = 0;    //loop point set up by E60
        this.exLoopEnd = 0;        //end of loop (where we hit a E6x cmd) for accurate counting
        this.exLoopCount = 0;    //loops remaining
        this.doBreak = false;    //Bxx, Dxx - jump to order and pattern break
        this.breakPos = 0;
        this.breakRow = 0;
        this.delayRows = false; //EEx pattern delay.

        this.channels = [];

        this.bufferSeconds = 5;
        this.bufferLength = this.rate * 2 * this.bufferSeconds;

        this.floatingPoint = true;
    }

    this.prototype.getSample = function(str) {
        if (!this.stream.available(30))
            return; // return if there isn't a full sample loaded.

        var sampleInfo = this.stream.readString(30),
            sampleName = trimNulls(sampleInfo.substr(0, 22));

        return {
            name: sampleName,
            length: getWord(sampleInfo, 22) * 2,
            finetune: sampleInfo.charCodeAt(24),
            volume: sampleInfo.charCodeAt(25),
            repeatOffset: getWord(sampleInfo, 26) * 2,
            repeatLength: getWord(sampleInfo, 28) * 2,
        };
    }

    this.prototype.readPositionData = function() {
        this.positionCount = this.stream.readUInt8();
        this.positionLoopPoint = this.stream.readUInt8();
        for (var i = 0; i < 128; i++) {
            this.positions[i] = this.stream.readUInt8();
            if (this.positions[i] >= this.patternCount) {
                this.patternCount = this.positions[i]+1;
            }
        }
    }

    this.prototype.readPatterns = function() {
        var pattern = undefined;

        for (var pat = 0; pat < this.patternCount; pat++) {
            this.patterns[pat] = [];
            console.log("[decoder] patterns[" + pat + "][0..64] @ " + this.stream.offset);
            for (var row = 0; row < 64; row++) {
                this.patterns[pat][row] = [];

                for (var chan = 0; chan < this.channelCount; chan++) {
                    b0 = this.stream.readUInt8();
                    b1 = this.stream.readUInt8();
                    b2 = this.stream.readUInt8();
                    b3 = this.stream.readUInt8();
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
    }

    this.prototype.readSampleData = function() {
        for (var s = 0; s < this.sampleCount; s++) {
            console.log("[decoder] Sample data @ " + this.stream.offset);

            this.samples[s].startOffset = this.stream.offset;
            this.sampleData[s] = new Uint8Array(this.samples[s].length, "uint8");
            for (var i = 0; i < this.samples[s].length; i++) {
                this.sampleData[s][i] = this.stream.readUInt8();
            }
        }
    }

    this.prototype.readChunk = function() {
        var stream    = this.stream,
            pos       = 0,
            remaining = 0;

        while ((remaining = stream.remainingBytes()) > 0) {
            pos = stream.offset;

            if (pos == 0) {
                if (remaining < 20) break; // Need 20 bytes for title.

                this.title = trimNulls(stream.readString(20));
                console.log("[decoder] Title: " + this.title);
            } else if (this.isSample(pos)) {
                var sample;
                if (remaining < 30) break; // Need 30 bytes for sample.

                sample = this.samples[this.samples.length] = this.getSample();
                console.log("[decoder] Found sample @ " + pos + ", length: " + sample['length']);
                console.log("          Name: " + sample['name']);
            } else if (pos == 950) {
                this.readPositionData();

                var identifier = stream.readString(4);

                this.channelCount = MODDemuxer.channelCountByIdentifier[identifier];
                if (!this.channelCount) {
                    this.channelCount = 4;
                }

                this.readPatterns();

                this.readSampleData();

                // Play the audio!
                this.setChannels();
                this.setBpm(125);
                this.loadPosition(0);
                console.log(this.getSamples());
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



/*
    Useful docs
        Explains effect calculations: http://www.mediatel.lu/workshop/audio/fileformat/h_mod.html

*/

/*
this.modPeriodTable[ft][n] = the period to use for note number n at finetune value ft.
Finetune values are in twos-complement, i.e. [0,1,2,3,4,5,6,7,-8,-7,-6,-5,-4,-3,-2,-1]
The first table is used to generate a reverse lookup table, to find out the note number
for a period given in the MOD file.
*/
this.modPeriodTable = [
    [1712, 1616, 1524, 1440, 1356, 1280, 1208, 1140, 1076, 1016, 960 , 906,
     856 , 808 , 762 , 720 , 678 , 640 , 604 , 570 , 538 , 508 , 480 , 453,
     428 , 404 , 381 , 360 , 339 , 320 , 302 , 285 , 269 , 254 , 240 , 226,
     214 , 202 , 190 , 180 , 170 , 160 , 151 , 143 , 135 , 127 , 120 , 113,
     107 , 101 , 95  , 90  , 85  , 80  , 75  , 71  , 67  , 63  , 60  , 56 ],
    [1700, 1604, 1514, 1430, 1348, 1274, 1202, 1134, 1070, 1010, 954 , 900,
     850 , 802 , 757 , 715 , 674 , 637 , 601 , 567 , 535 , 505 , 477 , 450,
     425 , 401 , 379 , 357 , 337 , 318 , 300 , 284 , 268 , 253 , 239 , 225,
     213 , 201 , 189 , 179 , 169 , 159 , 150 , 142 , 134 , 126 , 119 , 113,
     106 , 100 , 94  , 89  , 84  , 79  , 75  , 71  , 67  , 63  , 59  , 56 ],
    [1688, 1592, 1504, 1418, 1340, 1264, 1194, 1126, 1064, 1004, 948 , 894,
     844 , 796 , 752 , 709 , 670 , 632 , 597 , 563 , 532 , 502 , 474 , 447,
     422 , 398 , 376 , 355 , 335 , 316 , 298 , 282 , 266 , 251 , 237 , 224,
     211 , 199 , 188 , 177 , 167 , 158 , 149 , 141 , 133 , 125 , 118 , 112,
     105 , 99  , 94  , 88  , 83  , 79  , 74  , 70  , 66  , 62  , 59  , 56 ],
    [1676, 1582, 1492, 1408, 1330, 1256, 1184, 1118, 1056, 996 , 940 , 888,
     838 , 791 , 746 , 704 , 665 , 628 , 592 , 559 , 528 , 498 , 470 , 444,
     419 , 395 , 373 , 352 , 332 , 314 , 296 , 280 , 264 , 249 , 235 , 222,
     209 , 198 , 187 , 176 , 166 , 157 , 148 , 140 , 132 , 125 , 118 , 111,
     104 , 99  , 93  , 88  , 83  , 78  , 74  , 70  , 66  , 62  , 59  , 55 ],
    [1664, 1570, 1482, 1398, 1320, 1246, 1176, 1110, 1048, 990 , 934 , 882,
     832 , 785 , 741 , 699 , 660 , 623 , 588 , 555 , 524 , 495 , 467 , 441,
     416 , 392 , 370 , 350 , 330 , 312 , 294 , 278 , 262 , 247 , 233 , 220,
     208 , 196 , 185 , 175 , 165 , 156 , 147 , 139 , 131 , 124 , 117 , 110,
     104 , 98  , 92  , 87  , 82  , 78  , 73  , 69  , 65  , 62  , 58  , 55 ],
    [1652, 1558, 1472, 1388, 1310, 1238, 1168, 1102, 1040, 982 , 926 , 874,
     826 , 779 , 736 , 694 , 655 , 619 , 584 , 551 , 520 , 491 , 463 , 437,
     413 , 390 , 368 , 347 , 328 , 309 , 292 , 276 , 260 , 245 , 232 , 219,
     206 , 195 , 184 , 174 , 164 , 155 , 146 , 138 , 130 , 123 , 116 , 109,
     103 , 97  , 92  , 87  , 82  , 77  , 73  , 69  , 65  , 61  , 58  , 54 ],
    [1640, 1548, 1460, 1378, 1302, 1228, 1160, 1094, 1032, 974 , 920 , 868,
     820 , 774 , 730 , 689 , 651 , 614 , 580 , 547 , 516 , 487 , 460 , 434,
     410 , 387 , 365 , 345 , 325 , 307 , 290 , 274 , 258 , 244 , 230 , 217,
     205 , 193 , 183 , 172 , 163 , 154 , 145 , 137 , 129 , 122 , 115 , 109,
     102 , 96  , 91  , 86  , 81  , 77  , 72  , 68  , 64  , 61  , 57  , 54 ],
    [1628, 1536, 1450, 1368, 1292, 1220, 1150, 1086, 1026, 968 , 914 , 862,
     814 , 768 , 725 , 684 , 646 , 610 , 575 , 543 , 513 , 484 , 457 , 431,
     407 , 384 , 363 , 342 , 323 , 305 , 288 , 272 , 256 , 242 , 228 , 216,
     204 , 192 , 181 , 171 , 161 , 152 , 144 , 136 , 128 , 121 , 114 , 108,
     102 , 96  , 90  , 85  , 80  , 76  , 72  , 68  , 64  , 60  , 57  , 54 ],
    [1814, 1712, 1616, 1524, 1440, 1356, 1280, 1208, 1140, 1076, 1016, 960,
     907 , 856 , 808 , 762 , 720 , 678 , 640 , 604 , 570 , 538 , 508 , 480,
     453 , 428 , 404 , 381 , 360 , 339 , 320 , 302 , 285 , 269 , 254 , 240,
     226 , 214 , 202 , 190 , 180 , 170 , 160 , 151 , 143 , 135 , 127 , 120,
     113 , 107 , 101 , 95  , 90  , 85  , 80  , 75  , 71  , 67  , 63  , 60 ],
    [1800, 1700, 1604, 1514, 1430, 1350, 1272, 1202, 1134, 1070, 1010, 954,
     900 , 850 , 802 , 757 , 715 , 675 , 636 , 601 , 567 , 535 , 505 , 477,
     450 , 425 , 401 , 379 , 357 , 337 , 318 , 300 , 284 , 268 , 253 , 238,
     225 , 212 , 200 , 189 , 179 , 169 , 159 , 150 , 142 , 134 , 126 , 119,
     112 , 106 , 100 , 94  , 89  , 84  , 79  , 75  , 71  , 67  , 63  , 59 ],
    [1788, 1688, 1592, 1504, 1418, 1340, 1264, 1194, 1126, 1064, 1004, 948,
     894 , 844 , 796 , 752 , 709 , 670 , 632 , 597 , 563 , 532 , 502 , 474,
     447 , 422 , 398 , 376 , 355 , 335 , 316 , 298 , 282 , 266 , 251 , 237,
     223 , 211 , 199 , 188 , 177 , 167 , 158 , 149 , 141 , 133 , 125 , 118,
     111 , 105 , 99  , 94  , 88  , 83  , 79  , 74  , 70  , 66  , 62  , 59 ],
    [1774, 1676, 1582, 1492, 1408, 1330, 1256, 1184, 1118, 1056, 996 , 940,
     887 , 838 , 791 , 746 , 704 , 665 , 628 , 592 , 559 , 528 , 498 , 470,
     444 , 419 , 395 , 373 , 352 , 332 , 314 , 296 , 280 , 264 , 249 , 235,
     222 , 209 , 198 , 187 , 176 , 166 , 157 , 148 , 140 , 132 , 125 , 118,
     111 , 104 , 99  , 93  , 88  , 83  , 78  , 74  , 70  , 66  , 62  , 59 ],
    [1762, 1664, 1570, 1482, 1398, 1320, 1246, 1176, 1110, 1048, 988 , 934,
     881 , 832 , 785 , 741 , 699 , 660 , 623 , 588 , 555 , 524 , 494 , 467,
     441 , 416 , 392 , 370 , 350 , 330 , 312 , 294 , 278 , 262 , 247 , 233,
     220 , 208 , 196 , 185 , 175 , 165 , 156 , 147 , 139 , 131 , 123 , 117,
     110 , 104 , 98  , 92  , 87  , 82  , 78  , 73  , 69  , 65  , 61  , 58 ],
    [1750, 1652, 1558, 1472, 1388, 1310, 1238, 1168, 1102, 1040, 982 , 926,
     875 , 826 , 779 , 736 , 694 , 655 , 619 , 584 , 551 , 520 , 491 , 463,
     437 , 413 , 390 , 368 , 347 , 328 , 309 , 292 , 276 , 260 , 245 , 232,
     219 , 206 , 195 , 184 , 174 , 164 , 155 , 146 , 138 , 130 , 123 , 116,
     109 , 103 , 97  , 92  , 87  , 82  , 77  , 73  , 69  , 65  , 61  , 58 ],
    [1736, 1640, 1548, 1460, 1378, 1302, 1228, 1160, 1094, 1032, 974 , 920,
     868 , 820 , 774 , 730 , 689 , 651 , 614 , 580 , 547 , 516 , 487 , 460,
     434 , 410 , 387 , 365 , 345 , 325 , 307 , 290 , 274 , 258 , 244 , 230,
     217 , 205 , 193 , 183 , 172 , 163 , 154 , 145 , 137 , 129 , 122 , 115,
     108 , 102 , 96  , 91  , 86  , 81  , 77  , 72  , 68  , 64  , 61  , 57 ],
    [1724, 1628, 1536, 1450, 1368, 1292, 1220, 1150, 1086, 1026, 968 , 914,
     862 , 814 , 768 , 725 , 684 , 646 , 610 , 575 , 543 , 513 , 484 , 457,
     431 , 407 , 384 , 363 , 342 , 323 , 305 , 288 , 272 , 256 , 242 , 228,
     216 , 203 , 192 , 181 , 171 , 161 , 152 , 144 , 136 , 128 , 121 , 114,
     108 , 101 , 96  , 90  , 85  , 80  , 76  , 72  , 68  , 64  , 60  , 57 ]];

this.sineTable = [
    0,24,49,74,97,120,141,161,180,197,212,224,235,244,250,253,
    255,253,250,244,235,224,212,197,180,161,141,120,97,74,49,
    24,0,-24,-49,-74,-97,-120,-141,-161,-180,-197,-212,-224,
    -235,-244,-250,-253,-255,-253,-250,-244,-235,-224,-212,-197,
    -180,-161,-141,-120,-97,-74,-49,-24
];

this.modPeriodToNoteNumber = {};
for (var i = 0; i < this.modPeriodTable[0].length; i++) {
    this.modPeriodToNoteNumber[this.modPeriodTable[0][i]] = i;
}

    this.prototype.setBpm = function(bpm) {
        /* x beats per minute => x*4 rows per minute */
        this.ticksPerFrame = Math.round(this.ticksPerSecond * 2.5/bpm);
    }

    this.prototype.setChannels = function() {
        for (var chan = 0; chan < this.channelCount; chan++) {
            this.channels[chan] = {
                playing: false,
                sample: this.samples[0],
                finetune: 0,
                volume: 0,
                pan: 0x7F,    //unimplemented
                volumeDelta: 0,
                periodDelta: 0,
                fineVolumeDelta: 0,
                finePeriodDelta: 0,
                tonePortaTarget: 0, //target for 3xx, 5xy as period value
                tonePortaDelta: 0,
                tonePortaVolStep: 0, //remember pitch slide step for when 5xx is used
                tonePortaActive: false,
                cut: false,            //tick to cut at, or false if no cut
                delay: false,        //tick to delay note until, or false if no delay
                arpeggioActive: false
            };
        }
    }

    this.prototype.loadRow = function(rowNumber) {
        this.currentRow = rowNumber;
        this.currentFrame = 0;
        this.doBreak = false;
        this.breakPos = 0;
        this.breakRow = 0;

        for (var chan = 0; chan < this.channelCount; chan++) {
            var channel = this.channels[chan];
            var prevNote = channel.prevNote;
            var note = this.currentPattern[this.currentRow][chan];
            if (channel.sampleNum == undefined) {
                    channel.sampleNum = 0;
            }
            if (note.period != 0 || note.sample != 0) {
                channel.playing = true;
                channel.samplePosition = 0;
                channel.ticksSinceStartOfSample = 0; /* that's 'sample' as in 'individual volume reading' */
                if (note.sample != 0) {
                    channel.sample = this.samples[note.sample - 1];
                    channel.sampleNum = note.sample - 1;
                    channel.volume = channel.sample.volume;
                    channel.finetune = channel.sample.finetune;
                }
                if (note.period != 0) { // && note.effect != 0x03
                    //the note specified in a tone porta command is not actually played
                    if (note.effect != 0x03) {
                        channel.noteNumber = MODDecoder.modPeriodToNoteNumber[note.period];
                        channel.ticksPerSample = MODDecoder.modPeriodTable[channel.finetune][channel.noteNumber] * 2;
                    } else {
                        channel.noteNumber = MODDecoder.modPeriodToNoteNumber[prevNote.period]
                        channel.ticksPerSample = MODDecoder.modPeriodTable[channel.finetune][channel.noteNumber] * 2;
                    }
                }
            }
            channel.finePeriodDelta = 0;
            channel.fineVolumeDelta = 0;
            channel.cut = false;
            channel.delay = false;
            channel.retrigger = false;
            channel.tonePortaActive = false;
            if (note.effect != 0 || note.effectParameter != 0) {
                channel.volumeDelta = 0; /* new effects cancel volumeDelta */
                channel.periodDelta = 0; /* new effects cancel periodDelta */
                channel.arpeggioActive = false;
                switch (note.effect) {
                    case 0x00: /* arpeggio: 0xy */
                        channel.arpeggioActive = true;
                        channel.arpeggioNotes = [
                            channel.noteNumber,
                            channel.noteNumber + (note.effectParameter >> 4),
                            channel.noteNumber + (note.effectParameter & 0x0f)
                        ]
                        channel.arpeggioCounter = 0;
                        break;
                    case 0x01: /* pitch slide up - 1xx */
                        channel.periodDelta = -note.effectParameter;
                        break;
                    case 0x02: /* pitch slide down - 2xx */
                        channel.periodDelta = note.effectParameter;
                        break;
                    case 0x03: /* slide to note 3xy - */
                        channel.tonePortaActive = true;
                        channel.tonePortaTarget = (note.period != 0) ? note.period : channel.tonePortaTarget;
                        var dir = (channel.tonePortaTarget < prevNote.period) ? -1 : 1;
                        channel.tonePortaDelta = (note.effectParameter * dir);
                        channel.tonePortaVolStep = (note.effectParameter * dir);
                        channel.tonePortaDir = dir;
                        break;
                    case 0x05: /* portamento to note with volume slide 5xy */
                        channel.tonePortaActive = true;
                        if (note.effectParameter & 0xf0) {
                            channel.volumeDelta = note.effectParameter >> 4;
                        } else {
                            channel.volumeDelta = -note.effectParameter;
                        }
                        channel.tonePortaDelta = channel.tonePortaVolStep;
                        break;
                    case 0x09: /* sample offset - 9xx */
                        channel.samplePosition = 256 * note.effectParameter;
                        break;
                    case 0x0A: /* volume slide - Axy */
                        if (note.effectParameter & 0xf0) {
                            /* volume increase by x */
                            channel.volumeDelta = note.effectParameter >> 4;
                        } else {
                            /* volume decrease by y */
                            channel.volumeDelta = -note.effectParameter;
                        }
                        break;
                    case 0x0B: /* jump to order */
                        doBreak = true;
                        breakPos = note.effectParameter;
                        breakRow = 0;
                        break;
                    case 0x0C: /* volume */
                        if (note.effectParameter > 64) {
                            channel.volume = 64;
                        } else {
                            channel.volume = note.effectParameter;
                        }
                        break;
                    case 0x0D: /* pattern break; jump to next pattern at specified row */
                        doBreak = true;
                        breakPos = currentPosition + 1;
                        //Row is written as DECIMAL so grab the high part as a single digit and do some math
                        breakRow = ((note.effectParameter & 0xF0) >> 4) * 10 + (note.effectParameter & 0x0F);
                        break;

                    case 0x0E:
                        switch (note.extEffect) {    //yes we're doing nested switch
                            case 0x01: /* fine pitch slide up - E1x */
                                channel.finePeriodDelta = -note.extEffectParameter;
                                break;
                            case 0x02: /* fine pitch slide down - E2x */
                                channel.finePeriodDelta = note.extEffectParameter;
                                break;
                            case 0x05: /* set finetune - E5x */
                                channel.finetune = note.extEffectParameter;
                                break;
                            case 0x09: /* retrigger sample - E9x */
                                channel.retrigger = note.extEffectParameter;
                                break;
                            case 0x0A: /* fine volume slide up - EAx */
                                channel.fineVolumeDelta = note.extEffectParameter;
                                break;
                            case 0x0B: /* fine volume slide down - EBx */
                                channel.fineVolumeDelta = -note.extEffectParameter;
                                break;
                            case 0x0C: /* note cute - ECx */
                                channel.cut = note.extEffectParameter;
                                break;
                            case 0x0D: /* note delay - EDx */
                                channel.delay = note.extEffectParameter;
                                break;
                            case 0x0E: /* pattern delay EEx */
                                delayRows = note.extEffectParameter;
                                break;
                            case 0x06:
                                //set loop start with E60
                                if (note.extEffectParameter == 0) {
                                    exLoopStart = currentRow;
                                } else {
                                    //set loop end with E6x
                                    exLoopEnd = currentRow;
                                    //activate the loop only if it's new
                                    if (!exLoop) {
                                        exLoop = true;
                                        exLoopCount = note.extEffectParameter;
                                    }
                                }
                                break;
                        }

                        break;

                    case 0x0F: /* tempo change. <=32 sets ticks/row, greater sets beats/min instead */
                        var newSpeed = (note.effectParameter == 0) ? 1 : note.effectParameter; /* 0 is treated as 1 */
                        if (newSpeed <= 32) {
                            framesPerRow = newSpeed;
                        } else {
                            this.setBpm(newSpeed);
                        }
                        break;
                }
            }

            //for figuring out tone portamento effect
            if (note.period != 0) { channel.prevNote = note; }

            if (channel.tonePortaActive == false) {
                channel.tonePortaDelta = 0;
                channel.tonePortaTarget = 0;
                channel.tonePortaVolStep = 0;
            }
        }
    }

    this.prototype.loadPattern = function(patternNumber) {
        var row = this.doBreak ? this.breakRow : 0;
        this.currentPattern = this.patterns[patternNumber];
        this.loadRow(row);
    }

    this.prototype.loadPosition = function(positionNumber) {
        //Handle invalid position numbers that may be passed by invalid loop points
        positionNumber = (positionNumber > this.positionCount - 1) ? 0 : positionNumber;
        this.currentPosition = positionNumber;
        this.loadPattern(this.positions[this.currentPosition]);
    }

    this.prototype.getNextPosition = function() {
        if (this.currentPosition + 1 >= this.positionCount) {
            this.loadPosition(this.positionLoopPoint);
        } else {
            this.loadPosition(this.currentPosition + 1);
        }
    }

    this.prototype.getNextRow = function() {
        /*
            Determine where we're gonna go based on active effect.
            Either:
                break (jump to new pattern),
                do extended loop,
                advance normally
        */
        if (this.doBreak) {
            //Dxx commands at the end of modules are fairly common for some reason
            //so make sure jumping past the end loops back to the start
            this.breakPos = (this.breakPos >= this.positionCount) ? this.positionLoopPoint : this.breakPos;
            this.loadPosition(this.breakPos);
        } else if (this.exLoop && this.currentRow == this.exLoopEnd && this.exLoopCount > 0) {
            //count down the loop and jump back
            this.loadRow(this.exLoopStart);
            this.exLoopCount--;
        } else {
            if (this.currentRow == 63) {
                this.getNextPosition();
            } else {
                this.loadRow(this.currentRow + 1);
            }
        }

        if (this.exLoopCount < 0) { this.exLoop = false; }
    }

    this.prototype.doFrame = function() {
        /* apply volume/pitch slide before fetching row, because the first frame of a row does NOT
        have the slide applied */

        for (var chan = 0; chan < this.channelCount; chan++) {
            var channel = this.channels[chan];
            var finetune = channel.finetune;
            if (this.currentFrame == 0) { /* apply fine slides only once */
                channel.ticksPerSample += channel.finePeriodDelta * 2;
                channel.volume += channel.fineVolumeDelta;
            }
            channel.volume += channel.volumeDelta;
            if (channel.volume > 64) {
                channel.volume = 64;
            } else if (channel.volume < 0) {
                channel.volume = 0;
            }
            if (channel.cut !== false && this.currentFrame >= channel.cut) {
                channel.volume = 0;
            }
            if (channel.delay !== false && this.currentFrame <= channel.delay) {
                channel.volume = 0;
            }
            if (channel.retrigger !== false) {
                //short-circuit prevents x mod 0
                if (channel.retrigger == 0 || this.currentFrame % channel.retrigger == 0) {
                    channel.samplePosition = 0;
                }
            }
            channel.ticksPerSample += channel.periodDelta * 2;
            if (channel.tonePortaActive) {
                channel.ticksPerSample += channel.tonePortaDelta * 2;
                //don't slide below or above allowed note, depending on slide direction
                if (channel.tonePortaDir == 1 && channel.ticksPerSample > channel.tonePortaTarget * 2) {
                    channel.ticksPerSample = channel.tonePortaTarget * 2;
                } else if (channel.tonePortaDir == -1 && channel.ticksPerSample < channel.tonePortaTarget * 2)  {
                    channel.ticksPerSample = channel.tonePortaTarget * 2;
                }
            }

            if (channel.ticksPerSample > 4096) {
                channel.ticksPerSample = 4096;
            } else if (channel.ticksPerSample < 96) { /* equivalent to period 48, a bit higher than the highest note */
                channel.ticksPerSample = 96;
            }
            if (channel.arpeggioActive) {
                channel.arpeggioCounter++;
                var noteNumber = channel.arpeggioNotes[channel.arpeggioCounter % 3];
                channel.ticksPerSample = MODDecoder.modPeriodTable[finetune][noteNumber] * 2;
            }
        }

        this.currentFrame++;
        if (this.currentFrame == this.framesPerRow) {
            this.currentFrame = 0;
            //Don't advance to reading more rows if pattern delay effect is active
            if (this.delayRows !== false) {
                this.delayRows--;
                if (this.delayRows < 0) { this.delayRows = false; }
            } else {
                this.getNextRow();
            }
        }
    }

    this.prototype.getSamples = function(sampleCount) {
        if (typeof sampleCount == "undefined")
            sampleCount = this.bufferLength;

        var samples = new Float32Array(sampleCount);
        var i = 0;
        while (i < sampleCount) {
            this.ticksSinceStartOfFrame += this.ticksPerOutputSample;
            while (this.ticksSinceStartOfFrame >= this.ticksPerFrame) {
                this.doFrame();
                this.ticksSinceStartOfFrame -= this.ticksPerFrame;
            }

            this.leftOutputLevel = 0;
            this.rightOutputLevel = 0;
            for (var chan = 0; chan < this.channelCount; chan++) {
                var channel = this.channels[chan];
                if (channel.playing) {
                    channel.ticksSinceStartOfSample += this.ticksPerOutputSample;
                    while (channel.ticksSinceStartOfSample >= channel.ticksPerSample) {
                        channel.samplePosition++;
                        if (channel.sample.repeatLength > 2 && channel.samplePosition >= channel.sample.repeatOffset + channel.sample.repeatLength) {
                            channel.samplePosition = channel.sample.repeatOffset;
                        } else if (channel.samplePosition >= channel.sample.length) {
                            channel.playing = false;
                            break;
                        } else {
                            channel.ticksSinceStartOfSample -= channel.ticksPerSample;
                        }
                    }

                    if (channel.playing) {
                        var rawVol = this.sampleData[channel.sampleNum][channel.samplePosition];
                        var vol = (((this.rawVol + 128) & 0xff) - 128) * channel.volume; /* range (-128*64)..(127*64) */
                        if (chan & 3 == 0 || chan & 3 == 3) { /* hard panning(?): left, right, right, left */
                            this.leftOutputLevel += (vol + channel.pan) * 3;
                            this.rightOutputLevel += (vol + 0xFF - channel.pan);
                        } else {
                            this.leftOutputLevel += (vol + 0xFF - channel.pan)
                            this.rightOutputLevel += (vol + channel.pan) * 3;
                        }
                        /* range of outputlevels is 128*64*2*channelCount */
                        /* (well, it could be more for odd channel counts) */
                    }
                }
            }

            samples[i] = this.leftOutputLevel / (128 * 128 * this.channelCount);
            samples[i+1] = this.rightOutputLevel / (128 * 128 * this.channelCount);
            i += 2;
        }

        this.emit('data', samples);

        return samples;
    }

});
