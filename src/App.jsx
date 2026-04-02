import { useState, useEffect } from 'react'
import Markdown from 'react-markdown'
import { GEMINI_URL } from './constants'
import './App.css'

function App() {
  
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])

  
  useEffect(() => {
    const savedChat = localStorage.getItem("gemini_chat_history")
    if (savedChat) setMessages(JSON.parse(savedChat))
  }, [])

  // Auto-save history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("gemini_chat_history", JSON.stringify(messages))
    }
  }, [messages])

  const askQuestion = async () => {
    if (!question.trim()) return

    const userMsg = { role: "user", text: question }
    setMessages((prev) => [...prev, userMsg])
    const currentQuestion = question
    setQuestion('')

    const payload = {
      contents: [{ parts: [{ text: currentQuestion }] }],
      tools: [{ google_search: {} }]
    }

    try {
      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      if (data?.candidates?.[0]?.content) {
        const aiText = data.candidates[0].content.parts[0].text
        setMessages((prev) => [...prev, { role: "model", text: aiText }])
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "model", text: "I'm having trouble connecting. Try again!" }])
    }
  }

  const clearChat = () => {
    setMessages([])
    localStorage.removeItem("gemini_chat_history")
  }

  return (
    <div className="app-container">
      
      <div className="action-bar">
        <button className="new-chat-btn" onClick={clearChat}>
          + New Chat
        </button>
      </div>

      <div className="main-ui">
        <div className="main-content">
          <div className="container">
            {messages.length === 0 && (
              <div className="welcome-screen">
                <h1 className="gradient-text">Gemini Clone</h1>
                <p className="sub-text">by Omkesh Yannawar</p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={index} className={`message-box ${msg.role}`}>
                <div className="avatar">
                  {msg.role === 'user' ? '👤' : '✨'}
                </div>
                <div className="content">
                  <Markdown>{msg.text}</Markdown>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="input-area">
          <div className="input-field">
            <input 
              type="text" 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder='Ask Gemini...' 
              onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
            />
            <button onClick={askQuestion}>Ask</button>
          </div>
          <p className="footer-info">Grounding enabled: Real-time search is active.</p>
        </div>
      </div>
    </div>
  )
}

export default App