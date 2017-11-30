importScripts('lame.all.js');

onmessage = function(e){
	var wav = lamejs.WavHeader.readHeader(new DataView(e.data));
	var wavData = new Int16Array(e.data ,wav.dataOffset, wav.dataLen/2);
	var blob = encodeStereo(2, wav.sampleRate, wavData);
	postMessage(blob);
}


encodeStereo = function(channels, sampleRate, samples){
	var mp3encoder = new lamejs.Mp3Encoder(channels,sampleRate,128);
	var mp3Data = [];
	var left = new Int16Array(samples.length/2);
	var right = new Int16Array(samples.length/2);
	for(var i=0;i<samples.length/2;i++){
		left[i] = samples[2*i];
		right[i] = samples[2*i+1];
	}
	var sampleBlockSize = 1152;
	for(var i=0;i<samples.length/2;i+=sampleBlockSize){
		var leftChunk = left.subarray(i, i + sampleBlockSize);
		var rightChunk = right.subarray(i, i + sampleBlockSize);
		var mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
		if (mp3buf.length > 0) {
			mp3Data.push(mp3buf);
		}
	}
	var mp3Buf = mp3encoder.flush();

	if(mp3buf.length > 0){
		mp3Data.push(mp3Buf);
	}

	var blob = new Blob(mp3Data, {type:'audio/mp3'});
	return blob;
}