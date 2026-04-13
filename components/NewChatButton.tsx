'use client'

import { MessageSquarePlus } from 'lucide-react'

interface NewChatButtonProps {
  onClick: () => void
}

export default function NewChatButton({ onClick }: NewChatButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
      title="Yeni Sohbet"
    >
      <MessageSquarePlus size={20} className="text-[#0c003d]" />
    </button>
  )
}
