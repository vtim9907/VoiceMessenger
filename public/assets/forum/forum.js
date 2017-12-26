Vue.component('forum', {
    template: '#forum',
    data: function () {
        return {
            currentView: 'forum-content'
        }
    },
    methods: {

    }
});

Vue.component('forum-loading', {
    template: '#forum_loading'
});

Vue.component('forum-content', {
    template: '#forum_content'
});
