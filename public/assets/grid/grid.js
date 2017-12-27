var grid = new Vue({
    el: '#weatherGrid',
    data:{
      styleObject:{
        //backgroundColor: '#BBFFEE',
      },
    },
    mounted() {
        let self = this;
        $.ajax({
            method: 'GET' ,
            url: './weather',
            success: function(data) {//data=sktcode
                switch(data) {
               //   case :// "31","32","34","36","44":
                      //sunny
                 //       break;
                    default:
                }
                }
        })
    },
    methods:{
    
    
    }
})

var world = document.getElementById( 'sky' ),
    viewport = document.getElementById( 'weatherGrid' ),
    worldXAngle = 0,
    worldYAngle = 0,
    d = 0;

/*
window.addEventListener( 'mousemove', function( e ) {
    worldYAngle = -( .5 - ( e.clientX / window.innerWidth ) ) * 180;
    worldXAngle = ( .5 - ( e.clientY / window.innerHeight ) ) * 180;
    updateView();
} );
*/



function updateView() {
    world.style.transform = 'translateZ( ' + d + 'px ) \
    rotateX( ' + worldXAngle + 'deg) \
    rotateY( ' + worldYAngle + 'deg)';
    world.style.webkitTransform =
    world.style.MozTransform =
    world.style.oTransform = 
    world.style.transform = t;
}

 var objects = [],
     layers = [];
function generate() {
    objects = [];
    layers = [];
    if ( world.hasChildNodes() ) {
      while ( world.childNodes.length >= 1 ) {
        world.removeChild( world.firstChild );   
      } 
    }
    for( var j = 0; j < 7; j++ ) {
      objects.push( createCloud() );
    }
}
function createCloud() {
  var div = document.createElement( 'div'  );
  div.className = 'cloudBase';
  var x =window.innerWidth * 0.5 - ( Math.random() * window.innerWidth );
  var y =280 - ( Math.random() * 560 );
  var z =256 - ( Math.random() * 512 );
  var t = 'translateX( ' + x + 'px ) \
  translateY( ' + y + 'px ) \
  translateZ( ' + z + 'px )';
  div.style.transform = t;
  world.appendChild( div );
  for( var j = 0; j < 5 + Math.round( Math.random() * 10 ); j++ ) {
      var cloud = document.createElement( 'div' );
      cloud.className = 'cloudLayer';

      var x = 200 - ( Math.random() * 400 );
      var y = 200 - ( Math.random() * 400 );
      var z = 75  - ( Math.random() * 150 );
      var a = Math.random() * 360;
      var s = .15 + Math.random()/1000*window.innerWidth;
      x *= .2; y *= .2;
      cloud.data = { 
         x: x,
         y: y,
         z: z,
         a: a,
         s: s
      };
    
      var t = 'translateX( ' + x + 'px ) \
          translateY( ' + y + 'px ) \
          translateZ( ' + z + 'px ) \
          rotateZ( ' + a + 'deg ) \
          scale( ' + s + ' )';
          cloud.style.transform = t;
     
          div.appendChild( cloud );
          layers.push( cloud );
  }
 
  return div;
}

$(document).ready(function(){
    generate();
});














