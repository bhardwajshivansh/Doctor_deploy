import React, { useEffect, useState } from "react";
import "../styles/LayoutStyles.css";
import axios from "axios";
import Layout from "../components/Layout";
import { Row, message } from "antd";
import DoctorList from "../components/DoctorList";
const HomePage = () => {
  const [doctors, setDoctors] = useState([]);
  //login user data
  const getUserData = async () => {
    try {
      const res = await axios.get(
        "/api/v1/user/getAllDoctors",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        setDoctors(res.data.data);
      }
      else{
        message('Doctors Not Found');
      }
    } catch (error) {
      console.log(error);
      
    }
  };
  useEffect(() => {
    getUserData();
    // eslint-disable-next-line
  }, []);
  return (
    // eslint-disable-next-line
    <Layout>
      <h1 className="text-center">Availibale Doctors</h1>
    <Row>
      {doctors && doctors.map(doctor =>(
        <DoctorList doctor={doctor}/>
      ))}
    </Row>
    </Layout>
  );
};

export default HomePage;
