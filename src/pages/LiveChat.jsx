import React, { useState, useEffect } from "react";
import "../css/ChatPage.css";
import Logo from "../assets/images/logohello.png";
import UserAvatar from "../assets/images/man.png";
import BotAvatar from "../assets/images/bot.png";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { chatApi, fetchChatHistory } from "../api/api";

const LiveChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [initialMessageShown, setInitialMessageShown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voices, setVoices] = useState([]);
  const [interimText, setInterimText] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("userId");
  
  useEffect(() => {
    // // Fetch chat history when the component mounts
    // const loadChatHistory = async () => {
    //   try {
    //     const chatHistory = await fetchChatHistory(userId);
    //     setMessages(chatHistory);  // Set the fetched messages to the state
    //   } catch (error) {
    //     console.error('Failed to load chat history:', error);
    //   }
    // };

    // loadChatHistory();

    // Fetch voices for text-to-speech
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
            console.log("Full API response:", response);
            console.log("Response data:", response);
            console.log("Response data response:", response?.response);

            if (!response || !response.response) {
                throw new Error("Invalid API response: response or response.response is undefined");
            }

            let botResponseText = response.response;
            if (botResponseText === "I am generating the image for you...") {
                // Show status message for image generation
                const botResponse = {
                    username: "Hello Sathi",
                    text: "Generating your image, please wait...",
                    avatar: BotAvatar,
                };
                setMessages((prevMessages) => [...prevMessages, botResponse]);

                // Generate image using OpenAI API
                const imageUrl = await generateImage(input);
                const botResponseImage = {
                    username: "Hello Sathi",
                    text: `<img src="${imageUrl}" alt="Generated" style="max-width: 100%; max-height: 300px;" />`,
                    avatar: BotAvatar,
                };
                setMessages((prevMessages) => [...prevMessages, botResponseImage]);
                handleTextToSpeech("Here is the image you requested.");
            } else {
                // Handle text response
                const botResponse = {
                    username: "Hello Sathi",
                    text: botResponseText,
                    avatar: BotAvatar,
                };
                setMessages((prevMessages) => [...prevMessages, botResponse]);
                handleTextToSpeech(botResponseText);
            }
        } catch (error) {
            console.error("Error calling the chat API:", error);
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
        console.log('Uploading file:', file.name);
        const response = await fetch("http://localhost:5500/upload", {
          method: "POST",
          body: formData,
        });
    
        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const data = await response.json();
        console.log('Server response:', data);
    
        if (data.success) {
          const userMessage = {
            username: "You",
            text: `File: <a href="${data.fileUrl}" target="_blank">${file.name}</a>`,
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
        console.error("File upload error:", error);
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
      console.log('Invalid file type:', file?.type);
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
        console.error("Speech recognition is not supported in this browser.");
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
                handleSend(); // Automatically send message when speech recognition finalizes
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        setInterimText(interimTranscript);
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error", event);
        setIsListening(false);
    };

    recognition.onend = () => {
        setIsListening(false);
    };
};



  const handleTextToSpeech = (text) => {
    if (!text.startsWith("http")) {
      const utterance = new SpeechSynthesisUtterance(text);
      const samanthaVoice = voices.find((voice) => voice.name === "Samantha");
      if (samanthaVoice) {
        utterance.voice = samanthaVoice;
      }
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="chat-page">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src={Logo} className="sidebar-logo" alt="Hello Sathi Logo" />
          <h2 className="sidebar-title">My Chats</h2>
        </div>
        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Search"
            className="sidebar-search-input"
          />
        </div>
        <div className="sidebar-folders">
          <h3>Favourites</h3>
          <ul>
            <li>Work chats</li>
            <li>Life chats</li>
            <li>Project chats</li>
            <li>Client chats</li>
          </ul>
        </div>
        <div className="sidebar-chats">
          <h3>History</h3>
          {messages.map((message, index) => (
            <div key={index} className="history-item">
              <img
                src={message.avatar}
                className="history-avatar"
                alt={`${message.username} Avatar`}
              />
              <div className="history-text">
                <span className="history-username">{message.username}</span>
                <span className="history-message">{message.text}</span>
              </div>
            </div>
          ))}
        </div>
        <button className="new-chat-button" onClick={showInitialMessage}>
          New chat
        </button>
      </aside>
      <div className="chat-container">
        <div className="chat-header">
          <h3>Hello Sathi Your Learning Assistant</h3>
        </div>
        <div className="chat-history">
          {messages.length === 0 && (
            <div className="welcome-message">
              <p>Start a conversation to see messages here.</p>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${
                message.username === "You" ? "self" : "bot"
              }`}
            >
              <img
                src={message.avatar}
                className="chat-avatar"
                alt={`${message.username} Avatar`}
              />
              <div className="chat-bubble">
                {typeof message.text === "string" && message.text.startsWith("http") && (message.text.endsWith(".png") || message.text.endsWith(".jpg") || message.text.endsWith(".jpeg")) ? (
                  <img
                    src={message.text}
                    alt="Generated"
                    style={{ maxWidth: '100%', maxHeight: '300px' }}
                  />
                ) : (
                  <span
                    className="chat-text"
                    dangerouslySetInnerHTML={{ __html: message.text }}
                  />
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-message bot">
              <img
                src={BotAvatar}
                className="chat-avatar"
                alt="Hello Sathi Avatar"
              />
              <div className="chat-bubble">
                <span className="chat-text">Processing......</span>
              </div>
            </div>
          )}
          {isListening && (
            <div className="chat-message bot">
              <img
                src={BotAvatar}
                className="chat-avatar"
                alt="Hello Sathi Avatar"
              />
              <div className="chat-bubble">
                <span className="chat-text">Listening...</span>
              </div>
            </div>
          )}
          {interimText && (
            <div className="chat-message self">
              <img src={UserAvatar} className="chat-avatar" alt="User Avatar" />
              <div className="chat-bubble">
                <span className="chat-text">{interimText}</span>
              </div>
            </div>
          )}
        </div>
        <form className="chat-input-container" onSubmit={handleSend}>
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={handleInput}
            placeholder="Type your message..."
          />
          <button
            type="button"
            className="icon-button"
            onClick={handleSpeechToText}
          >
            <i className="fas fa-microphone"></i>
          </button>
          <label htmlFor="file-upload" className="icon-button">
            <i className="fas fa-paperclip"></i>
          </label>
          <input
            id="file-upload"
            type="file"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
          <button
            type="submit"
            className="chat-send-button"
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
