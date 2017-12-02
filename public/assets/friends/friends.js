var friends=Vue.extend({
  template : "#friends",
      data : function(){
        return {
          lists:[{name:'aaa',imgurl:'https://goo.gl/eKdiuU'},
                 {name:'bbb',imgurl:'https://goo.gl/eKdiuU'},
                 {name:'ccc',imgurl:'https://goo.gl/eKdiuU'},
                 {name:'ddd',imgurl:'https://goo.gl/eKdiuU'},
                 {name:'eee',imgurl:'https://goo.gl/eKdiuU'}]
        } ;
      }
})

Vue.component('friends',friends);
