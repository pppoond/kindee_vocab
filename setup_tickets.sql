-- 1. Create tickets table
CREATE TABLE public.tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own tickets
CREATE POLICY "Users can create their own tickets"
ON public.tickets FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own tickets (optional, if you want them to see history)
CREATE POLICY "Users can view their own tickets"
ON public.tickets FOR SELECT
USING (auth.uid() = user_id);

-- (Optional) If you want admins to see all, you'd add a policy for that too.

-- 2. Create Storage Bucket for all app files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kindee-vocab', 'kindee-vocab', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'kindee-vocab' bucket
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'kindee-vocab');

CREATE POLICY "Authenticated users can upload images to tickets folder"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'kindee-vocab' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'tickets'
);
