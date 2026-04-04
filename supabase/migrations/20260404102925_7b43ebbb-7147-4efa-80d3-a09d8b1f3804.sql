
ALTER TABLE public.messages ADD COLUMN read boolean NOT NULL DEFAULT false;

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Allow users to mark messages as read
CREATE POLICY "Users can update their received messages"
ON public.messages FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id);
