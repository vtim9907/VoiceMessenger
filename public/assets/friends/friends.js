var friends=Vue.extend({
  template : "#friends",
      data : function(){
        return {
          lists:[{nickname:'nickname1',photoPath:'https://goo.gl/eKdiuU'},
                 {nickname:'nickname2',photoPath:'https://goo.gl/eKdiuU'},
                 {nickname:'nickname3',photoPath:'https://goo.gl/eKdiuU'},
                 {nickname:'nickname4',photoPath:'https://goo.gl/eKdiuU'},
                 {nickname:'nickname5',photoPath:'https://goo.gl/eKdiuU'}]
        } ;
      },
      mounted() {
        let self = this;
        console.log("friends mounted");
        $.ajax({
            method: 'POST',
            url: './getFriend',
            dataType: 'json',
            success: function(data) {
              self.list=data.friendArray;
            },
            error: function() {
                console.log("Error occured,friends.js");
            }
        })
    }  
      
      }
})

Vue.component('friends',friends);
