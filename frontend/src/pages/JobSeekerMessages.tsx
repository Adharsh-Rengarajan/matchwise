import { useState, useEffect, useRef } from 'react'
import '../styles/jobseeker-messages.css'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  timestamp: string
  is_read: boolean
  sender_type: 'jobseeker' | 'recruiter'
}

interface Conversation {
  id: string
  recruiter_id: string
  recruiter_name: string
  company: string
  job_title: string
  last_message: string
  last_message_time: string
  unread_count: number
}

const JobSeekerMessages = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      recruiter_id: 'rec1',
      recruiter_name: 'Sarah Johnson',
      company: 'TechCorp',
      job_title: 'Senior Frontend Developer',
      last_message: 'Thank you for applying. Your profile looks impressive.',
      last_message_time: '10:32 AM',
      unread_count: 0
    },
    {
      id: '2',
      recruiter_id: 'rec2',
      recruiter_name: 'Michael Chen',
      company: 'StartupXYZ',
      job_title: 'React Developer',
      last_message: 'Would you be available for a technical interview next week?',
      last_message_time: '2m ago',
      unread_count: 1
    },
    {
      id: '3',
      recruiter_id: 'rec3',
      recruiter_name: 'Emily Rodriguez',
      company: 'Digital Solutions',
      job_title: 'Full Stack Engineer',
      last_message: 'We received your application and will review it soon.',
      last_message_time: '1h ago',
      unread_count: 0
    }
  ])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAISuggestions, setShowAISuggestions] = useState(false)

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
      markAsRead(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = (conversationId: string) => {
    const mockMessages: Message[] = [
      {
        id: '1',
        sender_id: user.id,
        receiver_id: selectedConversation?.recruiter_id || 'rec1',
        content: 'Hi! I applied for the Senior Frontend Developer position.',
        timestamp: '10:30 AM',
        is_read: true,
        sender_type: 'jobseeker'
      },
      {
        id: '2',
        sender_id: selectedConversation?.recruiter_id || 'rec1',
        receiver_id: user.id,
        content: 'Hello! Thank you for applying. Your profile looks impressive.',
        timestamp: '10:32 AM',
        is_read: true,
        sender_type: 'recruiter'
      },
      {
        id: '3',
        sender_id: user.id,
        receiver_id: selectedConversation?.recruiter_id || 'rec1',
        content: 'Thank you! I have 7 years of experience with React and TypeScript.',
        timestamp: '10:35 AM',
        is_read: true,
        sender_type: 'jobseeker'
      },
      {
        id: '4',
        sender_id: selectedConversation?.recruiter_id || 'rec1',
        receiver_id: user.id,
        content: 'Great! Would you be available for a technical interview next week?',
        timestamp: '10:40 AM',
        is_read: true,
        sender_type: 'recruiter'
      },
      {
        id: '5',
        sender_id: user.id,
        receiver_id: selectedConversation?.recruiter_id || 'rec1',
        content: 'Yes, I am available. What day works best for you?',
        timestamp: '10:42 AM',
        is_read: true,
        sender_type: 'jobseeker'
      },
      {
        id: '6',
        sender_id: user.id,
        receiver_id: selectedConversation?.recruiter_id || 'rec1',
        content: 'Thank you for considering my application!',
        timestamp: '10:45 AM',
        is_read: true,
        sender_type: 'jobseeker'
      }
    ]
    setMessages(mockMessages)
  }

  const markAsRead = (conversationId: string) => {
    setConversations(conversations.map(conv =>
      conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
    ))
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: Date.now().toString(),
      sender_id: user.id,
      receiver_id: selectedConversation.recruiter_id,
      content: newMessage,
      timestamp: 'Now',
      is_read: false,
      sender_type: 'jobseeker'
    }

    setMessages([...messages, message])
    setNewMessage('')
    setShowAISuggestions(false)

    setConversations(conversations.map(conv =>
      conv.id === selectedConversation.id
        ? { ...conv, last_message: newMessage, last_message_time: 'Now' }
        : conv
    ))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const aiSuggestions = [
    "Thank you for reaching out! I'm very interested in this opportunity.",
    "I'd be happy to schedule an interview. What times work best for you?",
    "Could you provide more details about the role and responsibilities?",
    "I have experience with the technologies mentioned. When can we discuss further?"
  ]

  const filteredConversations = conversations.filter(conv =>
    conv.recruiter_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.job_title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="jobseeker-messages">
      <div className="messages-container">
        <div className="conversations-panel">
          <div className="panel-header">
            <h2>Messages</h2>
            <p>Communicate with recruiters</p>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="conversations-list">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="avatar">
                  {getInitials(conv.recruiter_name)}
                </div>
                <div className="conversation-info">
                  <div className="conversation-header">
                    <h4>{conv.recruiter_name}</h4>
                    <span className="time">{conv.last_message_time}</span>
                  </div>
                  <p className="job-position">{conv.job_title} at {conv.company}</p>
                  <p className="last-message">{conv.last_message}</p>
                </div>
                {conv.unread_count > 0 && (
                  <div className="unread-badge">{conv.unread_count}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="chat-panel">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <div className="avatar-small">
                  {getInitials(selectedConversation.recruiter_name)}
                </div>
                <div className="header-info">
                  <h3>{selectedConversation.recruiter_name}</h3>
                  <p>{selectedConversation.job_title} at {selectedConversation.company}</p>
                </div>
                <button 
                  className="ai-suggestions-btn"
                  onClick={() => setShowAISuggestions(!showAISuggestions)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#5b5fc7">
                    <path d="M12 2L2 7L12 12L22 7L12 2ZM12 17L2 12V17L12 22L22 17V12L12 17Z"/>
                  </svg>
                  AI Suggestions
                </button>
              </div>

              <div className="messages-list">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.sender_type === 'jobseeker' ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{message.content}</p>
                      <span className="message-time">{message.timestamp}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {showAISuggestions && (
                <div className="ai-suggestions">
                  <h4>AI Suggested Responses</h4>
                  <div className="suggestions-grid">
                    {aiSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="suggestion-item"
                        onClick={() => {
                          setNewMessage(suggestion)
                          setShowAISuggestions(false)
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="message-input-container">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="message-input"
                  rows={2}
                />
                <button
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z"/>
                  </svg>
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="no-conversation">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="#d1d5db">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z"/>
              </svg>
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the left to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobSeekerMessages