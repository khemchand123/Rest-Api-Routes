const express = require('express')
require('./C_mongoDB_Mongoose')

const userRouter = require('./routes/user')
const taskRouter = require('./routes/task')

const app = express()
const Port = process.env.PORT



app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(Port, () => {
    console.log(`Server started at ${Port} port`)
})
