const jwt = require('jsonwebtoken')
const User = require('../models/user')


const auth = async (req, res, next) => {
     try {
        const token = req.header('Authorization').replace('Bearer ','')
     
        const decode = await jwt.verify(token, 'thisistaskmanager')
        
        const user  = await User.findOne({'_id': decode._id, 'tokens.token':token})
        
        if(!user){
            throw new Error()
        }

        req.user = user;
        req.token = token;
        next()

     } catch (error) {
          res.status(401).send('Please Authorization')  
     }
}

module.exports = auth;