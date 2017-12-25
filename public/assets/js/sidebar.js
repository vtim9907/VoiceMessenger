var bus = new Vue();//用於事件傳遞)
var temp=''
var sidebar=new Vue({
   el:"#sidebar",
   data:{
     styleObject:{
       position:'fixed',
       display:'flex',
       height:'100vh',
       width:'250px',
       padding:'0',
     },

     styleimg:{
       width:'10rem',
       display:'',
     },
     List:["編輯資料","好友","聊天","抽卡","錄音"],
     photo:'https://goo.gl/eKdiuU'


   },
   methods:{
     response:function(){
       if(window.innerWidth>768){
         this.styleObject.position='fixed'
         this.styleObject.display='flex'
         this.styleObject.height='100vh'
         this.styleObject.width='250px'
         this.styleObject.padding='0'
       
         this.styleimg.display='flex'  
       }else{
         this.styleObject.position=''
         this.styleObject.display=''
         this.styleObject.height=''
         this.styleObject.width=''
         this.styleObject.padding=''
         
         this.styleimg.display='none'  
       }
     },
    show:function(i){ 
       $('#navbarNav').collapse('hide');        
       bus.$emit('PageChange',i);
      
     },
     updatePhoto: function() {
         let self = this;
         $.ajax({
              method: 'GET',
              url: './getPhoto',
              success: function(path) {
                  if (path !== "") {
                      self.photo = path;
                  }
              },
         });
     }
   },
   created() {
       this.updatePhoto();
        //    let self = this;
        //    bus.$on('updatePhoto', function() {
        //        self.updatePhoto();
        //    });
    }
})
var mainPage=new Vue({
   el:"#mainPage",
   data:{ 
     Pageshown:"",
     styleObject:{  
       margin:'',
     }

   },
   methods:{
     response:function(){
       if(window.innerWidth>768){
         this.styleObject.margin='0px 0px 0px 250px'
       }else{
         this.styleObject=''
       }
     }
   },
   created: function(){
    var a = this;
      bus.$on('PageChange',function(i){
        a.Pageshown=i;
      } )
   }
})

window.addEventListener("load",()=>{
 sidebar.response();
 mainPage.response();
})
function responsive (){
  sidebar.response();
  mainPage.response();
}

