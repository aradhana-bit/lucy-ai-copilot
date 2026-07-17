-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin','member');
CREATE TYPE public.project_status AS ENUM ('active','planning','paused','shipped','archived');
CREATE TYPE public.task_status AS ENUM ('backlog','todo','in_progress','review','done');
CREATE TYPE public.task_priority AS ENUM ('low','medium','high','urgent');
CREATE TYPE public.message_role AS ENUM ('user','assistant','system','tool');
CREATE TYPE public.doc_kind AS ENUM ('brief','spec','research','memo','code','plan','other');
CREATE TYPE public.notification_kind AS ENUM ('agent','billing','team','system','task','document');
CREATE TYPE public.activity_kind AS ENUM ('project_created','project_updated','document_generated','task_completed','task_created','conversation_started','file_uploaded','ai_action','login','settings_updated','member_added');

-- ============ updated_at helper ============
CREATE OR REPLACE FUNCTION public.tg_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles read own or any authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid()=id) WITH CHECK (auth.uid()=id);
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid()=id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ============ USER_ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles read own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role);
$$;

-- ============ WORKSPACES ============
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My workspace',
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspaces TO authenticated;
GRANT ALL ON public.workspaces TO service_role;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_workspaces_updated BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

CREATE TABLE public.workspace_members (
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspace_members TO service_role;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_workspace_member(_ws UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(SELECT 1 FROM public.workspace_members WHERE workspace_id=_ws AND user_id=_user);
$$;

CREATE POLICY "ws select member" ON public.workspaces FOR SELECT TO authenticated USING (public.is_workspace_member(id, auth.uid()) OR owner_id=auth.uid());
CREATE POLICY "ws insert own" ON public.workspaces FOR INSERT TO authenticated WITH CHECK (owner_id=auth.uid());
CREATE POLICY "ws update owner" ON public.workspaces FOR UPDATE TO authenticated USING (owner_id=auth.uid()) WITH CHECK (owner_id=auth.uid());
CREATE POLICY "ws delete owner" ON public.workspaces FOR DELETE TO authenticated USING (owner_id=auth.uid());

CREATE POLICY "wm select self or member" ON public.workspace_members FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "wm insert self" ON public.workspace_members FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid());
CREATE POLICY "wm delete self" ON public.workspace_members FOR DELETE TO authenticated USING (user_id=auth.uid());

-- ============ STARTUP PROFILES ============
CREATE TABLE public.startup_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT,
  vision TEXT,
  mission TEXT,
  target_audience TEXT,
  business_model TEXT,
  pricing TEXT,
  competitors TEXT,
  brand_voice TEXT,
  tech_stack TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.startup_profiles TO authenticated;
GRANT ALL ON public.startup_profiles TO service_role;
ALTER TABLE public.startup_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sp all member" ON public.startup_profiles FOR ALL TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid())) WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE TRIGGER trg_sp_updated BEFORE UPDATE ON public.startup_profiles FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ============ PROJECTS ============
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status public.project_status NOT NULL DEFAULT 'active',
  color TEXT DEFAULT 'oklch(0.72 0.17 285)',
  progress INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_projects_ws ON public.projects(workspace_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects all member" ON public.projects FOR ALL TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid())) WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

CREATE OR REPLACE FUNCTION public.can_access_project(_project UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.projects p
    JOIN public.workspace_members m ON m.workspace_id=p.workspace_id
    WHERE p.id=_project AND m.user_id=_user
  );
$$;

-- ============ CONVERSATIONS ============
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New conversation',
  system_prompt TEXT,
  model TEXT NOT NULL DEFAULT 'google/gemini-3-flash-preview',
  pinned BOOLEAN NOT NULL DEFAULT false,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_convo_ws ON public.conversations(workspace_id, updated_at DESC);
CREATE INDEX idx_convo_project ON public.conversations(project_id, updated_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "convo all member" ON public.conversations FOR ALL TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid())) WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE TRIGGER trg_convo_updated BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ============ MESSAGES ============
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role public.message_role NOT NULL,
  content TEXT NOT NULL,
  parts JSONB,
  model TEXT,
  tokens_in INT,
  tokens_out INT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_convo ON public.messages(conversation_id, created_at ASC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages via convo" ON public.messages FOR ALL TO authenticated
USING (EXISTS(SELECT 1 FROM public.conversations c WHERE c.id=conversation_id AND public.is_workspace_member(c.workspace_id, auth.uid())))
WITH CHECK (EXISTS(SELECT 1 FROM public.conversations c WHERE c.id=conversation_id AND public.is_workspace_member(c.workspace_id, auth.uid())));

-- ============ DOCUMENTS ============
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  kind public.doc_kind NOT NULL DEFAULT 'other',
  content TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  favorite BOOLEAN NOT NULL DEFAULT false,
  folder TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_docs_ws ON public.documents(workspace_id, updated_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "docs all member" ON public.documents FOR ALL TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid())) WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE TRIGGER trg_docs_updated BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

CREATE TABLE public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.document_versions TO authenticated;
GRANT ALL ON public.document_versions TO service_role;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dv via doc" ON public.document_versions FOR ALL TO authenticated
USING (EXISTS(SELECT 1 FROM public.documents d WHERE d.id=document_id AND public.is_workspace_member(d.workspace_id, auth.uid())))
WITH CHECK (EXISTS(SELECT 1 FROM public.documents d WHERE d.id=document_id AND public.is_workspace_member(d.workspace_id, auth.uid())));

-- ============ TASKS ============
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status NOT NULL DEFAULT 'todo',
  priority public.task_priority NOT NULL DEFAULT 'medium',
  assignee_id UUID REFERENCES auth.users(id),
  due_at TIMESTAMPTZ,
  progress INT NOT NULL DEFAULT 0,
  labels TEXT[] DEFAULT '{}',
  position INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tasks_project ON public.tasks(project_id, status);
CREATE INDEX idx_tasks_ws ON public.tasks(workspace_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks all member" ON public.tasks FOR ALL TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid())) WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

CREATE TABLE public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_comments TO authenticated;
GRANT ALL ON public.task_comments TO service_role;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tc via task" ON public.task_comments FOR ALL TO authenticated
USING (EXISTS(SELECT 1 FROM public.tasks t WHERE t.id=task_id AND public.is_workspace_member(t.workspace_id, auth.uid())))
WITH CHECK (EXISTS(SELECT 1 FROM public.tasks t WHERE t.id=task_id AND public.is_workspace_member(t.workspace_id, auth.uid())));

-- ============ ROADMAPS ============
CREATE TABLE public.roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Roadmap',
  data JSONB NOT NULL DEFAULT '{"milestones":[]}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmaps TO authenticated;
GRANT ALL ON public.roadmaps TO service_role;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rm all member" ON public.roadmaps FOR ALL TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid())) WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE TRIGGER trg_rm_updated BEFORE UPDATE ON public.roadmaps FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ============ FILES ============
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime TEXT,
  size BIGINT,
  folder TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_files_ws ON public.files(workspace_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.files TO authenticated;
GRANT ALL ON public.files TO service_role;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "files all member" ON public.files FOR ALL TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid())) WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

-- ============ MEMORIES ============
CREATE TABLE public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'note',
  content TEXT NOT NULL,
  importance INT NOT NULL DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_mem_project ON public.memories(project_id, importance DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memories TO authenticated;
GRANT ALL ON public.memories TO service_role;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mem all member" ON public.memories FOR ALL TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid())) WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  kind public.notification_kind NOT NULL DEFAULT 'system',
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_user ON public.notifications(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif own" ON public.notifications FOR ALL TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

-- ============ ACTIVITY LOGS ============
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  kind public.activity_kind NOT NULL,
  message TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_ws ON public.activity_logs(workspace_id, created_at DESC);
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "act select member" ON public.activity_logs FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "act insert member" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

-- ============ AGENT SESSIONS ============
CREATE TABLE public.agent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  agent TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_sessions TO authenticated;
GRANT ALL ON public.agent_sessions TO service_role;
ALTER TABLE public.agent_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "as via convo" ON public.agent_sessions FOR ALL TO authenticated
USING (EXISTS(SELECT 1 FROM public.conversations c WHERE c.id=conversation_id AND public.is_workspace_member(c.workspace_id, auth.uid())))
WITH CHECK (EXISTS(SELECT 1 FROM public.conversations c WHERE c.id=conversation_id AND public.is_workspace_member(c.workspace_id, auth.uid())));

-- ============ PREFERENCES ============
CREATE TABLE public.preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'dark',
  language TEXT NOT NULL DEFAULT 'en',
  ai_model TEXT NOT NULL DEFAULT 'google/gemini-3-flash-preview',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  notification_prefs JSONB NOT NULL DEFAULT '{"email":true,"in_app":true}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.preferences TO authenticated;
GRANT ALL ON public.preferences TO service_role;
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prefs own" ON public.preferences FOR ALL TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());
CREATE TRIGGER trg_prefs_updated BEFORE UPDATE ON public.preferences FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ============ BILLING / SUBSCRIPTIONS ============
CREATE TABLE public.billing (
  workspace_id UUID PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  seats INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.billing TO authenticated;
GRANT ALL ON public.billing TO service_role;
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing member" ON public.billing FOR ALL TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid())) WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'stripe',
  external_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subs read member" ON public.subscriptions FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));

-- ============ NEW USER TRIGGER: profile + workspace + membership + role ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE ws_id UUID;
BEGIN
  INSERT INTO public.profiles(id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'member') ON CONFLICT DO NOTHING;

  INSERT INTO public.workspaces(owner_id, name) VALUES (NEW.id, 'My workspace') RETURNING id INTO ws_id;
  INSERT INTO public.workspace_members(workspace_id, user_id, role) VALUES (ws_id, NEW.id, 'owner');
  INSERT INTO public.billing(workspace_id) VALUES (ws_id);
  INSERT INTO public.preferences(user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ Realtime ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;