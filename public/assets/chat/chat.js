var chat = Vue.extend({
    template:'#chat',
    data: function(){
        return {
            msg:'',
            userList:[],
            content:[],
            user:'',
            inter:{},
            socket:undefined
        }
    },
    methods: {
        send: function(){
            this.msg = $("[name='test']").val();
            console.log(this.msg);
            //$.get('/chat',{msg: this.msg, toUser: this.user});
            if(this.user){
                this.socket.emit('chat',{msg: this.msg, toUser: this.user});
                console.log("user: " + this.user);
            }else{
                console.log('select a friend');
            }
            $("[name='test']").val("");
            $("#chatList").animate({scrollTop: $('#chatList').prop("scrollHeight")}, 500);
        },
        selectReceiver: function(user){
            this.user = user;
            this.socket.emit('getChatContent',{toUser: this.user});
        },
        getMsg: function(){
            var self = this;
            $.get('chatMsg',{to:self.user},function(data){
                self.content = data;
            });
        }
    },
    created: function(){
        var self = this;
        /*
        $.get('userList',function(data){
            console.log(data);
            self.userList = data;

            self.user = self.userList[0];
            if(self.user){
                self.socket.emit('getChatContent',{toUser: self.user});
            }
            
        });
        */
        if(!this.socket){
            this.socket = io.connect();
        }
        $.post('getFriend',function(data){
            console.log(data);
            var nickname = [];
            var photoPath = [];
            data.forEach(function(item){
                nickname.push(item.nickname);
                photoPath.push(item.photoPath);
            });

            self.userList = nickname;

            self.user = self.userList[0];
            
            if(self.user){
                self.socket.emit('getChatContent',{toUser: self.user});
            }
            
        });
        //this.user = this.userList[0];
        /*
        $.get('chatMsg',function(data){
            console.log(data);
            self.content = data;
        });
        */
        //this.inter = setInterval(this.getMsg,500);
        
        
        /*
        this.socket.on('message',function(data){
            console.log(data.message);
        });
        */
        this.socket.on('chatContent',function(data){
            self.content = data.content;
        });

        
    },
    deactivated: function(){
        //clearInterval(this.inter);
    },
    destroyed: function(){
        console.log('destroyed');
        this.socket.disconnect();
    }
});

Vue.component('chat', chat);
