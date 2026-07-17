REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon;
REVOKE ALL ON FUNCTION public.is_workspace_member(uuid, uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.can_access_project(uuid, uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.tg_touch_updated_at() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_project(uuid, uuid) TO authenticated;

CREATE POLICY "wf select member" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id='workspace-files' AND public.is_workspace_member((storage.foldername(name))[1]::uuid, auth.uid()));
CREATE POLICY "wf insert member" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id='workspace-files' AND public.is_workspace_member((storage.foldername(name))[1]::uuid, auth.uid()));
CREATE POLICY "wf update member" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id='workspace-files' AND public.is_workspace_member((storage.foldername(name))[1]::uuid, auth.uid()));
CREATE POLICY "wf delete member" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id='workspace-files' AND public.is_workspace_member((storage.foldername(name))[1]::uuid, auth.uid()));