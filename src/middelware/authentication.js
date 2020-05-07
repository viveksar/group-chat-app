//here we will provide the authentication to the request madde from the user
let jwt=require('jsonwebtoken')
let User=require('../models/user')

let authentication=async(req,res,next)=>{
    //here we will write code to authenticate the request
try{
let token=req.header('Authorization').replace('Bearer ','')

//to check weather the token is valid or not
let decode=jwt.verify(token,process.env.JWT_SECRET)

let user=await User.findOne({_id:decode._id,'tokens.token':token})


if(!user){
    throw new Error()
}

//to returnn the token value as the property of the req
req.token=token

//if all the things went well we will set the property user to the request and give its value as user
req.user=user

    next()

}catch(e){
    res.status(404).send({
        error:"please authenticate properly "
        
    })
    }


}

module.exports=authentication