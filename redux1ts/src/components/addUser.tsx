// src/components/AddUser.tsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store"; // Ensure AppDispatch is imported
import { fetchUsers, addUser } from "../store/slices/addUserSlice"; // Correct import of actions
import { User } from "../models/User"; // Import the User model
import UserList from "./UserList"; // Import the new UserList component

const AddUser: React.FC = () => {
  const users = useSelector((state: RootState) => state.addUser.users);
  const dispatch = useDispatch<AppDispatch>(); // Correctly type dispatch
  const [name, setName] = useState<string>("");
  const [lastname, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Fetch users on mount
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleAddNewUser = async () => {
    if (name.trim() && lastname.trim() && email.trim() && password.trim()) {
      const newUser: User = { userId: 0, name, lastname, email, password }; // Ensure it conforms to the User type
      await dispatch(addUser(newUser));
      setName("");
      setLastName("");
      setEmail("");
      setPassword("");
    } else {
      alert("Please enter both a name, last name, email, and password!");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Add New User:</h2>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="First name"
          style={{
            padding: "5px",
            marginRight: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="text"
          value={lastname}
          onChange={handleLastNameChange}
          placeholder="Last name"
          style={{
            padding: "5px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="Email"
          style={{
            padding: "5px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Password"
          style={{
            padding: "5px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
      </div>
      <button
        onClick={handleAddNewUser}
        style={{
          padding: "10px 20px",
          backgroundColor: "green",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Add User
      </button>

      {/* Render the UserList component with the users data */}
      <UserList users={users} />
    </div>
  );
};

export default AddUser;
