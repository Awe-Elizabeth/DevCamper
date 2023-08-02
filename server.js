const path = require('path')
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colours');
const fileupload = require('express-fileupload')
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss= require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');


// Load Env Vars
dotenv.config({path: './config/config.env'});

//  connect to database
connectDB();

// Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express ();

//  Body Parser
app.use(express.json());
app.use(cookieParser());

//  Dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
};
// File Uploading
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

//  Set security headers
app.use(helmet());

// Prevent xss attack
app.use(xss());

// Rate Limiting
    const limiter = rateLimit({
        windowMs: 10 * 60 * 1000,
        max: 100
    })
    app.use(limiter);
    
//  Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

//  Set Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount variables
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

//  Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    //  Close server &exit process
    server.close(() => process.exit(1)); 
});





