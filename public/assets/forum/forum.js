Vue.component('forum', {
    template: '#forum',
    data: function () {
        return {
            currentView: 'forum-loading',
            posts: []
        }
    },
    mounted() {
        let self = this;

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
});

Vue.component('forum-loading', {
    template: '#forum_loading'
});

Vue.component('forum-content', {
    template: '#forum_content',
    props: ["posts"],
    data: function() {
        return {
            currentPost: {
                content: ""
            }
        }
    },
    methods: {
        showPost: function(post) {
            this.currentPost = post;
            $('#post_modal').modal('show');
        }
    }
});
