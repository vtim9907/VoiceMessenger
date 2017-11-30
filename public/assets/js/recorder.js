var record = Vue.extend({
	template: '#record',
	data: function(){
		return {
			audioList: ['player','mp3Stereo'],
			recordRTC: {},
			stream: {},
			recorder: {}
		};
	},
	methods: {
		start: function(){
			navigator.mediaDevices.getUserMedia({audio:true, video:false}).then(this.handleSuccess);
		},
		handleSuccess: function(stream){
			var recordRTC = RecordRTC(stream, {
		  		type: 'audio',
		  		recorderType: RecordRTC.StereoAudioRecorder,
		  		disableLogs: true
		  	});
		  	recordRTC.startRecording();
		  	this.recordRTC = recordRTC;
		  	this.stream = stream;


		  	var context = new AudioContext();
            var audioInput = context.createMediaStreamSource(stream);
            var bufferSize = 0; // let implementation decide

            var recorder = context.createScriptProcessor(bufferSize, 1, 1);

            recorder.onaudioprocess = this.onAudio;

            audioInput.connect(recorder);

            recorder.connect(context.destination);
            this.recorder = recorder;
		},
		onAudio: function(e){
			var left = e.inputBuffer.getChannelData(0);
        	this.drawBuffer(left);
		},
		drawBuffer: function(data) {
			console.log(data);
	        var canvas = document.getElementById("canvas"),
	            width = canvas.width,
	            height = canvas.height,
	            context = canvas.getContext('2d');

	        context.clearRect (0, 0, width, height);
	        var step = Math.ceil(data.length / width);
	        var amp = height / 2;
	        for (var i = 0; i < width; i++) {
	            var min = 1.0;
	            var max = -1.0;
	            for (var j = 0; j < step; j++) {
	                var datum = data[(i * step) + j];
	                if (datum < min)
	                    min = datum;
	                if (datum > max)
	                    max = datum;
	            }
	            context.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
	        }
	    },
	    mp3: function(){
	    	var fileReader = new FileReader();
		  	var a = this;
		  	fileReader.onload = function(){
		  		if(window.Worker){
		  			console.log('worker');
		  			var encode_worker = new Worker('./js/encode_worker.js');
		  			encode_worker.postMessage(fileReader.result);
		  			encode_worker.onmessage = function(e){
		  				console.log('worker return ' + e.data);
		  				var mp3 = document.getElementById('mp3Stereo');
		  				mp3.src = window.URL.createObjectURL(e.data);
		  			}
		  		}
		  		
		  	}
		  	fileReader.readAsArrayBuffer(this.recordRTC.blob);
	    },
	    stop: function(){
		  	var recordRTC = this.recordRTC;
		  	var a = this;
		  	recordRTC.stopRecording(function(){
		  		a.stream.getTracks()[0].stop();

		  		player = document.getElementById('player');
		  		player.src = window.URL.createObjectURL(recordRTC.blob);
		  	});
		  	this.recorder.disconnect();
		},
		send: function(){
			var f = new FormData();
			f.append('wav', window.recordRTC.blob, 'test.wav');
			var xhr = new XMLHttpRequest();
			xhr.open('POST','/wav',true);
			xhr.send(f);
		},
		sendMp3: function(){
			var f = new FormData();
			f.append('mp3',window.mp3Blob,'test.mp3');
			var xhr = new XMLHttpRequest();
			xhr.open('POST','/mp3',true);
			xhr.send(f);
		}
	}
});