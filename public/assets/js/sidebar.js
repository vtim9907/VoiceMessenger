 var sidebar=new Vue({
   el:"#sidebar",
   data:{
           
     styleObject:'',
   },
   methods:{
     response:function(){
       if(window.innerWidth>768){
         this.styleObject={
           position:'fixed',
           display:'flex',
           height:'100vh',
           width:'250px'
         }
       }else{
         this.styleObject=''
       }
     }
   } 
})

 var mainPage=new Vue({
   el:"#mainPage",
   data:{           
     styleObject:'',
   },
   methods:{
     response:function(){
       if(window.innerWidth>768){
         this.styleObject={
           margin:'0px 0px 0px 250px', 
         }
       }else{
         this.styleObject={
         
         }
       }
     }
   } 
})



function responsive (){
  sidebar.response();
  mainPage.response();
}

