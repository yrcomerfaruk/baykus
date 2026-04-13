'use client'

interface SuggestedQuestionsProps {
  onQuestionClick: (question: string) => void
}

const SUGGESTED_QUESTIONS = [
  'YKS matematik konulari neler?',
  'TYT fizik formülleri listesi',
  'AYT edebiyat roman özetleri',
  'YKS sinavi kaç soru?',
  'TYT kimya periyodik tablo',
  'AYT matematik trigonometri ',
  'YKS sinavi takvimi ne zaman?',
  'TYT biyoloji hücre konulari',
  'AYT tarih konulari nelerdir?',
]

export default function SuggestedQuestions({ onQuestionClick }: SuggestedQuestionsProps) {
  return (
    <div className="space-y-1">
      {SUGGESTED_QUESTIONS.map((question, index) => (
        <div
          key={index}
          onClick={() => onQuestionClick(question)}
          className="text-xs text-[#0c003d] hover:text-[#0c003d] hover:font-semibold cursor-pointer transition-colors py-1 px-1 hover:bg-gray-50 rounded"
        >
          {question}
        </div>
      ))}
    </div>
  )
}
