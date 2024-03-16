const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const moment = require("moment");



//Register CallBack Function

const registerController = async (req, res) => {
  try {
    const exisitingUser = await userModel.findOne({ email: req.body.email });
    if (exisitingUser) {
      return res
        .status(200)
        .send({ message: "User Already Exist", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newUser = new userModel(req.body);
    await newUser.save();
    res.status(201).send({ message: "Register Sucessfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Register Controller ${error.message}`,
    });
  }
};

// Login CallBack Funtion 
//These functions are called after the authentication controller

const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });//finds the user by id 
    if (!user) {
      return res
        .status(200)
        .send({ message: "user not found", success: false });//message sent when user is not found
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);//if user is found we compare the password provided by user and password saved in database
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invlid EMail or Password", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {//if user is found we generate a jwt token
      expiresIn: "1d",
    });
    res.status(200).send({ message: "Login Success", success: true, token });//Login Success message is sent with the token
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error in Login CTRL ${error.message}` });
  }
};

//This is Athentication Functionaltiy

const authController = async (req, res) => {
  try {
    const user = await userModel.findById({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res.status(200).send({
        message: "User Not Found",
        success: false,
      });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Authentication Error",
      success: false,
      error,
    });
  }
};



//Apply For A Doctor Funcitonality


//This works when user apply for a doctor
//Basic summary is that given request to apply for a doctor with a status of pending is sent to database the admin do get notified for that and has funcionality to approve or disaprove the request 
const applyDoctorController = async (req, res) => {
  try {
    const newDoctor = await doctorModel({ ...req.body, status: "pending" });//const created with req data and status pending
    await newDoctor.save();//new doctor saved in database
    const adminUser = await userModel.findOne({ isAdmin: true });//finding the admin so that we can send notification to admin
    const notifcation = adminUser.notifcation;//notification constant 
    //since notification is array of object so adding a object with specified data
    notifcation.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} Has Applied To Have A Doctor Account`,
      data: {
        doctorId: newDoctor._id,
        name: newDoctor.firstName + " " + newDoctor.lastName,
        onClickPath: "/admin/docotrs",
      },
    });
    await userModel.findByIdAndUpdate(adminUser._id, { notifcation });//since it is async function
    //notification is updated to admin by finding it by its id
    res.status(201).send({
      success: true,
      message: "Doctor Account Applied SUccessfully",//this message will show as a popup by antd
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Applying  For A Doctor",
    });
  }
};




//Notification Control
// Basic Summmary This Funtion is used by to get all the notificatons and then pushing in seen notification




const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });//getting user by id
    const seennotification = user.seennotification;//seen notification store in const
    const notifcation = user.notifcation;//all notification is stored in notification
    seennotification.push(...notifcation);//fiiling seen notification with all notifications 
    user.notifcation = [];//as seen so notification emptying the notification array
    user.seennotification = notifcation;
    const updatedUser = await user.save();//save in database 
    res.status(200).send({
      success: true,
      message: "All Notifications Are Marked As Read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in notification",
      success: false,
      error,
    });
  }
};



//Functionality To Delete All Notifications
//It basically Delete the content of seennotification array when request comes to server
const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.notifcation = [];
    user.seennotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notifications Deleted successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Unable To Delete Notifications",
      error,
    });
  }
};



//Get ALL DOCTORS
//Sends the list of all doctor
const getAllDocotrsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Doctors Lists Fetched Successfully",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Fetching Doctor",
    });
  }
};

//BOOK APPOINTMENT
const bookeAppointmnetController = async (req, res) => {
  try {
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
    req.body.status = "pending";
    const newAppointment = new appointmentModel(req.body);
    await newAppointment.save();
    const user = await userModel.findOne({ _id: req.body.doctorInfo.userId });
    user.notifcation.push({
      type: "New-appointment-request",
      message: `A nEw Appointment Request from ${req.body.userInfo.name}`,
      onCLickPath: "/user/appointments",
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Appointment Book succesfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Booking Appointment",
    });
  }
};

// booking bookingAvailabilityController
const bookingAvailabilityController = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm")
      .subtract(1, "hours")
      .toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    const doctorId = req.body.doctorId;
    const appointments = await appointmentModel.find({
      doctorId,
      date,
      time: {
        $gte: fromTime,
        $lte: toTime,
      },
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        message: "Appointments not Availibale at this time",
        success: true,
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Appointments available",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In Booking",
    });
  }
};

const userAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({
      userId: req.body.userId,
    });
    res.status(200).send({
      success: true,
      message: "Users Appointments Fetch SUccessfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In User Appointments",
    });
  }
};



// All the function created are exported

module.exports = {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDocotrsController,
  bookeAppointmnetController,
  bookingAvailabilityController,
  userAppointmentsController,
};