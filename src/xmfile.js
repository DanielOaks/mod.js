
function XMFile(mod) {
	function trimNulls(str) {
		return str.replace(/\x00+$/, '');
	}
	function getWord(str, pos) {
		return (str.charCodeAt(pos) << 8) + str.charCodeAt(pos+1)
	}

	this.data = mod;
	this.samples = [];
	this.positions = [];
	this.patternCount = 0;
	this.patterns = [];
	
}