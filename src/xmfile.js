/*
	http://www.fileformat.info/format/xm/corion.htm
	http://aluigi.org/mymusic/xm.txt
	
	Sample data is stored "Delta compressed like protracker"
		algorithm: http://www.fileformat.info/format/protracker/corion-algorithm.htm
		
	Note numbers are 1 - 96 (C-0 to B-7)
*/
function XMFile(mod) {
	function trimNulls(str) {
		return str.replace(/\x00+$/, '');
	}
	function getWord(str, pos) {
		//little-endian this time
		return (str.charCodeAt(pos)) + (str.charCodeAt(pos+1) << 8)
	}
	function getDword(str, pos) {
		var value =
			(str.charCodeAt(pos+3) * 16777216) +
			(str.charCodeAt(pos+2) << 16) +
			(str.charCodeAt(pos+1) << 8) +
			str.charCodeAt(pos);
		//console.log("DWORD", str.charCodeAt(pos), str.charCodeAt(pos+1), str.charCodeAt(pos+2), str.charCodeAt(pos+3), value);
		return value;
	}
	function getBytes(str, pos, len) {
		return (str.substr(pos, len));
	}
	function getString(str, pos, len) {
		return trimNulls(getBytes(str, pos, len));
	}
	function getArray(str, pos, len) {
		var s = getBytes(str, pos, len);
		var arr = Array(s.length);
		for (var i = 0; i < s.length; i++) {
			arr[i] = s.charCodeAt(i);
		}
		return arr;
	}

	//this.data = mod;
	this.samples = [];
	this.sampleData = [];
	this.positions = [];
	this.patternCount = 0;
	this.patterns = [];
	this.instruments = [];
	this.speed = 6;
	this.bpm = 125;
	this.XM = true;
	
	this.title = getString(mod, 0x11, 20);				//0x11		Song name
	this.positionCount = getWord(mod, 0x40);			//0x40		Song length in patterns
	this.positionLoopPoint = getWord(mod, 0x42);		//0x42		Restart position
	this.channelCount = getWord(mod, 0x44);				//0x44		Number of channels
	this.patternCount = getWord(mod, 0x46);				//0x46		Number of patterns (0 - 255)
	this.instrumentCount = getWord(mod, 0x48);			//0x48		Number of instruments (0 - 127)
	this.periodType = getWord(mod, 0x4A);				//0x4A		Flags (Tells type of period table)
														//				bit 0 set: amiga, bit 1 set: linear
	this.speed = getWord(mod, 0x4C);					//0x4C		Default ticks/row
	this.bpm = getWord(mod, 0x4E);						//0x4E		Default bpm
	
	console.log("BASIC", this);
	//0x50 - pattern order table
	for (var i = 0; i < 256; i++) {
		this.positions[i] = mod.charCodeAt(0x50+i);
	}
	
	var patternOffset = 0x50 + 256;
	var track, packBit, rowCount, dataSize;
	console.log("pattern count", this.patternCount);
	for (var pat = 0; pat < this.patternCount; pat++) {
		var headerLength = getDword(mod, patternOffset);	//Why? Isn't it always 9?
		rowCount = getWord(mod, patternOffset + 5);
		dataSize = getWord(mod, patternOffset + 7);
		this.patterns[pat] = {
			rowCount: rowCount,
		}
		
		//move pointer to first track of row then loop over each one
		patternOffset += 9;
		for (var row = 0; row < this.patterns[pat].rowCount; row++) {
			this.patterns[pat][row] = [];
			for (var chan = 0; chan < this.channelCount; chan++) {
				track = getArray(mod, patternOffset, 5);
				
				//If the most significant bit of a note is NOT set, then read data like normal
				//If it IS set, check the other bits and see what kind of data comes next
				//These are bitflags so 1 to 5 bytes may follow depending on how many are set
				//		bit 0 set: Note byte follows
				//		bit 1 set: Instrument byte follows
				//		bit 2 set: Volume column byte follows
				// 		bit 3 set: Effect byte follows
				//		bit 4 set: Effect data byte follows
				var packBit = track[0] & 0x80;
				var packFlags = track[0] & 0x1F; 	//00011111b
				var noteByte = 0, instrByte = 0, volByte = 0, effByte = 0, effParamByte = 0;
				
				if (packBit) {
					var o = 1; //offset
					//check each bit in order. If set, read byte and increment pointer
					if (packFlags & 0x01) { noteByte = track[o]; o++; }			
					if (packFlags & 0x02) { instrByte = track[o]; o++; }			
					if (packFlags & 0x04) { volByte = track[o]; o++; }
					if (packFlags & 0x08) { effByte = track[o]; o++; }
					if (packFlags & 0x10) { effParamByte = track[o]; o++; }
					patternOffset += o;
				} else {
					//no compression
					noteByte = track[0];
					instrByte = track[1];
					volByte = track[2];
					effByte = track[3];
					effParamByte = track[4];
					patternOffset += 5;
				}
				//var out = "" + noteByte + " " + instrByte.toString(16) + " " + volByte.toString(16) + " " + effByte.toString(16) + " " + effParamByte.toString(16);
				//console.log();
				
				this.patterns[pat][row][chan] = {
					noteNumber: noteByte,
					period: 0,
					instrument: instrByte,
					volume: volByte,
					effect: effByte,
					effectParameter: effParamByte
				}
			}
		}
	}
	
	
	//http://www.fileformat.info/format/protracker/corion-algorithm.htm
	/*The technique for conversion back to the raw data is:

		  Get the number of sample bytes to process.
		  Call this SamplesLeft.

		  Set Delta counter to 0.

		  DO
			Get a byte from the buffer.
			Add delta to byte
			Store the byte in Delta Counter.
			Store the byte in Temp.
			Decrement SamplesLeft.
		  WHILE(SamplesLeft <> 0)
	*/
	//Now do instruments
	var sampleSize;
	var offset = patternOffset;
	var sampleNum = 0;
	for (var inst = 0; inst < this.instrumentCount; inst++) { //< ;
		var headerSize = getDword(mod, offset);
		var sampleHeaderSize = getWord(mod, offset + 29);
		var numSamples = getWord(mod, offset + 27);
		this.instruments[inst] = {
			name: getString(mod, offset + 4, 22),
			type: mod.charCodeAt(offset + 26),		// "always 0"
			samples: numSamples,
			sampleNumbers: getArray(mod, offset + 31, 96)
		}

		offset += headerSize;
		for (var s = 0; s < numSamples; s++) {
			var delta = 0;
			sampleSize = getDword(mod, offset);
			this.samples[sampleNum] = {
				length: sampleSize,
				finetune: mod.charCodeAt(offset + 13),
				volume: mod.charCodeAt(offset + 12),
				repeatOffset: getDword(mod, offset + 4),
				repeatLength: getDword(mod, offset + 8),
				loopType: mod.charCodeAt(offset + 14),
				pan: mod.charCodeAt(offset + 15),
				tuning: 128 - mod.charCodeAt(offset + 16),
				name: getString(mod, offset + 17, 22)
			}
			offset += sampleHeaderSize;
			
			var i = 0;
			this.sampleData[sampleNum] = TypedArray(sampleSize, "int8");
			for (var o = offset, e = offset + this.samples[sampleNum].length; o < e; o++) {
				var byte = mod.charCodeAt(o);
				byte += delta;
				delta = byte;
				this.sampleData[s][i] = byte;
				i++;
			}
			offset += this.samples[sampleNum].length;
			sampleNum++;
		}
	}
	
	
}