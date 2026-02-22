-- Create vocabularies table
CREATE TABLE vocabularies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  type TEXT,
  meaning TEXT NOT NULL,
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
