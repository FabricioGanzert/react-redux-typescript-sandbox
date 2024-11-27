// src/pages/AddUserPage.tsx
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import AddUser from "../components/addUser";

const AddUserPage: React.FC = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  useEffect(() => {
    // Optionally, check if the user is logged in before showing the page
    if (!isLoggedIn) {
      // Handle what happens if the user is not logged in
    }
  }, [isLoggedIn]);

  if (isLoggedIn) {
    return (
      <div>
        <h1>Add New User Page</h1>
        <AddUser />
      </div>
    );
  } else {
    return <div>{"Nope. You must be logged in to add a user."}</div>;
  }
};

export default AddUserPage;
