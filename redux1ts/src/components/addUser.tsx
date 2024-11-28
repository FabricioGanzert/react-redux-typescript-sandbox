// src/components/AddUser.tsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser, fetchUsers } from "../store/slices/addUserSlice"; // Import your action to add a user
import { AppDispatch } from "../store/store";

const AddUser: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAddNewUser = async () => {
    if (name.trim() && lastname.trim() && email.trim() && password.trim()) {
      const newUser = { userId: 0, name, lastname, email, password };

      // Dispatch action to add user to Redux store
      const res = await dispatch(addUser(newUser));

      if (res.error) {
        alert(
          "Error when inserting the user. Duplicate emails are not allowed"
        );
      }

      // Clear form fields after submitting
      setName("");
      setLastName("");
      setEmail("");
      setPassword("");

      await dispatch(fetchUsers(1));
      alert("User added successfully");
    } else {
      alert("Please enter both a name, last name, email, and password!");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        type="text"
        value={lastname}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Lastname"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleAddNewUser}>Add User</button>
    </div>
  );
};

export default AddUser;
