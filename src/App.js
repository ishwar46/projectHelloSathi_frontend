import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ScrollToTop from "../src/utils/ScrollToTop";
import NotFoundPage from "./components/NotFoundPage";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/LoginView";
import ChatPage from "./pages/ChatPage";
import LiveChat from "./pages/LiveChat";
import RegisterPage from "./pages/RegisterView";

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/chatpage" element={<ChatPage />} />
        <Route path="/livechat" element={<LiveChat />} />
        {/* Catch-all for 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
