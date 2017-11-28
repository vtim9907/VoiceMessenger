
var chat = Vue.extend({
    template:'#chat',
    data: function(){
        return {
            msg:'',
            userList:[],
            content:[],
            user:'',
            inter:{}
        }
    },
    methods: {
        send: function(){
            this.msg = $("[name='test']").val();
            console.log(this.msg);
            $.get('/chat',{msg: this.msg, toUser: this.user});
        },
        selectReceiver: function(user){
            this.user = user;
        },
        getMsg: function(){
            var self = this;
            $.get('chatMsg',{to:self.user},function(data){
                self.content = data;
            });
        }
    },
    activated: function(){
        var self = this;
        $.get('userList',function(data){
            console.log(data);
            self.userList = data;

            self.user = self.userList[0];
        });
        //this.user = this.userList[0];
        /*
        $.get('chatMsg',function(data){
            console.log(data);
            self.content = data;
        });
        */
        this.inter = setInterval(this.getMsg,500);
    },
    deactivated: function(){
        clearInterval(this.inter);
    }
});