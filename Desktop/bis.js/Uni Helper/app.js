const express = require('express');
const app = express();
app.use(express.json());


const userRouter = require('./routes/userRoutes');
app.use('/api/users', userRouter);

const serviceRouter = require('./routes/serviceRoutes');
app.use('/api/services', serviceRouter);

const requestRouter = require('./routes/requestRoutes');
app.use('/api/requests', requestRouter);

const ratingRouter = require('./routes/ratingRoutes');
app.use('/api/ratings', ratingRouter);

const adminRouter = require('./routes/adminRoutes');
app.use('/api/admin', adminRouter);








module.exports = app;