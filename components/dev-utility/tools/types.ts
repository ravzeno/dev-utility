import type { ReactNode } from 'react'

export type ToolCategory = 'Converter' | 'Hash' | 'Typo' | 'Snippet'

export interface ToolRegistryItem {
  id: string
  name: string
  description?: string
  category: ToolCategory
  type: 'generator' | 'one-way' | 'two-way' | 'n-way' | 'freestyle' | 'snippet'
  component: ReactNode
  keywords?: string[]
}
