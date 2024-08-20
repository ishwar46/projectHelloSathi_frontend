import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/images/logohello.png";
import UserAvatar from "../assets/images/man.png";
import BotAvatar from "../assets/images/bot.png";
import { chatApi, fetchChatHistory } from "../api/api";

const LiveChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [initialMessageShown, setInitialMessageShown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voices, setVoices] = useState([]);
  const [interimText, setInterimText] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState(null); 
  const [isMuted, setIsMuted] = useState(false); // Mute state

  const primaryColor = "#FF8C00"; 
  const userId = localStorage.getItem("userId");
  const userEmail = localStorage.getItem("userEmail"); 
  const navigate = useNavigate();

  useEffect(() => {
    const synth = window.speechSynthesis;
    const fetchVoices = () => {
      let voicesList = synth.getVoices();
      if (voicesList.length !== 0) {
        setVoices(voicesList);
      } else {
        synth.onvoiceschanged = () => {
          voicesList = synth.getVoices();
          setVoices(voicesList);
        };
      }
    };
    fetchVoices();
  }, [userId]);

  const handleInput = (e) => setInput(e.target.value);

  const generateImage = async (description) => {
    try {
      const response = await fetch('http://localhost:5500/api/images/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });
  
      const data = await response.json();
      if (data.imageUrl) {
        return data.imageUrl;
      } else {
        throw new Error('No image data returned from OpenAI API.');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (input.trim()) {
      const userMessage = { username: "You", text: input, avatar: UserAvatar };
      setMessages([...messages, userMessage]);
      setInput("");
      setInterimText("");
      setLoading(true);

      try {
        const response = await chatApi(input);

        if (!response || !response.response) {
          throw new Error("Invalid API response: response or response.response is undefined");
        }

        let botResponseText = response.response;
        if (botResponseText === "I am generating the image for you...") {
          const botResponse = {
            username: "Hello Sathi",
            text: "Generating your image, please wait...",
            avatar: BotAvatar,
          };
          setMessages((prevMessages) => [...prevMessages, botResponse]);

          const imageUrl = await generateImage(input);
          const botResponseImage = {
            username: "Hello Sathi",
            text: `<img src="${imageUrl}" alt="Generated" className="max-w-full max-h-64 rounded-lg shadow-md" />`,
            avatar: BotAvatar,
          };
          setMessages((prevMessages) => [...prevMessages, botResponseImage]);
          handleTextToSpeech("Here is the image you requested.");
        } else {
          const botResponse = {
            username: "Hello Sathi",
            text: botResponseText,
            avatar: BotAvatar,
          };
          setMessages((prevMessages) => [...prevMessages, botResponse]);
          handleTextToSpeech(botResponseText);
        }
      } catch (error) {
        const errorMessage = "Sorry, I couldn't process that.";
        const botResponse = {
          username: "Hello Sathi",
          text: errorMessage,
          avatar: BotAvatar,
        };
        setMessages((prevMessages) => [...prevMessages, botResponse]);
        handleTextToSpeech(errorMessage);
      }
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && (file.type.startsWith("image/") || file.type.startsWith("text/") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      const formData = new FormData();
      formData.append("file", file);
    
      try {
        const response = await fetch("http://localhost:5500/upload", {
          method: "POST",
          body: formData,
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const data = await response.json();
    
        if (data.success) {
          const userMessage = {
            username: "You",
            text: `File: <a href="${data.fileUrl}" target="_blank" style={{ color: primaryColor }}>${file.name}</a>`,
            avatar: UserAvatar,
          };
          setMessages([...messages, userMessage]);
    
          const botResponse = {
            username: "Hello Sathi",
            text: `File received and processed. Summary: ${data.summary}`,
            avatar: BotAvatar,
          };
          setMessages((prevMessages) => [...prevMessages, botResponse]);
          handleTextToSpeech(`File received and processed. Summary: ${data.summary}`);
        }
      } catch (error) {
        const errorMessage = "Sorry, I couldn't process the file.";
        const botResponse = {
          username: "Hello Sathi",
          text: errorMessage,
          avatar: BotAvatar,
        };
        setMessages((prevMessages) => [...prevMessages, botResponse]);
        handleTextToSpeech(errorMessage);
      }
    } else {
      const errorMessage = "Unsupported file type.";
      const botResponse = {
        username: "Hello Sathi",
        text: errorMessage,
        avatar: BotAvatar,
      };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
      handleTextToSpeech(errorMessage);
    }
  };

  const showInitialMessage = () => {
    if (!initialMessageShown) {
      setInitialMessageShown(true);
      const initialMessage = {
        username: "Hello Sathi",
        text: "Hi there! I'm Hello Sathi, your learning assistant for business domain knowledge. How can I help you today?",
        avatar: BotAvatar,
      };
      setMessages([initialMessage]);
      handleTextToSpeech(initialMessage.text);
    }
  };

  const handleSpeechToText = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    setIsListening(true);

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const finalTranscript = event.results[i][0].transcript;
          setInput(finalTranscript);
          handleSend(); 
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setInterimText(interimTranscript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const handleTextToSpeech = (text) => {
    if (!isMuted && !text.startsWith("http")) { // Check if not muted
      const utterance = new SpeechSynthesisUtterance(text);
      const samanthaVoice = voices.find((voice) => voice.name === "Samantha");
      if (samanthaVoice) {
        utterance.voice = samanthaVoice;
      }

      utterance.onend = () => {
        setCurrentUtterance(null); // Clear the current utterance when it finishes
      };

      speechSynthesis.speak(utterance);
      setCurrentUtterance(utterance); // Save the current utterance
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleStopSpeech = () => {
    if (currentUtterance) {
      speechSynthesis.cancel(); // Stop all current speech
      setCurrentUtterance(null); // Clear the current utterance state
    }
  };

  const handleLogout = () => {
    localStorage.clear(); // Clear all local storage
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen">
      <aside className="w-full md:w-1/4 bg-gray-800 text-white p-4 flex flex-col h-full">
        <div className="mb-4 flex items-center justify-center">
          <img src={Logo} className="h-16 w-16" alt="Hello Sathi Logo" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">My Chats</h2>
        <p className="text-center text-sm text-gray-400 mb-4">
          Logged in as <span className="text-white">{userEmail}</span>
        </p>
        <input
          type="text"
          placeholder="Search"
          className="w-full px-4 py-2 mb-4 bg-gray-700 text-white border border-gray-600 rounded-md placeholder-gray-400"
        />
        <h3 className="text-lg font-semibold mb-2">Favourites</h3>
        <ul className="mb-6 space-y-2">
          <li className="bg-gray-700 py-2 px-4 rounded-md hover:bg-gray-600 cursor-pointer transition">Work chats</li>
          <li className="bg-gray-700 py-2 px-4 rounded-md hover:bg-gray-600 cursor-pointer transition">Life chats</li>
          <li className="bg-gray-700 py-2 px-4 rounded-md hover:bg-gray-600 cursor-pointer transition">Project chats</li>
          <li className="bg-gray-700 py-2 px-4 rounded-md hover:bg-gray-600 cursor-pointer transition">Client chats</li>
        </ul>
        <h3 className="text-lg font-semibold mb-2">History</h3>
        <div className="flex-1 overflow-y-auto mb-4">
          {messages.map((message, index) => (
            <div key={index} className="flex items-center mb-2">
              <img
                src={message.avatar}
                className="h-8 w-8 rounded-full mr-2"
                alt={`${message.username} Avatar`}
              />
              <div>
                <span className="block font-semibold">{message.username}</span>
                <span className="text-gray-300 text-sm">{message.text}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          style={{ backgroundColor: primaryColor }}
          className="w-full py-3 text-white font-semibold rounded-md shadow-lg hover:bg-opacity-90 transition duration-150"
          onClick={showInitialMessage}
        >
          New chat
        </button>
        <button
          onClick={handleLogout}
          className="w-full mt-4 py-3 bg-red-600 text-white font-semibold rounded-md shadow-lg hover:bg-red-500 transition duration-150"
        >
          Logout
        </button>
      </aside>
      <div className="flex-1 flex flex-col h-full">
        <div className="bg-white p-4 border-b border-gray-200 shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-700 text-center">Hello Sathi Your Learning Assistant</h3>
        </div>
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {messages.length === 0 && (
            <div className="text-center text-gray-600">
              Start a conversation to see messages here.
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex mb-4 ${
                message.username === "You" ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex max-w-lg">
                <img
                  src={message.avatar}
                  className="h-10 w-10 rounded-full mr-2"
                  alt={`${message.username} Avatar`}
                />
                <div
                  className={`p-3 rounded-lg shadow-md ${
                    message.username === "You"
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  <span
                    className="block"
                    dangerouslySetInnerHTML={{ __html: message.text }}
                  />
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex mb-4 justify-start">
              <div className="flex max-w-lg">
                <img
                  src={BotAvatar}
                  className="h-10 w-10 rounded-full mr-2"
                  alt="Hello Sathi Avatar"
                />
                <div className="p-3 bg-white rounded-lg shadow-md">
                  <span className="text-gray-800">Processing...</span>
                </div>
              </div>
            </div>
          )}
          {isListening && (
            <div className="flex mb-4 justify-start">
              <div className="flex max-w-lg">
                <img
                  src={BotAvatar}
                  className="h-10 w-10 rounded-full mr-2"
                  alt="Hello Sathi Avatar"
                />
                <div className="p-3 bg-white rounded-lg shadow-md">
                  <span className="text-gray-800">Listening...</span>
                </div>
              </div>
            </div>
          )}
          {interimText && (
            <div className="flex mb-4 justify-end">
              <div className="flex max-w-lg">
                <img src={UserAvatar} className="h-10 w-10 rounded-full mr-2" alt="User Avatar" />
                <div className="p-3 bg-gray-700 text-white rounded-lg shadow-md">
                  <span>{interimText}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <form className="bg-white p-4 border-t border-gray-200 shadow-lg flex items-center" onSubmit={handleSend}>
          <input
            type="text"
            className="flex-1 px-4 py-3 border rounded-md text-gray-700 placeholder-gray-500 focus:ring-gray-500 focus:border-gray-500"
            value={input}
            onChange={handleInput}
            placeholder="Type your message..."
          />
          <button
            type="button"
            className="ml-2 p-2 text-gray-500 hover:text-gray-700"
            onClick={handleSpeechToText}
          >
            <i className="fas fa-microphone"></i>
          </button>
          <button
            type="button"
            className="ml-2 p-2 text-gray-500 hover:text-gray-700"
            onClick={handleMuteToggle} // Button to mute/unmute
          >
            {isMuted ? <i className="fas fa-volume-mute"></i> : <i className="fas fa-volume-up"></i>}
          </button>
          <button
            type="button"
            className="ml-2 p-2 text-gray-500 hover:text-gray-700"
            onClick={handleStopSpeech} // Button to stop speech
          >
            <i className="fas fa-stop"></i>
          </button>
          <label htmlFor="file-upload" className="ml-2 p-2 text-gray-500 hover:text-gray-700 cursor-pointer">
            <i className="fas fa-paperclip"></i>
          </label>
          <input
            id="file-upload"
            type="file"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
          <button
            style={{ backgroundColor: primaryColor }}
            className="ml-2 px-4 py-3 text-white font-semibold rounded-md shadow-md hover:bg-opacity-90 transition duration-150"
            disabled={!input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default LiveChat;
