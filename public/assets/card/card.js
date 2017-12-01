  var card = Vue.extend({
    template: '#card',
        data: function(){
              return {               
                name:'王小明'
              };
        } 
  })	

  Vue.component('card', card);
