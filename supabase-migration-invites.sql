-- ==============================================================================
-- PROJEX Production Migration: Project Invites & In-App Notifications
-- ==============================================================================
-- Run this in your Supabase SQL Editor if you wish to persist invites and inbox
-- notifications in PostgreSQL alongside the in-memory fallback.
--
-- Note: PROJEX's Node backend also implements an in-memory secure vault for
-- invites and notifications, allowing full end-to-end functionality even before
-- this migration is applied!
-- ==============================================================================

-- 1. Create project_invites table
CREATE TABLE IF NOT EXISTS public.project_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash TEXT NOT NULL UNIQUE,
  code_preview TEXT NOT NULL,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  telegram_username TEXT NOT NULL,
  welcome_message TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'redeemed', 'expired', 'revoked')),
  redeemed_by_user_id UUID REFERENCES auth.users(id),
  redeemed_telegram_id TEXT,
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for lookup and expiration cleanup
CREATE INDEX IF NOT EXISTS idx_project_invites_hash ON public.project_invites(code_hash);
CREATE INDEX IF NOT EXISTS idx_project_invites_project ON public.project_invites(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invites_username ON public.project_invites(telegram_username);

-- 2. Create in-app notifications/inbox table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sender_user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL DEFAULT 'welcome',
  is_read BOOLEAN NOT NULL DEFAULT false,
  telegram_delivery_status TEXT DEFAULT 'pending' CHECK (telegram_delivery_status IN ('pending', 'sent', 'failed', 'skipped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

-- 3. Row Level Security Policies
ALTER TABLE public.project_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Project leaders can view and manage invites for projects they own or lead
CREATE POLICY "Project leaders can manage invites"
  ON public.project_invites
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_invites.project_id
        AND projects.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = project_invites.project_id
        AND project_members.user_id = auth.uid()
        AND lower(project_members.role) IN ('lead', 'project lead', 'admin')
        AND project_members.revoked_at IS NULL
    )
  );

-- Users can read and update their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
