import React from "react";
import Layout from "./../components/Layout";
import "../styles/LayoutStyles.css";
import { Button, message, Tabs } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";


//This handles the notification  Page


const NotificationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);


  // Functionality To move notifications from unread to read tab
  //Basically funtionality to send request to server to delete the notification from unread array to seen array

  const handleMarkAllRead = async () => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user//get-all-notification",
        {
          userId: user._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success(res.data.message);
        window.location.reload();
      } else {
        message.error(res.data.message);
        window.location.reload();
      }
    } catch (error) {//showing error
      dispatch(hideLoading());
      console.log(error);
      message.error("somthing went wrong");
    }
  };


  //Funtionality To Delete All The Notifications
  // Basically funtionality to send request to server to delete the notification from seen array
  const handleDeleteAllRead = async () => {
    try{
      dispatch(showLoading());
      const res =await  axios.post('/api/v1/user/delete-all-notification',{userId:user._id},{
        headers:{
          Authorization:`Bearer ${localStorage.getItem('token')}`,

        }
      });
      dispatch(hideLoading());
      if(res.data.success){
        message.success(res.data.message);
        window.location.reload();
      }else{
        message.error(res.data.message);
        window.location.reload();
      }
    } catch(error){
      console.log(error);
      message.error('Something went wrong in notification');
    }

  };



  //This is page you see when you click on notification icon

  return (
    <Layout>
      <h4 className="p-3 text-center">Notification Page</h4>
      <Tabs>
        <Tabs.TabPane tab="UNREAD" key={0}>
          <div className="d-flex justify-content-end">
            <Button onClick={handleMarkAllRead}>
              Mark All Read
            </Button>
          </div>
          {user?.notifcation.map((notificationMgs) => (
            <div className="card" style={{ cursor: "pointer" }}>
              <div
                className="card-text"
                onClick={() => navigate(notificationMgs.onClickPath)}
              >
                {notificationMgs.message}
              </div>
            </div>
          ))}
        </Tabs.TabPane>
        <Tabs.TabPane tab="READ" key={1}>
          <div className="d-flex justify-content-end">
            <Button style ={{cursor:'pointer'}}  onClick={handleDeleteAllRead}>
              Delete All Read
            </Button>
          </div>
          {user?.seennotification.map((notificationMgs) => (
            <div className="card" style={{ cursor: "pointer" }}>
              <div
                className="card-text"
                onClick={() => navigate(notificationMgs.onClickPath)}
              >
                {notificationMgs.message}
              </div>
            </div>
          ))}
        </Tabs.TabPane>
      </Tabs>
    </Layout>
  );
};

export default NotificationPage;