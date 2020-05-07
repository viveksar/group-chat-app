//this is the main file for the development of the modified-chatapp

let express=require('express')

let app=express()

require('dotenv').config({path:'./config/dev.env'})

//to connect this file to the database
require('./db/mongoose')
let PORT=process.env.PORT
let User=require('./models/user')
let userRouter=require('./routers/userr')
let roomRouter=require('./routers/roomm')

//to parse the incomming json
app.use(express.json())

app.use(userRouter)
app.use(roomRouter)


app.listen(PORT,()=>{
    console.log('Server has started on port '+PORT)
})