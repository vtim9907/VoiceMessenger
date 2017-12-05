var friends = Vue.extend({
  template: "#friends",
  data: function () {
    return {
      not_found: false,
      lists: []
      // lists: [{ nickname: 'nickname1', photoPath: 'https://goo.gl/eKdiuU' },
      // { nickname: 'nickname2', photoPath: 'https://goo.gl/eKdiuU' },
      // { nickname: 'nickname3', photoPath: 'https://goo.gl/eKdiuU' },
      // { nickname: 'nickname4', photoPath: 'https://goo.gl/eKdiuU' },
      // { nickname: 'nickname5', photoPath: 'https://goo.gl/eKdiuU' }]
    };
  },
  mounted() {
    let self = this;
    console.log("friends mounted");
    $.ajax({
      method: 'POST',
      url: './getFriend',
      success: function (data) {
        if (data === "no") {
          self.not_found = true;
          alert("HI");
        } else {
          alert("OK");
          self.not_found = false;
          self.lists = data;
        }
      },
      error: function () {
        console.log("Error occured,friends.js");
      }
    })
  }
});

Vue.component('friends', friends);
