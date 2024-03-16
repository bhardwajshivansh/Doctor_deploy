const express = require('express');
const colors= require('colors');
const moragan = require('morgan');
const dotenv= require('dotenv');
const connectDB = require('./config/db');
const path =require('path')


//config dotenv
dotenv.config();
//mongodb connection
connectDB();
// rest object
const app=express();

//middlewares
app.use(express.json());//for parsing any object passed
app.use(moragan('dev'));//for route finish time 

app.use(express.static(path.join(__dirname,'./client/build')))

app.get('*',function(req,res){
    res.sendFile(path.join(__dirname,"./client/build/index.html"));
});

//routes
app.use('/api/v1/user', require("./routes/userRoutes"));
app.use('/api/v1/admin', require("./routes/adminRoutes"));
app.use("/api/v1/doctor", require("./routes/doctorRoutes"));
//port
const port = process.env.PORT || 8080;

//listen port 

app.listen(port ,()=>{
    console.log(
        `Server Runnig in ${process.env.NODE_MODE}  Mode on port ${process.env.PORT}`
        .bgCyan.white
        );
    });
