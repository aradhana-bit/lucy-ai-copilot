
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_workspace_member(_ws uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.workspace_members WHERE workspace_id=_ws AND user_id=_user);
$$;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role);
$$;

CREATE OR REPLACE FUNCTION private.can_access_project(_project uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.projects p
    JOIN public.workspace_members m ON m.workspace_id = p.workspace_id
    WHERE p.id=_project AND m.user_id=_user
  );
$$;

CREATE OR REPLACE FUNCTION private.shares_workspace(_target uuid, _viewer uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.workspace_members a
    JOIN public.workspace_members b ON a.workspace_id = b.workspace_id
    WHERE a.user_id = _viewer AND b.user_id = _target
  );
$$;

REVOKE ALL ON FUNCTION private.is_workspace_member(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.can_access_project(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.shares_workspace(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_workspace_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_access_project(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.shares_workspace(uuid, uuid) TO authenticated;

ALTER POLICY "act insert member" ON public.activity_logs WITH CHECK (private.is_workspace_member(workspace_id, auth.uid()));
ALTER POLICY "act select member" ON public.activity_logs USING (private.is_workspace_member(workspace_id, auth.uid()));
ALTER POLICY "as via convo" ON public.agent_sessions
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = agent_sessions.conversation_id AND private.is_workspace_member(c.workspace_id, auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = agent_sessions.conversation_id AND private.is_workspace_member(c.workspace_id, auth.uid())));
ALTER POLICY "billing member" ON public.billing USING (private.is_workspace_member(workspace_id, auth.uid())) WITH CHECK (private.is_workspace_member(workspace_id, auth.uid()));
ALTER POLICY "convo all member" ON public.conversations USING (private.is_workspace_member(workspace_id, auth.uid())) WITH CHECK (private.is_workspace_member(workspace_id, auth.uid()));
ALTER POLICY "dv via doc" ON public.document_versions
  USING (EXISTS (SELECT 1 FROM public.documents d WHERE d.id = document_versions.document_id AND private.is_workspace_member(d.workspace_id, auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.documents d WHERE d.id = document_versions.document_id AND private.is_workspace_member(d.workspace_id, auth.uid())));
ALTER POLICY "docs all member" ON public.documents USING (private.is_workspace_member(workspace_id, auth.uid())) WITH CHECK (private.is_workspace_member(workspace_id, auth.uid()));
ALTER POLICY "files all member" ON public.files USING (private.is_workspace_member(workspace_id, auth.uid())) WITH CHECK (private.is_workspace_member(workspace_id, auth.uid()));
ALTER POLICY "mem all member" ON public.memories USING (private.is_workspace_member(workspace_id, auth.uid())) WITH CHECK (private.is_workspace_member(workspace_id, auth.uid()));
ALTER POLICY "messages via convo" ON public.messages
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND private.is_workspace_member(c.workspace_id, auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND private.is_workspace_member(c.workspace_id, auth.uid())));
ALTER POLICY "projects all member" ON public.projects USING (private.is_workspace_member(workspace_id, auth.uid())) WITH CHECK (private.is_workspace_member(workspace_id, auth.uid()));
ALTER POLICY "rm all member" ON public.roadmaps USING (private.is_workspace_member(workspace_id, auth.uid())) WITH CHECK (private.is_workspace_member(workspace_id, auth.uid()));
ALTER POLICY "sp all member" ON public.startup_profiles USING (private.is_workspace_member(workspace_id, auth.uid())) WITH CHECK (private.is_workspace_member(workspace_id, auth.uid()));
ALTER POLICY "subs read member" ON public.subscriptions USING (private.is_workspace_member(workspace_id, auth.uid()));
ALTER POLICY "tc via task" ON public.task_comments
  USING (EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_comments.task_id AND private.is_workspace_member(t.workspace_id, auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_comments.task_id AND private.is_workspace_member(t.workspace_id, auth.uid())));
ALTER POLICY "tasks all member" ON public.tasks USING (private.is_workspace_member(workspace_id, auth.uid())) WITH CHECK (private.is_workspace_member(workspace_id, auth.uid()));
ALTER POLICY "wm select self or member" ON public.workspace_members USING (user_id = auth.uid() OR private.is_workspace_member(workspace_id, auth.uid()));
ALTER POLICY "ws select member" ON public.workspaces USING (private.is_workspace_member(id, auth.uid()) OR owner_id = auth.uid());

-- Repoint storage.objects policies for workspace-files bucket
DO $$
DECLARE
  r record;
  q text;
  new_using text;
  new_check text;
BEGIN
  FOR r IN
    SELECT polname, pg_get_expr(polqual, polrelid) AS u, pg_get_expr(polwithcheck, polrelid) AS w
    FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='storage' AND c.relname='objects'
      AND (pg_get_expr(polqual, polrelid) ~ 'is_workspace_member'
        OR pg_get_expr(polwithcheck, polrelid) ~ 'is_workspace_member')
  LOOP
    new_using := replace(coalesce(r.u,''), 'is_workspace_member(', 'private.is_workspace_member(');
    new_check := replace(coalesce(r.w,''), 'is_workspace_member(', 'private.is_workspace_member(');
    q := format('ALTER POLICY %I ON storage.objects', r.polname);
    IF r.u IS NOT NULL THEN q := q || format(' USING (%s)', new_using); END IF;
    IF r.w IS NOT NULL THEN q := q || format(' WITH CHECK (%s)', new_check); END IF;
    EXECUTE q;
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS public.is_workspace_member(uuid, uuid);
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.can_access_project(uuid, uuid);

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;

DROP POLICY IF EXISTS "profiles read own or any authenticated" ON public.profiles;
CREATE POLICY "profiles read own or shared workspace" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR private.shares_workspace(id, auth.uid()));
