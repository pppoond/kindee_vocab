-- Create public_word_bank table
CREATE TABLE public_word_bank (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word TEXT NOT NULL,
  type TEXT,
  meaning TEXT NOT NULL,
  v2 TEXT,
  v3 TEXT,
  example TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create tags table
CREATE TABLE public_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create junction table for many-to-many relationship
CREATE TABLE public_word_tags (
  word_id UUID NOT NULL REFERENCES public_word_bank(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (word_id, tag_id)
);

-- Enable RLS
ALTER TABLE public_word_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_word_tags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view public_word_bank" ON public_word_bank FOR SELECT USING (true);
CREATE POLICY "Anyone can view public_tags" ON public_tags FOR SELECT USING (true);
CREATE POLICY "Anyone can view public_word_tags" ON public_word_tags FOR SELECT USING (true);
