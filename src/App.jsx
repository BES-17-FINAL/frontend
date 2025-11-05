import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import TravelHubHome from "./pages/TravelHubHome";
import Signup from "./pages/signup";
import Login from "./pages/login";
import useAuthStore from "./store/authStore";
import SpotDetail from "./pages/spotDetail";

const App = () => {

  const { isAuthenticated } = useAuthStore();
  
  useEffect(() =>{
    console.log(isAuthenticated);
  })


  return (
    <BrowserRouter>
      
      {/* Main 화면 */}
      <Routes>
        <Route path="/" element={<TravelHubHome />} />

        <Route path="/spotDetail" element={<SpotDetail />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" /> : <Signup />}
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;