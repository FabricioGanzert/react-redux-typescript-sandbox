// src/pages/AddUserPage.tsx
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import AddUser from "../components/addUser";
import { useNavigate } from "react-router-dom";
import UserList from "../components/UserList";

const AddUserPage: React.FC = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    // Optionally, check if the user is logged in before showing the page
    if (!isLoggedIn) {
      navigate("/login"); // Redirect to login page if not logged in
    }
  }, [isLoggedIn]);

  return (
    <div>
      <h1>Add New User Page</h1>
      <AddUser />
      <UserList />
    </div>
  );
};

export default AddUserPage;
