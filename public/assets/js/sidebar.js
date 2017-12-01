var bus = new Vue();//用於事件傳遞)
var temp=''
var sidebar=new Vue({
   el:"#sidebar",
   data:{
     styleObject:{
       position:'fixed',
       display:'flex',
       height:'100vh',
       width:'250px'   
     },
     List:["好友","聊天","抽卡","錄音"]

   },
   methods:{
     response:function(){
       if(window.innerWidth>768){
         this.styleObject.position='fixed'
         this.styleObject.display='flex'
         this.styleObject.height='100vh'
         this.styleObject.width='250px'
         
       }else{
         this.styleObject=''
       }
     },
    show:function(i){
       console.log(i);  
       bus.$emit('PageChange',i);
     }
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

