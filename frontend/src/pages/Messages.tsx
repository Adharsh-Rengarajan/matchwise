import { useState } from 'react'
import '../styles/messages.css'

interface Message {
  id: string
  candidateName: string
  candidateId: string
  jobTitle: string
  lastMessage: string
  timestamp: string
  unread: boolean
  messages: Array<{
    sender: 'candidate' | 'recruiter'
    content: string
    timestamp: string
  }>
}

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')
  
  const mockConversations: Message[] = [
    {
      id: '1',
      candidateName: 'Sarah Johnson',
      candidateId: 'SJ',
      jobTitle: 'Senior Frontend Developer',
      lastMessage: 'Thank you for considering my application!',
      timestamp: '2m ago',
      unread: true,
      messages: [
        {
          sender: 'candidate',
          content: "Hi! I applied for the Senior Frontend Developer position.",
          timestamp: '10:30 AM'
        },
        {
          sender: 'recruiter',
          content: "Hello Sarah! Thank you for applying. Your profile looks impressive.",
          timestamp: '10:32 AM'
        },
        {
          sender: 'candidate',
          content: "Thank you! I have 7 years of experience with React and TypeScript.",
          timestamp: '10:35 AM'
        },
        {
          sender: 'recruiter',
          content: "Great! Would you be available for a technical interview next week?",
          timestamp: '10:40 AM'
        },
        {
          sender: 'candidate',
          content: "Yes, I am available. What day works best for you?",
          timestamp: '10:42 AM'
        },
        {
          sender: 'candidate',
          content: "Thank you for considering my application!",
          timestamp: '10:45 AM'
        }
      ]
    },
    {
      id: '2',
      candidateName: 'Michael Chen',
      candidateId: 'MC',
      jobTitle: 'Product Manager',
      lastMessage: 'I would love to discuss the role further',
      timestamp: '1h ago',
      unread: false,
      messages: [
        {
          sender: 'candidate',
          content: "I would love to discuss the role further",
          timestamp: '9:00 AM'
        }
      ]
    },
    {
      id: '3',
      candidateName: 'Emily Rodriguez',
      candidateId: 'ER',
      jobTitle: 'UX Designer',
      lastMessage: 'When would be a good time for an interview?',
      timestamp: '3h ago',
      unread: true,
      messages: [
        {
          sender: 'candidate',
          content: "When would be a good time for an interview?",
          timestamp: '7:30 AM'
        }
      ]
    },
    {
      id: '4',
      candidateName: 'David Kim',
      candidateId: 'DK',
      jobTitle: 'Backend Engineer',
      lastMessage: 'I have experience with similar projects',
      timestamp: '1d ago',
      unread: false,
      messages: [
        {
          sender: 'candidate',
          content: "I have experience with similar projects",
          timestamp: 'Yesterday'
        }
      ]
    }
  ]
  
  const filteredConversations = mockConversations.filter(conv =>
    conv.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const selectedConv = mockConversations.find(c => c.id === selectedConversation)
  
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConv) return
    
    console.log('Sending message:', newMessage)
    setNewMessage('')
  }
  
  return (
    <div className="messages-container">
      <div className="conversations-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
          <p>Communicate with candidates</p>
        </div>
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="conversations-list">
          {filteredConversations.map(conv => (
            <div
              key={conv.id}
              className={`conversation-item ${selectedConversation === conv.id ? 'active' : ''} ${conv.unread ? 'unread' : ''}`}
              onClick={() => setSelectedConversation(conv.id)}
            >
              <div className="avatar">
                <span>{conv.candidateId}</span>
              </div>
              <div className="conversation-info">
                <div className="conversation-header">
                  <h4>{conv.candidateName}</h4>
                  <span className="timestamp">{conv.timestamp}</span>
                </div>
                <p className="job-title">{conv.jobTitle}</p>
                <p className="last-message">{conv.lastMessage}</p>
              </div>
              {conv.unread && <div className="unread-indicator"></div>}
            </div>
          ))}
        </div>
      </div>
      
      <div className="message-content">
        {selectedConv ? (
          <>
            <div className="message-header">
              <div className="header-info">
                <div className="avatar">
                  <span>{selectedConv.candidateId}</span>
                </div>
                <div>
                  <h3>{selectedConv.candidateName}</h3>
                  <p>{selectedConv.jobTitle}</p>
                </div>
              </div>
            </div>
            
            <div className="messages-display">
              <div className="messages-list">
                {selectedConv.messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.sender}`}>
                    <div className="message-bubble">
                      <p>{msg.content}</p>
                      <span className="message-time">{msg.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="message-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage()
                  }
                }}
              />
              <button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="no-conversation">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            <h3>Select a conversation</h3>
            <p>Choose a candidate from the list to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages