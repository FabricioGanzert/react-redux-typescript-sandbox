import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setLoginStatus, setUserData } from "../store/slices/authSlice"; // Import actions

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useDispatch(); // Get the dispatch function

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Both fields are required.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url_login = import.meta.env.VITE_APP_LOGIN_URL as string;
      const response = await axios.post(
        url_login,
        { email, password },
        { withCredentials: true } // Include credentials (cookies) with the request
      );

      const { user } = response.data; // Assuming the API returns user info (no token, as it's stored in cookie)

      // Dispatch login status and user data to the store
      dispatch(setLoginStatus(true));
      dispatch(setUserData(user)); // Set the user data in the store (must match the User model)

      // Redirect to the home page after successful login
      window.location.href = "/";
    } catch (err) {
      console.log(err);
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error || "Login failed. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>Login</h1>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ padding: "10px", marginBottom: "10px", borderRadius: "5px" }}
        />
        <br />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{ padding: "10px", borderRadius: "5px" }}
        />
      </div>
      <button
        onClick={handleLogin}
        disabled={isLoading}
        style={{
          padding: "10px 20px",
          backgroundColor: isLoading ? "gray" : "blue",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default LoginPage;
