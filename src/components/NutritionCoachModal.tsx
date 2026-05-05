import { useState, useRef, useEffect } from 'react'
import { AIService } from '../services/aiService'
import { useAuthStore } from '../stores/authStore'
import type { ChatMessage } from '../services/aiService'

interface NutritionCoachModalProps {
  isOpen: boolean
  onClose: () => void
}

const NutritionCoachModal: React.FC<NutritionCoachModalProps> = ({ isOpen, onClose }) => {
  const { userProfile } = useAuthStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Hi there! 👋 I'm your AI Nutrition Coach! I'm here to help you with any questions about nutrition, meal planning, healthy eating habits, or your fitness goals. 

Based on your profile, I can see you're working towards your health goals. What would you like to know today? 

Some things I can help with:
• Meal planning and recipe suggestions
• Nutrition advice for your goals
• Healthy eating tips and habits
• Questions about specific foods
• Motivation and support

What's on your mind? 🤔`,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length])

  const sendMessage = async () => {
    if (!inputMessage.trim() || !userProfile || isLoading) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      console.log('💬 NutritionCoach: Sending message...', inputMessage)
      const response = await AIService.getChatResponse(
        inputMessage.trim(),
        userProfile,
        `session-${userProfile.email || 'default'}`
      )

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('❌ NutritionCoach: Failed to get response', error)
      
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment! In the meantime, remember to stay hydrated and keep up with your healthy eating habits! 💪",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setInputMessage('')
    // Clear LangChain conversation memory
    if (userProfile?.email) {
      AIService.clearConversationHistory(`session-${userProfile.email}`)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-4xl w-full h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🧠 AI Nutrition Coach</h2>
            <p className="text-gray-600">Your personal nutrition expert & motivational coach</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="btn-secondary text-sm"
            >
              🗑️ Clear Chat
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-green-500 text-white'
                    : 'glass-card border border-gray-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="text-lg">
                    {message.role === 'user' ? '👤' : '🧠'}
                  </div>
                  <div className="flex-1">
                    <div className={`${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                      {message.content.split('\n').map((line, index) => (
                        <div key={index}>
                          {line}
                          {index < message.content.split('\n').length - 1 && <br />}
                        </div>
                      ))}
                    </div>
                    <div className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="glass-card border border-gray-200 p-4 rounded-lg max-w-[80%]">
                <div className="flex items-center gap-2">
                  <div className="text-lg">🧠</div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-gray-600 ml-2">AI Coach is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about nutrition, meal planning, or healthy eating..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '🤖' : '📤'} Send
            </button>
          </div>
          
          {/* Quick Questions */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Quick questions to get started:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "What should I eat for breakfast?",
                "How can I gain weight healthily?",
                "Best vegetarian protein sources?",
                "Meal prep tips for the week?"
              ].map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(question)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                  disabled={isLoading}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NutritionCoachModal
