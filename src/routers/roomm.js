//in this file we will put the routes for the room.js file
let express=require('express')
let mongoose=require('mongoose')

let authentication=require('../middelware/authentication')
let User=require('../models/user')
let router= new express.Router()
let Room=require('../models/room')

router.post('/createroom',authentication,async (req,res)=>{
    let room=new Room({
        roomname:req.body.roomname,
        roomid:req.body.roomid,
        password:req.body.password,
        owner:req.user._id
    })
  
    //we have to store the room in the user that we have joined this room
    let roomjoined=room._id
    let user=req.user
    user.roomsjoined=user.roomsjoined.concat({
        roomjoined:roomjoined
    })
await user.save()

//we also have to join the room which we have created
let userjoined=req.user._id
room.usersjoined=room.usersjoined.concat({
    userjoined:userjoined
})
await room.save()
    res.send(room)


})

//to get the room created by me
router.get('/roomscreatedbyme',authentication,async(req,res)=>{
   
   await req.user.populate({path:'Room'}).execPopulate()
 
   res.send(req.user.Room)

})

//here is the code to join the room
router.post('/joinroom',authentication,async(req,res)=>{
//to check weather the room exist or not
let room=Room.findTheRoom(req.body.roomname,req.body.password)
room.then(async(room)=>{
    
    let userjoinedd=req.user._id  

    //to check if the user has already joined the room or not
    let isValid=room.usersjoined.every((user)=>{
        return user.userjoined!=userjoinedd
    })


    if(isValid===false){
        return res.status(400).send({
            error:'user has already joined this room'
        })
    }
//to add the user id into userjoined array
room.usersjoined=room.usersjoined.concat({
    userjoined:userjoinedd
})

//to save the record in the user database
let roomjoined=room._id
let user=req.user
user.roomsjoined=user.roomsjoined.concat({
    roomjoined:roomjoined
})
await user.save()

//to save the room
await  room.save()
res.send(room)
}).catch((e)=>{
    res.status(400).send(e) 
})
})


//to provide the list of the user which has joined the given room
router.post('/roommember',authentication,async(req,res)=>{

let room=Room.findTheRoom(req.body.roomname,req.body.password)
let users=[]

room.then(async(room)=>{

    for(i=0;i<room.usersjoined.length;i++){
        let userid=room.usersjoined[i].userjoined
      //  console.log(userid)
        let userr=await User.findById(userid)
         userr.memberProfile().then((user)=>{
           users.push(user)
       })
     
    }
    let lastuserid=room.usersjoined[room.usersjoined.length-1].userjoined
    let lastuser=await User.findById(lastuserid)
    lastuser.memberProfile().then((lastuser)=>{
        users.push(lastuser)
    })  
    res.send(users)

 
}).catch((e)=>{
    res.status(400).send(e)
})
})

//to delete the room
router.delete('/deleteRoom',authentication,async(req,res)=>{
    
    try{
        let deletedRoom= await Room.findOneAndDelete({
            roomname:req.body.roomname,
            owner:req.user._id,
            roomid:req.body.roomid
        })
        console.log(deletedRoom)
        //if there is room present
        if(!deletedRoom){
            throw new Error('this room is not created by this user')
        }
        
        res.send(deletedRoom)
    }
    catch(e){
        res.status(400).send(e)
    }

})

//to send the router to other file
module.exports=router