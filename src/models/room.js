//here we will describe the router for the room

let mongoose=require('mongoose')
let bcrypt=require('bcrypt')



let roomschema=new mongoose.Schema({
roomname:{
    required:true,
    unique:true,
    type:String,
    trim:true

},
password:{
    required:true,
    type:String,
    trim:true,
    validate(password){
        if(password.includes('password')||password.includes('PASSWORD')){
            throw new Error('change your password')
        }
        else if(password.length<6){
            throw new Error('increase the length of your password')
        }
    }
},
roomid:{
    unique:true,
    type:Number,
    required:true
  
},
owner:{
    required:true,
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
},
usersjoined:[{
   userjoined:{
       required:true,
       type:String,
       //ref='User'
   }

   } 
]


})

//to check weather the room is present or not
roomschema.statics.findTheRoom=async(roomname,password)=>{
  
//to check weather the room of this name is present or not
let room= await Room.findOne({roomname:roomname})

if(!room){
    throw new Error('Room with this name does not exist')
}

//to verify the password
let isValid= await bcrypt.compare(password,room.password)
if(!isValid){
    throw new Error("room's password is wrong")
}

return room
}



//to hash the password before 
roomschema.pre('save',async function(next){
let room=this
if(room.isModified('password')){
    room.password= await bcrypt.hash(room.password,8)
}
next()

})

roomschema.methods.joinedroombyuser=async function(){
    let room=this
    let roomObject=room.toObject()
    delete roomObject._id
    delete roomObject.password
    delete roomObject.owner
    delete roomObject.usersjoined
    delete roomObject.__v
    return roomObject
}



let Room=mongoose.model('Room',roomschema)


module.exports=Room