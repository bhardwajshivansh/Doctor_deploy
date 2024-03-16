const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");

//Function to get All the users
const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel.find({});
    res.status(200).send({//but may be you  send all passwords too handle that
      success: true,
      message: "Users Data Lists",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Fetching Users",
      error,
    });
  }
};


//Funtion to get All the Doctors 
const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    res.status(200).send({
      success: true,
      message: "Doctors Data list",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Getting Doctor Data",
      error,
    });
  }
};


// Doctor Account Status
const changeAccountStatusController = async (req, res) => {
  try {
    const { doctorId, status } = req.body;
    const doctor = await doctorModel.findByIdAndUpdate(doctorId, { status });
    const user = await userModel.findOne({ _id: doctor.userId });
    const notifcation = user.notifcation;
    
    notifcation.push({
      type: "doctor-account-request-updated",
      message: `Your Doctor Account Request Has ${status}`,
      onclickPath: "/notifcation",
    });
    user.isDoctor = status === "approved" ? true : false;

    await user.save();
    res.status(201).send({
      success: true,
      message: "Account Status Upadated",
      data: doctor,
    });
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "Error in Account Status",
      error,
    });
  }
};


//GET SINGLE DOCTOR
const getDoctorByIdController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ _id: req.body.doctorId });
    res.status(200).send({
      success: true,
      message: "Single Doctor Info Fetched",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Single Doctor Info",
    });
  }
};
module.exports = {
  getAllDoctorsController,
  getAllUsersController,
  changeAccountStatusController,
  getDoctorByIdController,
};
