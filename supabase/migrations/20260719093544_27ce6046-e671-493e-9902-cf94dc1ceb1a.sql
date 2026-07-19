
-- Fix wm_insert_any_ws: restrict workspace_members inserts to workspace owners only
DROP POLICY IF EXISTS "wm insert self" ON public.workspace_members;

CREATE POLICY "wm insert by owner"
ON public.workspace_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = workspace_members.workspace_id
      AND w.owner_id = auth.uid()
  )
);

-- Fix billing_self_write: make billing read-only for members; writes via service_role only
DROP POLICY IF EXISTS "billing member" ON public.billing;

CREATE POLICY "billing select member"
ON public.billing
FOR SELECT
TO authenticated
USING (private.is_workspace_member(workspace_id, auth.uid()));
