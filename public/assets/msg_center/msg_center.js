var msg_center = new Vue({
    el: '#msg_center',
    data: {
        message: 'msg_center test',
        call_show: false,
        get_call_show: false,
        toUserID: '',
        peer: undefined,
        call: undefined,
        connection: undefined,
        stream: undefined,
        calling_stat: false,
        talking_stat: false,
        my_name: ''
    },
    methods: {
        test: function(){
            alert(this.message);
        },
        start_call: function(){

        },
        get_call: function(){

        },
        accept_call: function(){
            this.connection.send({accept:true});
            this.message = "call request accept";
            /*
            var self = this;
            navigator.getUserMedia = navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||navigator.mozGetUserMedia ||navigator.msGetUserMedia;

                navigator.getUserMedia({
                    video: false,
                    audio: true
                },function(stream){
                    self.call.answer(stream);
                    
                    self.call.on('stream',function(stream){
                        var audio = document.getElementById('audio_play');
                        audio.src = window.URL.createObjectURL(stream);

                        self.message = "start voice talk";
                    });

                    self.call.on('close',function(){
                        self.message = "stop voice talk";
                    })
                    
                },function(error){
                    console.log(error);
                });
                */
        },
        reject_call: function(){
            var self = this;
            this.connection.send({accept:false});
            this.message = "call request reject";
            //self.call.close();
            this.get_call_show = false;
            self.connection.close();
            self.quit();
        },
        stop: function(){
            var self = this;
            self.call.close();
            //this.call_show = this.get_call_show = false;
            self.quit();
        },
        stop_calling: function(){//中止通話請求
            var self = this;
            self.connection.send({stop_calling:true});
            //self.call_show = self.get_call_show = false;
            self.quit();
            /*
            self.peer.disconnect();
            self.peer.on('disconnected',function(){
                self.peer.reconnect('aaa');
            });
            */
            self.connection.close();
        },
        quit: function(){
            var self = this;
            self.call_show = self.get_call_show = false;
            bus.$emit('enable');
        },
        hash: function(str){
            var h = 0;
            if(str.length == 0) return hash;
            for(i=0;i<str.length;i++){
                char = str.charCodeAt(i);
                h = ((h<<5)-h) + char;
                h = h & h;
            }
            return h;
        }
    },
    created: function(){
        var self = this;
        $.get('givename', function (userName) {
            self.my_name = userName;
            var id = self.hash(userName);
            self.peer = new Peer(id, { host: 'luffy.ee.ncku.edu.tw', port: 9907, secure: true, path: '/peer', debug: 3 });
            self.peer.on('open', function(id){
                console.log('peer id: ' + id);
            });
            self.peer.on('error',function(error){
                console.log(error);
                switch(error.type){
                    case 'peer-unavailable': 
                        self.message = self.toUserID + ' 目前不再線';
                        //self.call_show = self.get_call_show = false;
                        self.quit();
                    break;
                    default:
                    break;
                }
            });

            self.peer.on('connection',function(connection){//被呼叫者
                console.log(connection.peer);
                self.connection = connection;
                /*
                connection.on('open',function(){
                    self.get_call_show = true;
                    console.log('haha');
                });
                */
                connection.on('data',function(data){
                    self.calling_stat = true;
                    self.get_call_show = true;
                    if(data.stop_calling == true){//對方中止通話請求
                        self.message = self.my_name + "中止通話請求";
                        //self.call_show = self.get_call_show = false;
                        self.quit();
                        /*
                        self.peer.disconnect();
                        self.peer.on('disconnected',function(){
                            self.peer.reconnect('ccc');
                        });
                        */
                        self.connection.close();
                    }
                    self.message = data.name + " 想要與你通話";
                    //console.log(data);
                });

                connection.on('close',function(){
                    //self.call_show = self.get_call_show = false;
                    self.quit();
                });
            });
            
            self.peer.on('call',function(call){
                self.call = call;
                navigator.getUserMedia = navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||navigator.mozGetUserMedia ||navigator.msGetUserMedia;

                navigator.getUserMedia({
                    video: false,
                    audio: true
                },function(stream){
                    self.stream = stream;
                    self.call.answer(stream);
                    
                    self.call.on('stream',function(stream){
                        self.calling_stat = false;
                        self.talking_stat = true;
                        var audio = document.getElementById('audio_play');
                        audio.src = window.URL.createObjectURL(stream);

                        self.message = "開始通話";
                    });

                    self.call.on('close',function(){
                        self.talking_stat = false;
                        self.message = "停止通話";
                        self.stream.getTracks()[0].stop();
                        //self.call_show = self.get_call_show = false;
                        self.quit();
                    })
                    
                },function(error){
                    console.log(error);
                });
            });
            
        });
    },
    destroyed: function(){
        this.peer.disconnect();
        this.peer.destroy();
    }
});

msg_center.$on('test', function(toUserID){//呼叫者
    bus.$emit('disable');
    this.calling_stat = true;//
    var self = this;
    this.toUserID = toUserID;
    this.call_show = true;

    this.message = '正在撥號給 ' + this.toUserID;

    var peer_id = this.hash(toUserID)
    this.connection = this.peer.connect(peer_id);

    this.connection.on('open',function(){
        self.connection.send({id:self.peer.id,name:self.my_name});
    });

    this.connection.on('close',function(){
        //self.call_show = self.get_call_show = false;
        self.quit();
    });

    this.connection.on('data',function(data){
        self.calling_stat = true;//
        if(data.accept == true){//對方接受
            self.message = self.toUserID + "接受通話請求";

            navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||navigator.mozGetUserMedia ||navigator.msGetUserMedia;

            navigator.getUserMedia({
                video: false,
                audio: true
            },function(stream){
                self.stream = stream;
                self.call = self.peer.call(peer_id, stream);
                self.call.on('stream',function(stream){
                    self.calling_stat = false;
                    self.talking_stat = true;
                    self.message = "開始通話";
                    var audio = document.getElementById('audio_play');
                    audio.src = window.URL.createObjectURL(stream);
                });

                self.call.on('close',function(){
                    self.talking_stat = false;
                    self.message = "停止通話";
                    self.stream.getTracks()[0].stop();
                    //self.call_show = self.get_call_show = false;
                    self.quit();
                });
            },function(error){
                console.log(error);
            });

        }else{//對方拒絕
            self.message = self.toUserID + " 拒絕與你通話";
            //self.call_show = self.get_call_show = false;
            self.quit();
        }
    });
    /*
    navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||navigator.mozGetUserMedia ||navigator.msGetUserMedia;

            navigator.getUserMedia({
                video: false,
                audio: true
            },function(stream){
                self.call = self.peer.call(self.toUserID, stream);
                self.call.on('stream',function(stream){
                    self.message = "start voice talk";
                });

                self.call.on('close',function(){
                    self.message = "stop voice talk";
                });
            },function(error){
                console.log(error);
            });
    */
});