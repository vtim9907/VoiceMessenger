const express =require('express')
const app = express()
const port =30000

app.use(express.static(__dirname+'/pub'));

   
  
app.listen(port,()=>{
    console.log(`Listening on port ${port}`)
    });


