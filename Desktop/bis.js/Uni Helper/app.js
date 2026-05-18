const express = require('express');
const app = express();
app.use(express.json());


const userRouter = require('./routes/userRoutes');
app.use('/api/users', userRouter);









module.exports = app;