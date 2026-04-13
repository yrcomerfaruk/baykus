'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, X } from 'lucide-react'

interface AccountPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function AccountPopup({ isOpen, onClose }: AccountPopupProps) {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
      onClose()
    } catch (error) {
      console.error('Sign out error:', error)
    }
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />
      <div className="fixed top-16 left-4 bg-white rounded-xl shadow-lg border border-[#0c003d]/20 w-64 p-4">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-[#0c003d] transition-colors"
        >
          <X size={16} />
        </button>

        <div className="mb-4 pr-6">
          <p className="font-medium text-[#0c003d] text-sm">
            {user?.user_metadata?.full_name || 'Kullanıcı'}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user?.email}
          </p>
        </div>

        <button
          onClick={handleSignOut}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0c003d] text-white text-sm rounded-lg hover:bg-[#1a0066] transition-colors disabled:opacity-50"
        >
          <LogOut size={14} />
          <span>{loading ? 'Çıkıyor...' : 'Çıkış Yap'}</span>
        </button>
      </div>
    </div>
  )
}
