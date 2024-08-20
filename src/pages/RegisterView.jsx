import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/images/logohello.png";
import { toast } from "react-toastify";
import "../css/Register.css";
import { registerApi } from "../api/api";
const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleFirstName = (e) => setFirstName(e.target.value);
  const handleLastName = (e) => setLastName(e.target.value);
  const handleEmail = (e) => setEmail(e.target.value);
  const handlePassword = (e) => setPassword(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { firstName, lastName, email, password };

    try {
      const res = await registerApi(data);
      if (res.data.success) {
        toast.success("Registered successfully!");
        navigate("/login");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Internal server error");
    }
  };

  return (
    <section className="register-container">
      <div className="register-content">
        <img src={Logo} className="logo" alt="Logo" />
        <div className="register-card">
          <div className="register-form">
            <h1 className="register-title">Register</h1>
            <p className="register-subtitle">Create your account</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input
                  onChange={handleFirstName}
                  type="text"
                  name="firstName"
                  id="firstName"
                  className="form-input"
                  placeholder="First Name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input
                  onChange={handleLastName}
                  type="text"
                  name="lastName"
                  id="lastName"
                  className="form-input"
                  placeholder="Last Name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  onChange={handleEmail}
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
                  Create a password
                </label>
                <input
                  onChange={handlePassword}
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="form-input"
                  required
                />
              </div>
              <button type="submit" className="register-button">
                Sign up
              </button>
            </form>
            <p className="login-link">
              Already have an account?{" "}
              <Link to="/login" className="login-text">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
