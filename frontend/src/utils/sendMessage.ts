import { apiRequest, API_ENDPOINTS } from '../config/api'

interface SendMessageParams {
  sender_id: string
  receiver_id: string
  content: string
  token: string
}

interface SendMessageResponse {
  success: boolean
  message: string
  data?: any
}

export const sendMessage = async ({
  sender_id,
  receiver_id,
  content,
  token
}: SendMessageParams): Promise<SendMessageResponse> => {
  try {
    if (!content.trim()) {
      return {
        success: false,
        message: 'Message cannot be empty'
      }
    }

    if (!sender_id || !receiver_id) {
      return {
        success: false,
        message: 'Invalid sender or receiver ID'
      }
    }

    const response = await apiRequest(API_ENDPOINTS.SEND_MESSAGE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        sender_id,
        receiver_id,
        content: content.trim(),
        message_type: 'text',
        isOpened: false
      })
    })

    if (!response.ok) {
      return {
        success: false,
        message: 'Failed to send message'
      }
    }

    const data = await response.json()
    return {
      success: true,
      message: 'Message sent successfully',
      data
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    return {
      success: false,
      message: errorMessage
    }
  }
}