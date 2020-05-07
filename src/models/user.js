//in this file we will create a model for the user
let mongoose=require('mongoose')
let validator=require('validator')
let jwt=require('jsonwebtoken')
let bcrypt=require('bcrypt')

let userschema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowerCase:true,
        trim:true,
        validate(email){
            if(!validator.isEmail(email)){
                throw new Error('enter the valid email')
            }
        }
    },
    password:{
        type:String,
        required:true,
        validate(password){
            if(password.includes('password')||password.includes('PASSWORD')){
                throw new Error('you cannot have this password')
            }
            else if(password.length<6){
                throw new Error("length of password must be grater then 6")
            }
        }
    },
    username:{
    type:String,
    required:true,
    unique:true
    },
    //here we will keep the json web tokens
    tokens:[{
        token:{
            required:true,
            type:String
        }
    }],
    //here we will put the recrd of the rooms joined by this user
    roomsjoined:[{
        roomjoined:{
        
        }
    }]

    })

    //to set the virtual field for the object id
    userschema.virtual('Room',{
        ref:'Room',
        localField:'_id',
        foreignField:'owner'
    })

   /* userschema.virtual('Members',{
        ref:'Room',
        localField:'_id',
        foreignField:'usersjoined'
    })*/
    //to provide the proper user profile
    userschema.methods.userProfile=async function(){

        let user=this
        let userObject=user.toObject()
        //to delete the unwanted keys 
        delete userObject.password
        delete userObject.tokens
        

        return userObject
    }

    userschema.methods.memberProfile=async function(){

        let user=this
        let userObject=user.toObject()
        //to delete the unwanted keys 
        delete userObject.password
        delete userObject.tokens
        delete userObject.email
        delete userObject._id
        delete userObject.__v
        

        return userObject
    }



    //to provide the authentication token
    userschema.methods.getauthtoken=async function(){
        let user=this
        let token=jwt.sign({_id:user._id},JWT_SECRET)

        //to add this token to the tokens array in the model
        user.tokens=user.tokens.concat({
            token:token
        })
     await user.save()
     return token
    }


    //to find any user by giving its credentials
   userschema.statics.findByCredentials=async (email,password)=>{
        //to check if the user of given email is present
        let user=await  User.findOne({email:email})
        if(!user){
            throw new Error('Register yourself first')
        }
        //if the user is present and have the same password as provided by the user
     let isValid=bcrypt.compare(password,user.password)
     if(!isValid){
         throw new Error('wrong password')
     }



        return user

    }

//to hash the password before it is saved to the database
userschema.pre('save',async function(next){

    let user=this
    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8)
       
    }

    next()
})



let User=mongoose.model("User",userschema)
    


module.exports=User