const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')

const router = new express.Router()


router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    
    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[2] == 'desc' ? -1 : 1
    }
    
    try {
        //const tasks = await Task.find({owner: req.user.id})
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip)
            },
            sort
        }).execPopulate()

        res.status(200).send(req.user.tasks)
    } catch (error) {
        res.status(400).send(error)
    }
})


router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    
    try {
        const task = await Task.findOne({_id, owner: req.user._id})

        if(!task){
            return res.status(404).send()
         }
        res.status(200).send(task)
    } catch (error) {
        res.status(500).send({error})
    }
})


router.patch('/tasks/:id', auth, async (req, res) =>{
    const _id = req.params.id
    const updates = Object.keys(req.body)

    const taskSchemaField = ['description', 'completed']
    const isUnMatched = updates.every((update) => {
        return  taskSchemaField.includes(update)
    })
    
    if(!isUnMatched){
         return res.status(400).send({error:'Invalid Field'})
    }

 
    try {
         
         const task = await Task.findOne({_id, owner: req.user._id})
         console.log(task)
         if(!task){
             return res.status(404).send('Task doesnot found')
         }

         updates.forEach((update) =>{
             task[update] = req.body[update]
         })
         await task.save()
         
        
         res.status(201).send(task)
    } catch (error) {
         res.status(400).send(error)
    }
})


router.delete('/tasks/:id', auth, async (req, res) => {
    try {
         const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
         if(!task){
             return res.status(404).send()
         }
         res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router;

