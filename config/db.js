const mongoose= require('mongoose')
const colors=require('colors')//this is for color in terminal

const connectDB = async( )  => {
    try{
await mongoose.connect(process.env.MONGODB_URL)
console.log('Mongodb connected ${mongoose.connection.host}' .bgGreen.white);
    }catch(error){
        console.log('mongodb Server Issue ${error}'.bgRed.white);
    }
};
module.exports = connectDB;