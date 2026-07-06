'use client'

import { useState } from 'react'

interface FaqItem {
  question: string
  answer: string
}

interface FaqAccordionProps {
  items: FaqItem[]
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="border border-border rounded-radius-card overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-background-alt transition-colors"
          >
            <span className="font-medium text-foreground">{item.question}</span>
            <svg
              className={`w-5 h-5 text-muted-foreground transition-transform ${
                openIndex === index ? 'rotate-180' : ''
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {openIndex === index && (
            <div className="px-6 pb-4 bg-white">
              <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
