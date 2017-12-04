const CARD_SUCCESS = 0;
const CARD_NOT_FOUND = 1;
const CARD_IMCOMPLETED_DATA = 2;

var card = Vue.extend({
    template: '#card',
    data: function() {
        return {
            name:'王小明',
            photo: "https://goo.gl/eKdiuU",
            voice: "#",
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
                switch(data.status) {
                    case CARD_SUCCESS:
                        self.name = data.name;
                        self.photo = data.photo;
                        self.voice = data.voice;
                        break;
                    case CARD_NOT_FOUND:
                        // TODO: not found page
                        self.name = '沒有卡片，幫QQ';
                        break;
                    case CARD_IMCOMPLETED_DATA:
                        // TODO: imconpleted data page
                        self.name = "還沒完成資料喔~!"
                        break;
                    default:
                }
                self.currentView = 'card-content'
            },

            error: function() {
                console.log("Error occured");
                // TODO: Navigate to a error page.
            }
        })
    }
})

Vue.component('card', card);

Vue.component('card-loading', {
    template: '#card_loading'
})

Vue.component('card-content', {
    template: '#card_content',
    props: ["name", "photo", "voice"],
    data: function() {
        return {
            playerMsg: "Play"
        }
    },
    methods: {
        playOrStop: function() {
            let voice = document.getElementById("voice");
            if (this.playerMsg == "Play") {
                this.playerMsg = "Stop";
                voice.play();
            } else {
                this.playerMsg = "Play";
                voice.pause();
                voice.currentTime = 0;
            }
        },
        handleEnded: function() {
            this.playerMsg = "Play";
        }
    }
})