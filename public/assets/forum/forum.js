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
            preventSendTwice: false
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
            $.ajax({
                method: 'POST',
                url: './new_post',
                dataType: 'json',
                data: {
                    content: self.content
                },
                success: function() {
                    $('#new_post').modal('hide');
                    self.preventSendTwice = false;
                    self.content = "";
                    self.load();
                },
                error: function() {
                    console.log("failed to send post");
                }
            })
        },
        newPost : function() {
            $('#new_post').modal('toggle');
        }
    }
});
