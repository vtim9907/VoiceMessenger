var edit = Vue.extend({
    template: "#edit",
    data: function () {
        return {
            age: 20,
            name: '',
            gender: 0,
            voice: '',
            record: false,
            playerMsg: 'Play'
        };
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
        },
        toRecordPage: function() {
            console.log('hihihi')
            bus.$emit('PageChange', "錄音");
        }
    },
    created() {
        let self = this;
        console.log("card created");
        $.ajax({
            method: 'POST',
            url: './getProfile',
            dataType: 'json',
            success: function (data) {
                self.name = data.name;
                self.age = data.age;
                self.gender = data.gender;
                self.voice = data.voice;
                if (data.voice != null) {
                    self.record = true;
                }
            },
            error: function () {
                console.log("Error occured");
            }
        })
    }
})

Vue.component('edit', edit);
