-- ============================================================
-- AI SaaS Starter - Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE TABLE organizations (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                   TEXT NOT NULL,
  slug                   TEXT NOT NULL UNIQUE,
  stripe_customer_id     TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_status    TEXT NOT NULL DEFAULT 'inactive'
                           CHECK (subscription_status IN ('active','inactive','trialing','past_due','canceled')),
  subscription_plan      TEXT NOT NULL DEFAULT 'free'
                           CHECK (subscription_plan IN ('free','starter','pro')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORG_USERS (membership join table)
-- ============================================================
CREATE TABLE org_users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'member'
                    CHECK (role IN ('owner','admin','member')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  website_url     TEXT,
  system_prompt   TEXT DEFAULT 'You are a helpful assistant.',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE TABLE conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content         TEXT NOT NULL,
  tokens_used     INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USAGE_LOGS
-- ============================================================
CREATE TABLE usage_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  tokens_input    INTEGER NOT NULL DEFAULT 0,
  tokens_output   INTEGER NOT NULL DEFAULT 0,
  model           TEXT NOT NULL,
  cost_usd        NUMERIC(10, 6),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_org_users_user_id         ON org_users(user_id);
CREATE INDEX idx_org_users_org_id          ON org_users(organization_id);
CREATE INDEX idx_projects_org_id           ON projects(organization_id);
CREATE INDEX idx_conversations_project_id  ON conversations(project_id);
CREATE INDEX idx_conversations_user_id     ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id  ON messages(conversation_id);
CREATE INDEX idx_usage_logs_org_id         ON usage_logs(organization_id);
CREATE INDEX idx_usage_logs_user_id        ON usage_logs(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE organizations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs     ENABLE ROW LEVEL SECURITY;

-- Helper function: get org ids for the current user
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS UUID[] AS $$
  SELECT ARRAY(
    SELECT organization_id FROM org_users WHERE user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Organizations: members can read their own org
CREATE POLICY "org_select" ON organizations FOR SELECT
  USING (id = ANY(get_user_org_ids()));

CREATE POLICY "org_update" ON organizations FOR UPDATE
  USING (id = ANY(get_user_org_ids()));

-- Org users: visible within same org
CREATE POLICY "org_users_select" ON org_users FOR SELECT
  USING (organization_id = ANY(get_user_org_ids()));

CREATE POLICY "org_users_insert" ON org_users FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Projects: scoped to org membership
CREATE POLICY "projects_select" ON projects FOR SELECT
  USING (organization_id = ANY(get_user_org_ids()));

CREATE POLICY "projects_insert" ON projects FOR INSERT
  WITH CHECK (organization_id = ANY(get_user_org_ids()));

CREATE POLICY "projects_update" ON projects FOR UPDATE
  USING (organization_id = ANY(get_user_org_ids()));

CREATE POLICY "projects_delete" ON projects FOR DELETE
  USING (organization_id = ANY(get_user_org_ids()));

-- Conversations: scoped to org
CREATE POLICY "conversations_select" ON conversations FOR SELECT
  USING (organization_id = ANY(get_user_org_ids()));

CREATE POLICY "conversations_insert" ON conversations FOR INSERT
  WITH CHECK (organization_id = ANY(get_user_org_ids()) AND user_id = auth.uid());

-- Messages: scoped to org
CREATE POLICY "messages_select" ON messages FOR SELECT
  USING (organization_id = ANY(get_user_org_ids()));

CREATE POLICY "messages_insert" ON messages FOR INSERT
  WITH CHECK (organization_id = ANY(get_user_org_ids()));

-- Usage logs: scoped to org
CREATE POLICY "usage_logs_select" ON usage_logs FOR SELECT
  USING (organization_id = ANY(get_user_org_ids()));
