const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');


//  Load env vars
dotenv.config({path: './config/config.env'});

//  Load models
    const Bootcamp = require('./models/Bootcamp');
    const Course = require('./models/Course');
    const User = require('./models/User');
    const Review = require('./models/Review');

//  Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
    keepAlive: true,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
});

//  Read JSON file
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));

// Import into DB
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        await User.create(users);
        await Review.create(reviews);
    

        const allBootcamps = await Bootcamp.find({});

        for(let i = 0; i < allBootcamps.length; i++){

            let courses = await Course.find({ bootcamp: allBootcamps[i]._id });

            if(courses.length > 0){

                for(let j = 0; j < courses.length; j++){

                    allBootcamps[i].courses.push(courses[j]._id);
                    
                }

                await allBootcamps[i].save({ validateBeforeSave: false });

            }

        }

        console.log('Data Imported.....'.green.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
};

//  Delete data
const deleteData = async () => {
    try {

        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();


        console.log('Data Destroyed.....'.red.inverse);
        process.exit();

    } catch (err) {
        console.error(err);
    }
};
if (process.argv[2]=== '-i'){
    importData();
}
    else if (process.argv[2] === '-d'){
        deleteData();
    }