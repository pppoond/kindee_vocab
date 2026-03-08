export interface DictionaryEntry {
  word: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
    }[];
  }[];
}

export async function getExampleSentences(word: string): Promise<string[]> {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!response.ok) {
      if (response.status === 404) return [];
      throw new Error(`API error: ${response.status}`);
    }

    const data: DictionaryEntry[] = await response.json();
    const examples: string[] = [];

    data.forEach(entry => {
      entry.meanings.forEach(meaning => {
        meaning.definitions.forEach(def => {
          if (def.example) {
            examples.push(def.example);
          }
        });
      });
    });

    return Array.from(new Set(examples)); // Remove duplicates
  } catch (error) {
    console.error("Error fetching example sentences:", error);
    return [];
  }
}
