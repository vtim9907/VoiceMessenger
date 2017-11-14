window.onload = function(){


	var bus = new Vue();//用於事件傳遞

	Vue.component('head_bar',{
		template: '#head_bar',
		data: function(){
			return {
				buttonList : ['註冊','抽卡','好友','聊天','錄音'],
				viewList : ['reg','card','friend','chat','record']
			};
		},
		methods: {
			hideLeft : function(){
				bus.$emit('test');
			},
			changeView: function(msg){
				bus.$emit('changeView',msg);
			}
		}
	});

	var left_page = Vue.extend({
		template: '#left_page',
		data: function(){
			return {
				buttonList : ['註冊','抽卡','好友','聊天','錄音'],
				viewList : ['reg','card','friend','chat','record'],
				seen: true,
				introList : ['暱稱','興趣','其他']
			};
		},
		methods: {
			hide : function(){
				this.seen = !this.seen;
			},
			changeView: function(msg){
				bus.$emit('changeView',msg);
			}
		},
		created: function(){
			var a = this;
			bus.$on('test',function(){
				a.hide();
			})
		}
	});

	var reg = Vue.extend({
		template: '<h1>註冊</h1>'
	});

	var card = Vue.extend({
		template: '<h1>抽卡</h1>'
	});

	var friend = Vue.extend({
		template: '<h1>好友</h1>'
	});

	var chat = Vue.extend({
		template: '<h1>聊天</h1>'
	});

	var record = Vue.extend({
		template: '#record',
		data: function(){
			return {
				audioList: ['player','mp3Stereo'],
				buttonList: ['start','stop','play','send','mp3','sendMp3']
			};
		},
		methods: {
		  handleSuccess: function(stream) {
		  	var recordRTC = RecordRTC(stream, {
		  		type: 'audio',
		  		recorderType: RecordRTC.StereoAudioRecorder,
		  		disableLogs: true
		  	});
		  	recordRTC.startRecording();
		  	window.recordRTC = recordRTC;
		  	window.stream = stream;


		  	var context = new AudioContext();
            var audioInput = context.createMediaStreamSource(stream);
            var bufferSize = 0; // let implementation decide

            var recorder = context.createScriptProcessor(bufferSize, 1, 1);

            recorder.onaudioprocess = this.onAudio;

            audioInput.connect(recorder);

            recorder.connect(context.destination);
            window.recorder = recorder;
		  },
		  onAudio: function(e){
		  	var left = e.inputBuffer.getChannelData(0);
        	this.drawBuffer(left);
		  },
		  start: function(){
		  	navigator.mediaDevices.getUserMedia({audio:true, video:false}).then(this.handleSuccess);
		  },
		  stop: function(){
		  	var recordRTC = window.recordRTC;
		  	recordRTC.stopRecording(function(){
		  		window.stream.getTracks()[0].stop();

		  		player = document.getElementById('player');
		  		player.src = window.URL.createObjectURL(recordRTC.blob);
		  	});
		  	window.recorder.disconnect();
		  },
		  download: function() {
			
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
		  },
		  mp3: function(){
		  	var fileReader = new FileReader();
		  	var a = this;
		  	fileReader.onload = function(){
		  		var wav = lamejs.WavHeader.readHeader(new DataView(fileReader.result));
		  		console.log(wav);
		  		console.log(fileReader.result);
		  		var samples = new Int16Array(fileReader.result,wav.dataOffset, wav.dataLen/2);
		  		var left = new Int16Array(samples.length/2);
		  		for(var i=0;i<left.length;i++){//聲道分離
		  			left[i] = samples[2*i];
		  		}
		  		//encodeMono(1, wav.sampleRate, left);
		  		a.encodeStereo(2, wav.sampleRate, samples);
		  		/*
		  		var streamArray = new Int16Array(fileReader.result);
		  		var buffer = [];
		  		var mp3Encoder = new lamejs.Mp3Encoder(1, 44100, 128);

		  		var mp3Data = mp3Encoder.encodeBuffer(streamArray);
		  		buffer.push(mp3Data);
		  		mp3Data = mp3Encoder.flush();
		  		buffer.push(mp3Data);
		  		var blob = new Blob(buffer, {type:'audio/mp3'});

		  		var mp3p = document.getElementById('mp3');
		  		mp3p.src = window.URL.createObjectURL(blob);
		  		*/
		  	}
		  	fileReader.readAsArrayBuffer(window.recordRTC.blob);
		  },
		  encodeMono: function(channels, sampleRate, samples) {
	        var buffer = [];
	        var mp3enc = new lamejs.Mp3Encoder(channels, sampleRate, 128);
	        var remaining = samples.length;
	        var maxSamples = 1152;
	        for (var i = 0; remaining >= maxSamples; i += maxSamples) {
	            var mono = samples.subarray(i, i + maxSamples);
	            var mp3buf = mp3enc.encodeBuffer(mono);
	            if (mp3buf.length > 0) {
	                buffer.push(new Int8Array(mp3buf));
	            }
	            remaining -= maxSamples;
	        }
	        var d = mp3enc.flush();
	        if(d.length > 0){
	            buffer.push(new Int8Array(d));
	        }
	        console.log('done encoding, size=', buffer.length);
	        var blob = new Blob(buffer, {type: 'audio/mp3'});
	        var bUrl = window.URL.createObjectURL(blob);
	        console.log('Blob created, URL:', bUrl);
	        
	        var mp3 = document.getElementById('mp3');
	        mp3.src = bUrl;
	    },
	    encodeStereo: function(channels, sampleRate, samples){
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
	    	window.mp3Blob = blob;

	    	var mp3Stereo = document.getElementById('mp3Stereo');
	    	mp3Stereo.src = window.URL.createObjectURL(blob);
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
	    }
	  	}
	});

	var right_page = Vue.extend({
		template: '#right_page',
		data: function(){
			return {
				currentView: 'record'
			}
		},
		components: {
			reg: reg,
			card: card,
			friend: friend,
			chat: chat,
			record: record
		},
		created: function(){
			var a = this;
			bus.$on('changeView',function(msg){
				a.currentView = msg;
				console.log(msg);
			})
		}
	});

	Vue.component('main_page',{
		template: '#main_page',
		components: {
			left_page:left_page,
			right_page:right_page
		}
	});


	var app = new Vue({
		el: '#app',
		data: {
			classObject : {
				'container-fluid' : true
			},
			showLeft:true
		},
		methods: {
			hideLeft: function(){
				this.showLeft = !this.showLeft;
			}
		}
	});
}