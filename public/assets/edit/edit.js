var edit = Vue.extend({
    template: "#edit",
    data: function () {
        return {
            age: 20,
            name: '',
            gender: 0
        };
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
            },
            error: function () {
                console.log("Error occured");
            }
        })
    }
})

Vue.component('edit', edit);
