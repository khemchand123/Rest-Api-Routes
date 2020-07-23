const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const { Binary } = require('mongodb')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim:true
    },
    email:{
        type: String,
        required:true,
        lowercase:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                 throw new Error('Email is invalid please check again!')
            }
        }
    },
    password:{
        type: String,
        required:true,
        minlength:6,
        validate(value){
             if(value.toLowerCase().includes('password')){
                 throw new Error('password contain password')
             }
        }
    },
    age:{
        type: Number,
        default:0,
        validate(value){
            if(value < 0){
                throw new Error('Age must be +ve Number')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})


userSchema.virtual('tasks', {
     ref: 'Task',
     localField: '_id',
     foreignField: 'owner'
})

userSchema.statics.findByCredentails = async (email, password) =>{
    const user = await User.findOne({email})
    
    if(!user){
        throw new Error('Unable to Login')
    }
    
    const isMatch = await bcrypt.compare(password, user.password)
    
    if(!isMatch){
        throw new Error('Unable to Login')
    }

    return user
}



userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject() 

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.methods.generateAuthToken = async function() {
    const user = this
    
    const token =  jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token}) 
    await user.save()
    return token
}


//middleware hash password before save
userSchema.pre('save', async function(next){
    const user = this

    if(user.isModified('password')){
         user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})


//middleware delete tasks before remove user
userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({owner: user._id})
    
    next()
})


const User = mongoose.model('User', userSchema);

module.exports = User;