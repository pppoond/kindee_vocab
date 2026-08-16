-- Create vocabularies table
CREATE TABLE vocabularies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  type TEXT,
  meaning TEXT NOT NULL,
  v2 TEXT,
  v3 TEXT,
  example TEXT,
  memorized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE vocabularies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own vocabularies"
  ON vocabularies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vocabularies"
  ON vocabularies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vocabularies"
  ON vocabularies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vocabularies"
  ON vocabularies FOR DELETE
  USING (auth.uid() = user_id);

-- Create game_sessions table
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'normal',
  level INTEGER NOT NULL DEFAULT 1,
  result TEXT NOT NULL,
  correct_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  wrong_words JSONB DEFAULT '[]',
  played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own game_sessions"
  ON game_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game_sessions"
  ON game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game_sessions"
  ON game_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create blogs table
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'update',
  badge_color TEXT DEFAULT 'amber',
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Policies for blogs
CREATE POLICY "Public users can view published blogs"
  ON blogs FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can do all operations on blogs"
  ON blogs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_settings
      WHERE user_settings.user_id = auth.uid()
      AND user_settings.role = 'admin'
    )
  );

