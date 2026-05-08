
-- Add RLS policies to user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Fix overly permissive contact messages insert - require non-empty fields
DROP POLICY "Anyone can submit contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages FOR INSERT WITH CHECK (
  length(name) > 0 AND length(email) > 3 AND length(subject) > 0 AND length(message) > 0
);
