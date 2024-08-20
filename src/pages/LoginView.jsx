import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/images/logohello.png";
import "../css/LoginPage.css";
import { loginApi } from "../api/api";
import { toast } from "react-toastify";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(email, password);
  
    const data = {
      email: email,
      password: password,
    };
  
    // API call
    loginApi(data)
      .then((res) => {
        console.log("Login response:", res);
  
        if (res.data.success === false) {
          toast.error(res.data.message);
        } else {
          toast.success(res.data.message);
  
          // Set token and user data in local storage
          localStorage.setItem("token", res.data.token);
  
          // Store userId separately and log it
          const userId = res.data.userData.id;
          console.log("userId:", userId); // This should log the correct userId
          localStorage.setItem("userId", userId); // Store userId in localStorage
  
          // Converting incoming JSON
          const convertedJson = JSON.stringify(res.data.userData);
          localStorage.setItem("user", convertedJson);
  
          navigate('/livechat');
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Server Error!");
      });
  };
  
  

  return (
    <section className="login-container">
      <div className="login-content">
        <img src={Logo} className="logo" alt="Hello Sathi Logo" />
        <div className="login-card">
          <div className="login-form">
            <h1 className="login-title">Welcome to Hello Sathi</h1>
            <p className="login-subtitle">Your AI Learning Assistant</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Enter your email
                </label>
                <input
                  onChange={handleChangeEmail}
                  type="email"
                  name="email"
                  id="email"
                  className="form-input"
                  placeholder="yourcoolname@mail.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  onChange={handleChangePassword}
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="form-input"
                  required
                />
              </div>
              <button type="submit" className="login-button">
                Sign in
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
