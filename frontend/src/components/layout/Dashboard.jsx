import React, { memo } from "react";
import Navbar from "../common/Navbar";

const Dashboard = memo(({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
    
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
});

Dashboard.displayName = "Dashboard";

export default Dashboard;