import React from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Logout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleLogout = async () => {
    try {
      const url_logout = import.meta.env.VITE_APP_LOGOUT_URL as string;
      await axios.post(url_logout, {}, { withCredentials: true });
      dispatch(logout()); // Clear Redux state

      // Redirect to homepage ("/") after logout
      navigate("/"); // Use navigate to redirect to the homepage
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <span
      onClick={handleLogout}
      style={{
        cursor: "pointer",
        color: "blue",
        textDecoration: "underline",
      }}
    >
      Logout
    </span>
  );
};

export default Logout;
