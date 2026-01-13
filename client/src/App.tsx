import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import './App.css'

const socket = io('http://localhost:3000')

function App() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])

  useEffect(() => {
    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg])
    })

    return () => {
      socket.off('receive_message')
    }
  }, [])

  const sendMessage = () => {
    if (message.trim() === '') return
    socket.emit('send_message', message)
    setMessage('')
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>💬 Simple Chat</h2>

      <div style={{
        border: '1px solid #ccc',
        height: 300,
        padding: 10,
        overflowY: 'auto',
        marginBottom: 10
      }}>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  )
}

export default App
