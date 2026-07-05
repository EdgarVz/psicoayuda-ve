-- 1. Enum notification_type
CREATE TYPE public.notification_type AS ENUM (
  'request_received',
  'request_accepted',
  'request_rejected',
  'profile_verified',
  'profile_rejected'
);

-- 2. Tabla notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  related_id uuid,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id) WHERE read_at IS NULL;

-- 3. RLS para appointment_requests
ALTER TABLE public.appointment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patient_select_own" ON public.appointment_requests
  FOR SELECT TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "psychologist_select_own" ON public.appointment_requests
  FOR SELECT TO authenticated
  USING (psychologist_id = auth.uid());

CREATE POLICY "patient_insert_own" ON public.appointment_requests
  FOR INSERT TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "psychologist_update_own" ON public.appointment_requests
  FOR UPDATE TO authenticated
  USING (psychologist_id = auth.uid())
  WITH CHECK (psychologist_id = auth.uid());

-- 4. RLS para notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_select_notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_update_notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
