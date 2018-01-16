Vue.component('forum', {
    template: '#forum',
    data: function () {
        return {
            currentView: 'forum-loading',
            posts: []
        }
    },
    mounted() {
        this.load();
    },
    methods: {
        load: function() {
            let self = this;
            this.currentView = 'forum-loading';
            $.ajax({
                method: 'POST',
                url: './get_posts',
                dataType: 'json',
                data: {

                },
                success: function(posts) {
                    self.posts = posts
                    self.currentView = "forum-content";
                },

                error: function() {
                    console.log("Error occured");
                }
            })
        }
    }
});

Vue.component('forum-loading', {
    template: '#forum_loading'
});

Vue.component('forum-content', {
    template: '#forum_content',
    props: ["posts", "load"],
    data: function() {
        return {
            currentPost: {
                content: ""
            },
            content: "",
            preventSendTwice: false,
            recorded: false,
            recording: false,
            encoding: false,
            timer: 30,
            length: 0,
            recordRTC: {},
            stream: {},
            recorder: {},
            itvl: undefined,
            src: null,
            form: undefined
        }
    },
    methods: {
        showPost: function(post) {
            this.currentPost = post;
            $('#post_modal').modal('show');
        },
        sub: function() {
            if (this.preventSendTwice || this.content == "") {
                return;
            }
            this.preventSendTwice = true;
            let self = this;
            if (this.form == undefined)
                this.form = new FormData();
            this.form.append("content", this.content);
            $.ajax({
                method: 'POST',
                url: './new_post',
                dataType: 'json',
                data: self.form,
                cache: false,
                processData: false,
                contentType: false,
                success: function() {
                    $('#new_post').modal('hide');
                    self.preventSendTwice = false;
                    self.content = "";
                    self.form = undefined;
                    self.recorded = false;
                    self.load();
                },
                error: function() {
                    console.log("failed to send post");
                }
            })
        },
        newPost : function() {
            $('#new_post').modal('toggle');
        },
        recordOrStop: function() {
            this.recording = !this.recording;
            if (this.recording) {
                this.encode();
                this.recorded = false;
            } else {
                this.stop();
                clearInterval(this.itvl);
            }
        },
        /* record logic */
        start: function () {
            navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(this.handleSuccess);
        },
        handleSuccess: function (stream) {
            let self = this;
            this.itvl = setInterval(function () {
                self.length += 1;
                self.timer -= 1;
                if (self.length >= 30) {
                    clearInterval(self.itvl);
                    self.stop();
                    self.recording = false;
                }
            }, 1000);
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

            audioInput.connect(recorder);

            recorder.connect(context.destination);
            this.recorder = recorder;
        },
        mp3: function () {
            
            var fileReader = new FileReader();
            var a = this;
            fileReader.onload = function () {
                if (window.Worker) {
                    console.log('worker');
                    var encode_worker = new Worker('./js/encode_worker.js');
                    encode_worker.postMessage(fileReader.result);
                    encode_worker.onmessage = function (e) {
                        a.recorded = true;
                        a.encoding = false;
                        console.log('worker return ' + e.data);
                        var mp3 = document.getElementById('postRecord');
                        mp3.src = window.URL.createObjectURL(e.data);

                        a.form = new FormData();
                        a.form.append('mp3', e.data, 'test.mp3');
                        // var xhr = new XMLHttpRequest();
                        // xhr.open('POST', '/mp3', true);
                        // xhr.send(f);
                        // console.log('mp3 send');
                    }
                }

            }
            console.log(this.recordRTC);
            fileReader.readAsArrayBuffer(this.recordRTC.blob);
        },
        stop: function () {
            this.encoding = true;
            var recordRTC = this.recordRTC;
            var a = this;
            recordRTC.stopRecording(function () {
                a.stream.getTracks()[0].stop();

                // player = document.getElementById('player');
                // player.src = window.URL.createObjectURL(recordRTC.blob);
                a.mp3();//new solution
            });
            this.recorder.disconnect();
        },
        encode: function () {
            var self = this;
            this.timer = 30;
            this.length = 0;
            this.start();
            
        },
        play: function () {
            var audio = document.getElementById('postRecord');
            audio.play();
            var self = this;
            audio.onended = function () {
                self.message = 'audio end';
            };
        }
    }
});
