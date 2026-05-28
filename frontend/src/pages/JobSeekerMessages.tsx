import { useState, useEffect, useRef } from 'react'
import styles from '../styles/jobseeker-messages.module.css'
import { API_ENDPOINTS, apiRequest } from '../config/api'

interface Conversation {
  participantId: string
  participantName: string
  company?: string
  jobTitle?: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  avatarColor: string
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  isOpened: boolean
}

const JobSeekerMessages = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userId = user._id || user.id

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAISuggestions, setShowAISuggestions] = useState(false)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.participantId)
      markAsRead(selectedConversation.participantId)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await apiRequest(API_ENDPOINTS.GET_USER_CONVERSATIONS(userId))
      const data = await response.json()

      const list: Conversation[] = (data.data || []).map((conv: any) => ({
        participantId: conv.participantId,
        participantName:
          conv.participantName && conv.participantName.trim()
            ? conv.participantName
            : 'Recruiter',
        company: conv.company || '',
        jobTitle: conv.jobTitle || '',
        lastMessage: conv.lastMessage?.trim() ? conv.lastMessage : 'No messages yet',
        timestamp: conv.timestamp || new Date().toISOString(),
        unreadCount: conv.unreadCount || 0,
        avatarColor: conv.avatarColor || '#6366f1'
      }))

      setConversations(list)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (otherUserId: string) => {
    try {
      const response = await apiRequest(API_ENDPOINTS.GET_CONVERSATION(userId, otherUserId))
      const data = await response.json()
      setMessages(data.data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const markAsRead = async (otherUserId: string) => {
    try {
      await apiRequest(API_ENDPOINTS.MARK_MESSAGES_READ, {
        method: 'PATCH',
        body: JSON.stringify({ sender_id: otherUserId, receiver_id: userId })
      })
      setConversations(prev =>
        prev.map(c => (c.participantId === otherUserId ? { ...c, unreadCount: 0 } : c))
      )
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const content = newMessage.trim()
    setNewMessage('')
    setShowAISuggestions(false)

    try {
      const response = await apiRequest(API_ENDPOINTS.SEND_MESSAGE, {
        method: 'POST',
        body: JSON.stringify({
          sender_id: userId,
          receiver_id: selectedConversation.participantId,
          content,
          message_type: 'text',
          isOpened: false
        })
      })

      if (response.ok) {
        await fetchMessages(selectedConversation.participantId)
        await fetchConversations()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const aiSuggestions = [
    "Thank you for reaching out! I'm very interested in this opportunity.",
    "I'd be happy to schedule an interview. What times work best for you?",
    "Could you provide more details about the role and responsibilities?",
    "I have experience with the technologies mentioned. When can we discuss further?"
  ]

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.jobTitle || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={styles.jobseekerMessages}>
      <div className={styles.messagesContainer}>
        <div className={styles.conversationsPanel}>
          <div className={styles.panelHeader}>
            <h2>Messages</h2>
            <p>Communicate with recruiters</p>
          </div>

          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.conversationsList}>
            {loading ? (
              <p style={{ padding: '1rem', color: '#6b7280' }}>Loading...</p>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <div
                  key={conv.participantId}
                  className={`${styles.conversationItem} ${
                    selectedConversation?.participantId === conv.participantId ? styles.active : ''
                  }`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className={styles.avatar} style={{ backgroundColor: conv.avatarColor }}>
                    {getInitials(conv.participantName)}
                  </div>
                  <div className={styles.conversationInfo}>
                    <div className={styles.conversationHeader}>
                      <h4>{conv.participantName}</h4>
                      <span className={styles.time}>{formatTime(conv.timestamp)}</span>
                    </div>
                    {(conv.jobTitle || conv.company) && (
                      <p className={styles.jobPosition}>
                        {[conv.jobTitle, conv.company].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p className={styles.lastMessage}>{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className={styles.unreadBadge}>{conv.unreadCount}</div>
                  )}
                </div>
              ))
            ) : (
              <p style={{ padding: '1rem', color: '#6b7280' }}>
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
            )}
          </div>
        </div>

        <div className={styles.chatPanel}>
          {selectedConversation ? (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.avatarSmall}>
                  {getInitials(selectedConversation.participantName)}
                </div>
                <div className={styles.headerInfo}>
                  <h3>{selectedConversation.participantName}</h3>
                  {(selectedConversation.jobTitle || selectedConversation.company) && (
                    <p>
                      {[selectedConversation.jobTitle, selectedConversation.company]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  )}
                </div>
                <button
                  className={styles.aiSuggestionsBtn}
                  onClick={() => setShowAISuggestions(!showAISuggestions)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#5b5fc7">
                    <path d="M12 2L2 7L12 12L22 7L12 2ZM12 17L2 12V17L12 22L22 17V12L12 17Z" />
                  </svg>
                  AI Suggestions
                </button>
              </div>

              <div className={styles.messagesList}>
                {messages.length > 0 ? (
                  messages.map((message) => {
                    const isSent = message.sender_id === userId
                    return (
                      <div
                        key={message.id}
                        className={`${styles.message} ${isSent ? styles.sent : styles.received}`}
                      >
                        <div className={styles.messageContent}>
                          <p>{message.content}</p>
                          <span className={styles.messageTime}>
                            {formatTime(message.created_at)}
                          </span>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>
                    No messages yet. Say hello!
                  </p>
                )}
                <div ref={messagesEndRef} />
              </div>

              {showAISuggestions && (
                <div className={styles.aiSuggestions}>
                  <h4>AI Suggested Responses</h4>
                  <div className={styles.suggestionsGrid}>
                    {aiSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className={styles.suggestionItem}
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

              <div className={styles.messageInputContainer}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className={styles.messageInput}
                  rows={2}
                />
                <button
                  className={styles.sendButton}
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" />
                  </svg>
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className={styles.noConversation}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="#d1d5db">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" />
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

export default JobSeekerMessages;