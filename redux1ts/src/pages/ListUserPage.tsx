// src/pages/AddUserPage.tsx
import React from "react";
import UserList from "../components/UserList"; // Import UserList
import useAuth from "../hooks/useAuth"; // Import the custom hook

const ListUserPage: React.FC = () => {
  useAuth(); // Call the hook to verify token

  return (
    <>
      <UserList />
    </>
  );
};

export default ListUserPage;
