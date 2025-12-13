import { useState, useEffect, useRef } from 'react'
import styles from '../styles/messages.module.css'
import { API_ENDPOINTS, apiRequest } from '../config/api'

interface Conversation {
  _id: string
  participantName: string
  jobTitle?: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  avatarColor: string
}

interface Message {
  _id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  isOpened: boolean
}

interface SendMessageParams {
  sender_id: string
  receiver_id: string
  content: string
}

const Messages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userId = user._id || user.id

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId)
      markAsRead(selectedConversationId)
    }
  }, [selectedConversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateColorFromString = (str: string): string => {
    const colors = [
      '#3B82F6',
      '#EF4444',
      '#10B981',
      '#F59E0B',
      '#8B5CF6',
      '#EC4899',
      '#06B6D4',
      '#F97316'
    ]
    if (!str) return colors[0]
    const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const extractParticipantName = (conv: any): string => {
    if (conv.participantName && conv.participantName.trim()) {
      return conv.participantName
    }
    if (conv.jobseekerData?.[0]?.full_name) {
      return conv.jobseekerData[0].full_name
    }
    if (conv.recruiterData?.[0]?.full_name) {
      return conv.recruiterData[0].full_name
    }
    if (conv.full_name && conv.full_name.trim()) {
      return conv.full_name
    }
    return 'Unknown'
  }

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await apiRequest(API_ENDPOINTS.GET_RECRUITER_CONVERSATIONS(userId))
      const data = await response.json()

      const conversationList: Conversation[] = (data.data || []).map((conv: any) => {
        const participantName = extractParticipantName(conv)
        const lastMsg = conv.lastMessage?.trim() ? conv.lastMessage : 'No messages yet'
        const jobTitle = conv.jobTitle || ''

        return {
          _id: conv._id,
          participantName,
          jobTitle,
          lastMessage: lastMsg,
          timestamp: conv.timestamp || new Date().toISOString(),
          unreadCount: conv.unreadCount || 0,
          avatarColor: generateColorFromString(participantName)
        }
      })

      setConversations(conversationList)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching conversations:', error)
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
        body: JSON.stringify({
          sender_id: otherUserId,
          receiver_id: userId
        })
      })
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const sendMessage = async (params: SendMessageParams) => {
    try {
      const response = await apiRequest(API_ENDPOINTS.SEND_MESSAGE, {
        method: 'POST',
        body: JSON.stringify({
          sender_id: params.sender_id,
          receiver_id: params.receiver_id,
          content: params.content,
          message_type: 'text',
          isOpened: false
        })
      })

      if (response.ok) {
        return { success: true }
      }
      return { success: false }
    } catch (error) {
      console.error('Error sending message:', error)
      return { success: false }
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversationId) return

    const selected = conversations.find(c => c._id === selectedConversationId)
    if (!selected) return

    const result = await sendMessage({
      sender_id: userId,
      receiver_id: selected._id,
      content: messageInput
    })

    if (result.success) {
      setMessageInput('')
      fetchMessages(selected._id)
      fetchConversations()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const filtered = conversations.filter(c =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selected = conversations.find(c => c._id === selectedConversationId)

  const totalUnreadCount = conversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0
  )

  return (
    <div className={styles.messagesContainer}>
      <div className={styles.conversationsSidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.headerTitleWrapper}>
            <h2>Messages</h2>
            {totalUnreadCount > 0 && (
              <span className={styles.totalUnreadBadge}>{totalUnreadCount}</span>
            )}
          </div>
        </div>

        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.conversationsList}>
          {loading ? (
            <div className={styles.loadingState}>
              <p>Loading...</p>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((conv) => (
              <div
                key={conv._id}
                className={`${styles.conversationItem} ${
                  selectedConversationId === conv._id ? styles.active : ''
                }`}
                onClick={() => setSelectedConversationId(conv._id)}
              >
                <div
                  className={styles.avatar}
                  style={{ backgroundColor: conv.avatarColor }}
                >
                  {conv.participantName.charAt(0).toUpperCase()}
                </div>
                <div className={styles.conversationInfo}>
                  <h4 className={styles.conversationName}>{conv.participantName}</h4>
                  <p className={styles.lastMessage}>{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className={styles.unreadBadge}>{conv.unreadCount}</span>
                )}
              </div>
            ))
          ) : (
            <div className={styles.noConversations}>
              <p>{searchQuery ? 'No conversations found' : 'No conversations'}</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.messageContent}>
        {selected ? (
          <>
            <div className={styles.messageHeader}>
              <h3>{selected.participantName}</h3>
              {selected.jobTitle && <p>{selected.jobTitle}</p>}
            </div>

            <div className={styles.messagesList}>
              {messages.length > 0 ? (
                messages.map((msg) => {
                  const isSent = msg.sender_id === userId
                  const isUnopenedReceived = !isSent && !msg.isOpened

                  return (
                    <div
                      key={msg._id}
                      className={`${styles.messageBubble} ${isSent ? styles.sent : styles.received} ${
                        isUnopenedReceived ? styles.unopened : ''
                      }`}
                    >
                      <div className={styles.messageText}>{msg.content}</div>
                      <span className={styles.messageTime}>
                        {new Date(msg.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )
                })
              ) : (
                <p className={styles.noMessages}>No messages</p>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.messageInputArea}>
              <textarea
                className={styles.messageInput}
                placeholder="Type message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                className={styles.sendBtn}
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className={styles.noSelectedConversation}>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages;