-- Harden billing: explicitly remove write privileges from client roles.
-- SELECT stays granted for members. Writes must come via service_role.
REVOKE INSERT, UPDATE, DELETE ON public.billing FROM authenticated;
REVOKE INSERT, UPDATE, DELETE, SELECT ON public.billing FROM anon;

-- Harden workspace_members: keep owner-only INSERT (already enforced), and
-- additionally forbid any self-insert path by ensuring only rows for a workspace
-- the caller owns can be created. Recreate the policy explicitly.
DROP POLICY IF EXISTS "wm insert by owner" ON public.workspace_members;
CREATE POLICY "wm insert by owner only"
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

-- Also forbid users from mutating their own membership row (role escalation).
DROP POLICY IF EXISTS "wm delete self" ON public.workspace_members;
CREATE POLICY "wm delete by owner"
  ON public.workspace_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_members.workspace_id
        AND w.owner_id = auth.uid()
    )
  );
