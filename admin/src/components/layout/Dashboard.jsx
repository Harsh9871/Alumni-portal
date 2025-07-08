import React from "react";
import Navbar from "../common/Navbar";
const Dashboard = ({ children }) => {

  return (
    <div>
        <Navbar/>
      {children}
    </div>
  );
};

export default Dashboard;
