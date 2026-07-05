-- 1. Create user_settings table
CREATE TABLE public.user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id)
);

-- Enable RLS on user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own settings
CREATE POLICY "Users can view own settings"
ON public.user_settings FOR SELECT
USING (auth.uid() = user_id);

-- (Optional) If we want users to insert their own default settings initially
CREATE POLICY "Users can insert own settings"
ON public.user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);


-- 2. Create helper function for RLS to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_settings 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Update tickets RLS policies to allow admins to view/update/delete tickets
CREATE POLICY "Admins can view all tickets"
ON public.tickets FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can update tickets"
ON public.tickets FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can delete tickets"
ON public.tickets FOR DELETE
USING (public.is_admin());

-- Note: We also need to allow Admins to delete images in storage
CREATE POLICY "Admins can delete any images in tickets folder"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'kindee-vocab'
    AND public.is_admin()
    AND (storage.foldername(name))[1] = 'tickets'
);

CREATE POLICY "Admins can view any images in kindee-vocab"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'kindee-vocab'
    AND public.is_admin()
);
