var myName;
var chat = Vue.extend({
    template: '#chat',
    data: function () {
        return {
            msg: '',
            userList: [],
            content: [],
            myName: '',
            user: '',
            inter: {},
            socket: undefined,
            not_found: true
        }
    },
    methods: {
        send: function (e) {
            this.msg = $("[name='test']").val();
            if ((e.altKey || e.shiftKey) && e.keyCode == 13) {
                $("[name='test']").val(this.msg + '\n');
            } else if (!this.msg.replace(/[\s|\n]/g, '').length) {
                // string only contained whitespace or newline, do nothing
            } else {
                this.msg = $("[name='test']").val().trim();
                if (this.user) {
                    this.socket.emit('chat', { msg: this.msg, toUser: this.user });
                    console.log("user: " + this.user);
                } else {
                    console.log('select a friend');
                }
                $("[name='test']").val("");
            }
            this.$nextTick(function () {
                setTimeout(function() {$("#chatList").animate({ scrollTop: $('#chatList').get(0).scrollHeight }, 0);},200);
            });
        },
        selectReceiver: function (user) {
            this.user = user;
            this.socket.emit('getChatContent', { toUser: this.user });
            this.$nextTick(function () {
                setTimeout(function() {$("#chatList").animate({ scrollTop: $('#chatList').get(0).scrollHeight }, 0);},200);
            });
        },
        getMsg: function () {
            var self = this;
            $.get('chatMsg', { to: self.user }, function (data) {
                self.content = data.content;
            });
        }
    },
    created: function () {
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
        if (!this.socket) {
            this.socket = io.connect();
        }
        $.post('getFriend', function (data) {
            if (data === "no") {
                self.not_found = true;
            } else {
                self.not_found = false;
                var nickname = [];
                var photoPath = [];
                data.forEach(function (item) {
                    nickname.push(item.nickname);
                    photoPath.push(item.photoPath);
                });
                self.userList = nickname;
                self.user = self.userList[0];
                if (self.user) {
                    self.socket.emit('getChatContent', { toUser: self.user });
                }
            }
        });
        $.get('givename', function (userName) {
            myName = userName;
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
        this.socket.on('chatContent', function (data) {
            self.myName = myName;
            self.content = data.content;
        });
    },
    deactivated: function () {
        //clearInterval(this.inter);
    },
    destroyed: function () {
        console.log('destroyed');
        this.socket.disconnect();
    }
});

Vue.component('chat', chat);