import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/images/logohello.png";
import { toast } from "react-hot-toast";
import { registerApi } from "../api/api";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; 

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await registerApi(formData);
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <section className="flex items-center justify-center min-h-screen p-5">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 md:p-12">
        <div className="text-center mb-6">
          <img src={Logo} className="w-20 mx-auto mb-4" alt="Logo" />
          <h1 className="text-3xl font-bold text-gray-800">Register</h1>
          <p className="text-gray-600">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-wrap -mx-2">
            <div className="w-full md:w-1/2 px-2 mb-4">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                onChange={handleChange}
                type="text"
                name="firstName"
                id="firstName"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Enter your first name"
                required
              />
            </div>
            <div className="w-full md:w-1/2 px-2 mb-4">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                onChange={handleChange}
                type="text"
                name="lastName"
                id="lastName"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-2">
            <div className="w-full md:w-1/2 px-2 mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                onChange={handleChange}
                type="email"
                name="email"
                id="email"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="w-full md:w-1/2 px-2 mb-4 relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                onChange={handleChange}
                type={showPassword ? "text" : "password"} // Toggle input type
                name="password"
                id="password"
                className="mt-1 block w-full px-4 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Enter your password"
                required
              />
              <div
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              >
                {/* {showPassword ? (
                  <AiFillEyeInvisible className="text-gray-500 h-6 w-6" />
                ) : (
                  <AiFillEye className="text-gray-500 h-6 w-6" />
                )} */}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-orange-500 text-white font-semibold rounded-md shadow-md hover:bg-orange-600 transition duration-150"
          >
            Sign up
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-500 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
