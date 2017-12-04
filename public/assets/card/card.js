var card = Vue.extend({
    template: '#card',
    data: function() {
        return {
            name:'王小明',
            currentView: 'card-loading'
        };
    },
    mounted() {
        let self = this;
        console.log("card mounted");
        $.ajax({
            method: 'POST',
            url: './card',
            dataType: 'json',
            success: function(data) {
                if (data.name && data.status == "success") {
                    self.name = data.name;
                } else {
                    // TODO: set not-found view
                    self.name = '沒有卡片，幫QQ';
                }
                self.currentView = 'card-content'
            }

            // TODO : Error handling
        })
    }
})

Vue.component('card', card);

Vue.component('card-loading', {
    template: '#card_loading'
})

Vue.component('card-content', {
    template: '#card_content',
    props: ["name"]
})