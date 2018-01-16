const CARD_SUCCESS = 0;
const CARD_NOT_FOUND = 1;
const CARD_IMCOMPLETED_DATA = 2;

var card = Vue.extend({
    template: '#card',
    data: function() {
        return {
            name:'王小明',
            photo: "",
            voice: "#",
            gender: "",
            age: "",
            profileDone: false,
            currentView: 'card-loading'
        };
    },
    mounted() {
        let self = this;
        console.log("card mounted");
        let loading = new Promise(function(resolve, rejected) {
            setTimeout(resolve, 0);
        })
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
                        switch(data.gender) {
                            case 0:
                                self.gender = "保密";
                                break;
                            case 1:
                                self.gender = "男";
                                break;
                            case 2:
                                self.gender = "女";
                                break;
                            default:
                                self.gender = "";
                        }
                        self.age = data.age;
                        self.profileDone = true;
                        break;
                    case CARD_NOT_FOUND:
                        // TODO: not found page
                        self.name = '沒有卡片\n幫QQ';
                        self.profileDone = true;
                        break;
                    case CARD_IMCOMPLETED_DATA:
                        // TODO: imconpleted data page
                        self.name = "還沒有完成資料，無法參加抽卡喔~!"
                        self.profileDone = false;
                        break;
                    default:
                }
                loading.then(function() {
                    //$('#card_container').css('backgroundColor', 'white');
                    self.currentView = 'card-content';
                })
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
    props: ["name", "photo", "voice", "gender", "age","profileDone"],
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
});
