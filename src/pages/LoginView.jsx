import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/images/logohello.png";
import { loginApi } from "../api/api";
import { toast } from "react-hot-toast";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

          // Store the user's email in local storage
          localStorage.setItem("userEmail", email); // Store email in localStorage

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
    <section className="flex items-center justify-center min-h-screen p-5">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 md:p-12">
        <div className="text-center mb-6">
          <img src={Logo} className="w-20 mx-auto mb-4" alt="Hello Sathi Logo" />
          <h1 className="text-3xl font-bold text-gray-800">Welcome to Hello Sathi</h1>
          <p className="text-gray-600">Your AI Learning Assistant</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              onChange={handleChangeEmail}
              type="email"
              name="email"
              id="email"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="yourcoolname@mail.com"
              required
            />
          </div>
          <div className="flex flex-col relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              onChange={handleChangePassword}
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              placeholder="••••••••"
              className="mt-1 block w-full px-4 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              required
            />
            <div
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            >
              {showPassword ? (
                <AiFillEyeInvisible className="text-gray-500 h-6 w-6" />
              ) : (
                <AiFillEye className="text-gray-500 h-6 w-6" />
              )}
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-orange-500 text-white font-semibold rounded-md shadow-md hover:bg-orange-600 transition duration-150"
          >
            Sign in
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-orange-500 font-semibold hover:underline">
            Register Now
          </Link>
        </p>
      </div>
    </section>
  );
};

export default LoginPage;
