export type AssociationType = 'sport' | 'culture' | 'solidarity' | 'education'

export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

export interface Association {
  id: string
  user_id: string
  name: string
  city: string
  type: AssociationType
  generated_content: string | null
  created_at: string
  updated_at: string
}

export interface AssociationWithContent extends Association {
  content: import('./openai').GeneratedContent | null
}
