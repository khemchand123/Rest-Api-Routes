const express = require('express')
const multer = require('multer')
const sharp = require('sharp')

const User = require('../models/user')
const auth = require('../middleware/auth')
const { welcomeEmail, cancelEmail } = require('../emails/account')

const router = new express.Router()


router.post('/users', async (req, res) => {
    const user = new User(req.body)
    
    try {
        await user.save()
        welcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (error) {
        res.status(400).send({error})
    }
  })


router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentails(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (error) {
        res.status(400).send({error})
    }
})  


router.post('/users/logout', auth, async (req, res) => {
     try {
        req.user.tokens = req.user.tokens.filter((token) =>{
            return token.token !== req.token
       })
  
       await req.user.save()
       res.send('User session logout')
     } catch (error) {
         res.status(500).send()
     }
})


router.post('/users/logoutAll', auth, async (req, res) =>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send('All device are logout')
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
     res.send(req.user)
})

/* router.get('/users/:id', async (req, res) => {
      const _id = req.params.id    

      try {
          const user = await User.findById(_id)
          if(!user){
              return res.status(404)
          }
          res.status(200).send(user)
      } catch (error) {
          res.status(500).send(error)
      }
}) */

router.patch('/users/me', auth, async (req, res) => {
    const _id = req.user._id
    const updates = Object.keys(req.body)
    const userSchemaField = ['name', 'email', 'password', 'age']
    const isUnMatched = updates.every((update) => {
        return userSchemaField.includes(update)
    })
    
    if(!isUnMatched){
         return res.status(400).send({error:'Invalid Field'})
    }

    try {
         updates.forEach((update) => req.user[update] = req.body[update] );
         await req.user.save() 
         res.status(201).send(req.user)
    } catch (error) {
         res.status(400).send(error)
    }
})


router.delete('/users/me', auth,  async (req, res) => {
    try {
         await req.user.remove()
         cancelEmail(req.user.email, req.user.name)
         res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})


//file upload 
// user/me/avatar
const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, callback){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
             return callback(new Error('file extenstion must be jpg or jpeg or png'))
        }
        callback(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar') ,async (req, res) => {
    const buffer = await sharp(req.file.buffer).png().resize({width: 250, height: 250}).toBuffer()

    req.user.avatar = buffer
    await req.user.save()

    res.send();
}, (error, req, res, next) =>{
    res.status(400).send({error: error.message})
})


router.delete('/users/me/avatar', auth, async (req, res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})


router.get('/users/:_id/avatar', async (req, res) =>{
     try {
          const user = await User.findById(req.params._id)
          if(!user || !user.avatar){
              throw new Error()
          }

          res.set('Content-Type','image/png')
          res.send(user.avatar)
     } catch (error) {
          res.status(404).send()
     }
})

module.exports = router;