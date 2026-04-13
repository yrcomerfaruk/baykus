'use client'

import { useState, useEffect, useRef, memo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Send, Clock } from 'lucide-react'
import SuggestedQuestions from '@/components/SuggestedQuestions'
import Loading from '@/components/Loading'
import { query } from '@/lib/chat'
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  rating?: 'up' | 'down' | null
}

export default function ChatPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showQuestions, setShowQuestions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadMessages()
    }
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Load messages error:', error)
      return
    }

    if (data && data.length > 0) {
      setMessages(data)
    } else {
      // Show welcome message only if no messages exist
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Merhaba! Ben Baykuþ AI. YKS hazýrlýk sürecinde size yardýmcý olmak için buradayým. Matematik, Türkçe, Fizik, Kimya, Biyoloji, Tarih, Coðrafya ve Felsefe derslerinde sorularýnýzý yanýtlayabilirim. Hangi konuda destek almak istersiniz?',
        created_at: new Date().toISOString(),
      }
      setMessages([welcomeMessage])
    }
  }

  const handleSend = async (question?: string) => {
    const messageText = question || input
    if (!messageText.trim() || !user) return

    setLoading(true)
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')

    // Save user message to Supabase
    await supabase.from('messages').insert({
      user_id: user.id,
      role: 'user',
      content: messageText,
    })

    // Get real AI response
    try {
      const response = await query({ question: messageText })
      console.log('API Response:', response)
      
      let answerText = ''
      
      // Check different possible response structures
      if (response && typeof response === 'object') {
        answerText = response.answer || response.response || response.text || response.message || JSON.stringify(response)
      } else if (typeof response === 'string') {
        answerText = response
      } else {
        answerText = 'Üzgünüm, bir hata oldu. Lütfen tekrar deneyin.'
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: answerText,
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Save assistant message to Supabase
      await supabase.from('messages').insert({
        user_id: user.id,
        role: 'assistant',
        content: assistantMessage.content,
      })
    } catch (error) {
      console.error('Chat API error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Üzgünüm, bir hata oldu. Lütfen tekrar deneyin.',
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    setLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleRating = async (messageId: string, rating: 'up' | 'down') => {
    if (!user) return

    // Update local state
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, rating: msg.rating === rating ? null : rating }
        : msg
    ))

    // Save to Supabase
    try {
      const currentMessage = messages.find(m => m.id === messageId)
      const newRating = currentMessage?.rating === rating ? null : rating

      await supabase
        .from('messages')
        .update({ rating: newRating })
        .eq('id', messageId)
    } catch (error) {
      console.error('Rating save error:', error)
    }
  }

  if (authLoading || !user) {
    return <Loading />
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden">
      {/* Fixed Header Logo */}
      <div className="flex-none flex justify-center pt-4 pb-2 bg-white">
        <img src="/baykus.png" alt="Baykuş" width="50" height="38" />
      </div>

      {/* Main Chat Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
        <div className="max-w-xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
            </div>
          ) : (
            <div className="space-y-4 min-h-full">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' ? (
                      <div className="flex flex-col items-start max-w-[85%]">
                        <img src="/baykus.png" alt="" width="24" height="18" className="mb-1" />
                        <div className="py-1 text-black">
                          <div className="text-xs leading-relaxed markdown-content">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        </div>
                        {/* Rating Buttons */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleRating(message.id, 'up')}
                            className={`transition-colors ${message.rating === 'up' ? 'text-[#0c003d]' : 'text-gray-400 hover:text-green-500'}`}
                            title="Yardýmcý oldu"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.85-1.26l3.03-7.08c.09-.23.12-.47.12-.66v-2z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRating(message.id, 'down')}
                            className={`transition-colors ${message.rating === 'down' ? 'text-[#0c003d]' : 'text-gray-400 hover:text-red-500'}`}
                            title="Yardýmcý olmadý"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M23 3h-4v12h4V3zm-22 11c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2H6c-.83 0-1.54.5-1.85 1.26l-3.03 7.08c-.09.23-.12.47-.12.66v2z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-[85%] px-3 py-2 bg-[#0c003d] text-white rounded-2xl rounded-tr-sm">
                        <p className="text-xs">{message.content}</p>
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="flex flex-col items-start max-w-[85%]">
                      <img src="/baykus.png" alt="" width="24" height="18" className="mb-1" />
                      <div className="py-1 text-[#0c003d] text-xs">Yazıyor...</div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Input Area */}
      <div className="flex-none px-4 pb-2 pt-2 bg-white border-t border-gray-100 w-full">
        <div className="w-full max-w-xl mx-auto">
          <div className="flex items-center border-2 border-[#0c003d] rounded-full px-3 py-2 bg-white shadow-sm w-full">
            <button
              onClick={() => setShowQuestions(!showQuestions)}
              className="text-[#0c003d] mr-2 flex-shrink-0 hover:scale-110 transition-transform"
              title="Örnek sorular"
            >
              <Clock size={16} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Bana soru sor"
              className="flex-1 bg-transparent outline-none text-sm text-[#0c003d] placeholder-gray-400 min-w-0"
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="ml-2 text-[#0c003d] disabled:opacity-50 flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-1 mb-1">
            Demo amaçlı yapılmıştır. Veriler profesyonel koç verisi değildir!
          </p>
        </div>
      </div>

      {/* Balloon Popup */}
      {showQuestions && (
        <div className="fixed bottom-20 left-4 right-4 z-50">
          <div className="bg-white rounded-xl border border-[#0c003d] shadow-lg max-w-sm mx-auto">
            
            <div className="p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-[#0c003d]">Örnek Sorular</h3>
                <button
                  onClick={() => setShowQuestions(false)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path fillRule="evenodd" d="M3.268 3.268a.5.5 0 01.707 0L6 5.293l2.025-2.025a.5.5 0 01.708.708L6.707 6l2.025 2.025a.5.5 0 01-.708.708L6 6.707 3.975 8.732a.5.5 0 01-.708-.708L5.293 6 3.268 3.975a.5.5 0 010-.708z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto">
                <SuggestedQuestions onQuestionClick={(question) => {
                  handleSend(question)
                  setShowQuestions(false)
                }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
