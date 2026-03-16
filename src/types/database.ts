// @ts-nocheck  
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SubscriptionStatus = 'active' | 'inactive' | 'trialing' | 'past_due' | 'canceled'
export type SubscriptionPlan = 'starter' | 'pro' | 'free'
export type MessageRole = 'user' | 'assistant' | 'system'

export interface Organization {
  id: string
  name: string
  slug: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: SubscriptionStatus
  subscription_plan: SubscriptionPlan
  created_at: string
  updated_at: string
}

export interface OrgUser {
  id: string
  organization_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  created_at: string
}

export interface Project {
  id: string
  organization_id: string
  name: string
  description: string | null
  website_url: string | null
  system_prompt: string | null
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  organization_id: string
  project_id: string
  user_id: string
  title: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  organization_id: string
  conversation_id: string
  role: MessageRole
  content: string
  tokens_used: number | null
  created_at: string
}

export interface UsageLog {
  id: string
  organization_id: string
  user_id: string
  project_id: string | null
  conversation_id: string | null
  tokens_input: number
  tokens_output: number
  model: string
  cost_usd: number | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization
        Insert: Omit<Organization, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Organization, 'id'>>
      }
      org_users: {
        Row: OrgUser
        Insert: Omit<OrgUser, 'id' | 'created_at'>
        Update: Partial<Omit<OrgUser, 'id'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Project, 'id'>>
      }
      conversations: {
        Row: Conversation
        Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Conversation, 'id'>>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at'>
        Update: Partial<Omit<Message, 'id'>>
      }
      usage_logs: {
        Row: UsageLog
        Insert: Omit<UsageLog, 'id' | 'created_at'>
        Update: Partial<Omit<UsageLog, 'id'>>
      }
    }
  }
}
