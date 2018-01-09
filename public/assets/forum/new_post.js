var new_post = new Vue({
    el: "#new_post",
    data: {
        content: "",
        preventSendTwice: false
    },
    methods: {
        sub: function() {
            if (this.preventSendTwice || this.content == "") {
                return;
            }
            this.preventSendTwice = true;
            let self = this;
            $.ajax({
                method: 'POST',
                url: './new_post',
                dataType: 'json',
                data: {
                    content: self.content
                },
                success: function() {
                    $(self.$el).modal('hide');
                    self.preventSendTwice = false;
                    self.content = "";
                },
                error: function() {
                    console.log("failed to send post");
                }
            })
        }
    }
});
