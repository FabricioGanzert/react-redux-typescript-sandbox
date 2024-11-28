// src/hooks/useAuth.ts
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setLoginStatus, setUserData } from '../store/slices/authSlice';
import axios from 'axios';

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const url_verify = import.meta.env.VITE_VERIFY_TOKEN_URL as string;

      try {
        const response = await axios.get(url_verify, {
          withCredentials: true,
        });

        // Token is valid, update Redux state
        dispatch(setLoginStatus(true));
        dispatch(setUserData(response.data.user));
      } catch (error) {
        console.error("Token verification failed:", error);
        dispatch(setLoginStatus(false));
        dispatch(setUserData(null));
        navigate("/login"); // Redirect to login if token is invalid
      }
    };

    verifyToken();
  }, [dispatch, navigate]);
};

export default useAuth;
