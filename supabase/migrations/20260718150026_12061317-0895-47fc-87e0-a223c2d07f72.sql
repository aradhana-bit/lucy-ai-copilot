
-- owner_settings singleton
CREATE TABLE IF NOT EXISTS public.owner_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  name text NOT NULL DEFAULT 'Aaru',
  role text NOT NULL DEFAULT 'Founder & Owner',
  support_email text NOT NULL DEFAULT 'support@lucy.ai',
  bio text,
  avatar_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.owner_settings TO authenticated;
GRANT ALL ON public.owner_settings TO service_role;
ALTER TABLE public.owner_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_settings read all authed" ON public.owner_settings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "owner_settings admin write" ON public.owner_settings
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

INSERT INTO public.owner_settings (id) VALUES (true) ON CONFLICT DO NOTHING;

CREATE TRIGGER trg_owner_settings_touch BEFORE UPDATE ON public.owner_settings
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- prompt_templates
CREATE TABLE IF NOT EXISTS public.prompt_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  category text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.prompt_templates TO authenticated;
GRANT ALL ON public.prompt_templates TO service_role;
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pt all member" ON public.prompt_templates
  FOR ALL TO authenticated
  USING (private.is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (private.is_workspace_member(workspace_id, auth.uid()));

CREATE TRIGGER trg_pt_touch BEFORE UPDATE ON public.prompt_templates
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- preferences: provider + onboarding
ALTER TABLE public.preferences
  ADD COLUMN IF NOT EXISTS ai_provider text NOT NULL DEFAULT 'gemini',
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;
