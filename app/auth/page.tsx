'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff } from 'lucide-react'
import Loading from '@/components/Loading'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (isLogin) {
      const { error } = await signIn(email, password)
      if (error) {
        setError('E-posta veya şifre hatalı')
        setLoading(false)
      } else {
        // Wait for auth state to update then redirect
        setTimeout(() => {
          window.location.href = '/chat'
        }, 500)
      }
    } else {
      if (!name.trim()) {
        setError('Lütfen adınızı girin')
        setLoading(false)
        return
      }
      const { error } = await signUp(email, password, name)
      if (error) {
        setError('Kayıt olurken bir hata oluştu')
        setLoading(false)
      } else {
        // Wait for auth state to update then redirect
        setTimeout(() => {
          window.location.href = '/chat'
        }, 500)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 relative">
      {/* Full-page Loading Overlay */}
      {loading && <Loading />}

      <div className="w-full max-w-sm">
        <div className="border-2 border-[#0c003d] rounded-2xl p-6 bg-white">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/baykus.png" alt="Baykuş" width="60" height="46" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-black mb-1.5">Adınız</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ömer"
                  className="w-full px-3 py-2.5 border-2 border-[#0c003d] rounded-lg text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#0c003d]"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-black mb-1.5">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mailadınız@gmail.com"
                className="w-full px-3 py-2.5 border-2 border-[#0c003d] rounded-lg text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#0c003d]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-1.5">Şifre</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="*********"
                  className="w-full px-3 py-2.5 border-2 border-[#0c003d] rounded-lg text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#0c003d] pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0c003d]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0c003d] text-white font-semibold text-sm rounded-lg hover:bg-[#1a0052] transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Yükleniyor...' : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-black">
            {isLogin ? 'Hesabın yok mu? ' : 'Hesabın var mı? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-[#0c003d] hover:underline"
            >
              {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
