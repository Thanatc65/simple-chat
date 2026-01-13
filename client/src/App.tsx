import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import './App.css'

interface ChatMessage {
  user: string
  text: string
  timestamp: string
}

const socket: Socket = io('http://localhost:3000')

function App() {
  const [username, setUsername] = useState('')
  const [joined, setJoined] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    socket.on('receive_message', (data: ChatMessage) => {
      setMessages((prev) => [...prev, data])
    })
    return () => { socket.off('receive_message') }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const joinChat = () => {
    if (!username.trim()) return
    setJoined(true)
  }

  const sendMessage = () => {
    if (!message.trim()) return
    const msgData = {
      user: username,
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    socket.emit('send_message', msgData)
    setMessage('')
    inputRef.current?.focus()
  }

  if (!joined) {
    return (
      <div className="container">
        <div className="auth-card">
          <div className="logo-icon">💬</div>
          <h1>QuickChat</h1>
          <p>Enter a display name to start chatting</p>
          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && joinChat()}
              autoFocus
            />
            <button className="btn-primary" onClick={joinChat}>Join Room</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="chat-window">
        <header className="chat-header">
          <div className="status-indicator"></div>
          <div>
            <h2>Global Lounge</h2>
            <span>{messages.length} messages</span>
          </div>
        </header>

        <div className="chat-body">
          {messages.map((msg, index) => (
            <div key={index} className={`message-row ${msg.user === username ? 'me' : 'them'}`}>
              <div className="message-content">
                {msg.user !== username && <span className="message-user">{msg.user}</span>}
                <div className="message-bubble">
                  {msg.text}
                  <span className="message-time">{msg.timestamp}</span>
                </div>
              </div>
            </div>
            
          ))}
          <div ref={bottomRef} />
        </div>

        <footer className="chat-footer">
          <input
            ref={inputRef}
            type="text"
            placeholder="Write a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button className="send-btn" onClick={sendMessage}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </footer>
      </div>
    </div>
  )
}

export default App