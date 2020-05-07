//here we will set routers for the user model 
let express=require('express')
let User=require('../models/user')
let Room=require('../models/room')
let authentication=require('../middelware/authentication')

//to set router for the User model
let router=new express.Router()

//to create a new user
router.post('/createuser',async(req,res)=>{
    let user=new User(req.body)
    await user.save()
console.log(user)
let token=await user.getauthtoken()

user.userProfile().then((data)=>{
    res.send({
        user:data,
        token:token
    })
})
})

//to login the given user
router.post('/login',async (req,res)=>{
    
   
        let user=await User.findByCredentials(req.body.email,req.body.password)
      
       let token=await user.getauthtoken()

       user.userProfile().then((data)=>{
           res.send({
               user:data,
               token:token
           })
       }).catch((e)=>{
           res.status(400).send(e)
       })
        
})

//to update the user
router.patch('/updateuser',authentication,async(req,res)=>{
//here we will write code to update the user  
let updateAllowed=['name','email','password','username']

//to know what are the update keys 
let updates=Object.keys(req.body)

let isValid=updates.every((update)=> updateAllowed.includes(update))
if(!isValid){
    throw new Error({
        error:'enter valid updates'
    })
}

try{
    let user=req.user
    updates.forEach((update)=> user[update]=req.body[update])
    await user.save()
    
    
let x=user.userProfile()
x.then((data)=>{
    res.send({
        user:data
    })
})

}catch(e){
    res.status(400).send(e)
}
})

//to logout the user from the given device
router.post('/logout',authentication, async(req,res)=>{
    try{
//to put the array of tokens with all tokens expect this token
req.user.tokens=  req.user.tokens.filter((token)=> token.token!==req.token)

//to save the user
await req.user.save()


    res.status(200).send('you have been logged our successfully')
}catch(e){
    res.status(400).send(e)
}
})


//to log out from all devices
router.post('/logoutAll',authentication,async(req,res)=>{

    try{
        //to put the value of tokens array as empty array
        req.user.tokens=[]
        await req.user.save()

        res.send("you have successfully logged out from all devices")
    }catch(e){
        res.status(400).send(e)
    }

})

//here is the code to tell the rooms joined by the user
router.get('/roomsjoinedbyme',authentication,async(req,res)=>{
    let roomsjoinedbyme=[]
    let user=req.user
    let i=0
   
    for(i=0;i<user.roomsjoined.length;i++){
        let roomid=user.roomsjoined[i].roomjoined
       // console.log(roomid)
        let roo= await Room.findById(roomid)
        if(roo!==null){
            let room=roo.joinedroombyuser()
            room.then((room)=>{

                roomsjoinedbyme.push(room)
            })
        }
       
    }
//to put the last room in the array
let roomid=user.roomsjoined[user.roomsjoined.length-1].roomjoined
let roo=await Room.findById(roomid)
if(roo!==null){
    let room=roo.joinedroombyuser()
    roomsjoinedbyme.push(room)
}



    res.send(roomsjoinedbyme)
})

//to delete the room and after that all the rooms created by the user will be deleted
router.delete('/deleteuser',authentication,async(req,res)=>{
    let user=req.user
    //to delete the rooms created by that user
    let roomsbyme=Room.find({
        owner:user._id
    })
    await Room.deleteMany(roomsbyme)


    let deletedUser= await User.findOneAndDelete({
        _id:user._id
    })
    res.send(deletedUser)
})






module.exports=router