//this file is to connect to the database
let mongoose=require('mongoose')

let mongoURL='mongodb://127.0.0.1:27017/modified-chatApp'

mongoose.connect(mongoURL,{
    useCreateIndex:true,
    useNewUrlParser:true
})


