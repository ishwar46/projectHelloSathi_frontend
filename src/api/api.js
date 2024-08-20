// api.js
import axios from 'axios';

// Create an axios instance with a base URL
const Api = axios.create({
  baseURL: "http://localhost:5500",
  withCredentials: true,
});

// Configuration for axios (headers with authorization token)
const config = {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
};

export const registerApi = (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  return Api.post("/api/users/register", data, config);
};

export const loginApi = (data) => Api.post("/api/users/login", data);


export const chatApi = async (input) => {
  try {
    const userId = localStorage.getItem('userId');  // Assume userId is stored in localStorage
    const response = await Api.post('/api/predict', { 
      message: input, 
      userId: userId 
    });
    return response.data;  // Return the data part of the response
  } catch (error) {
    console.error('API call error:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchChatHistory = async (userId) => {
  try {
    const response = await Api.get(`/api/chat/history/${userId}`);
    return response.data;  // Return the chat history data
  } catch (error) {
    console.error('Error fetching chat history:', error.response?.data || error.message);
    throw error;
  }
};





export default Api;
