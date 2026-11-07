import json

with open("data/shayaris.json", "r", encoding="utf-8") as f:
    shayaris = json.load(f)

# Mood ratings and likes seeds
mood_likes = {
    'Ishq': 142,
    'Judaai': 118,
    'Dard': 136,
    'Umeed': 98,
    'Chai-wali-raatein': 175
}

ts_content = """export interface Shayari {
  id: number;
  page: number;
  title: string;
  mood: 'Ishq' | 'Judaai' | 'Dard' | 'Umeed' | 'Chai-wali-raatein' | string;
  image: string;
  fallbackImage?: string;
  audio: string | null;
  text: string;
  likes: number;
}

export const SHAYARIS_DATA: Shayari[] = """

processed = []
for i, item in enumerate(shayaris):
    s_id = item['id']
    mood = item['mood']
    base_like = mood_likes.get(mood, 110)
    likes = base_like + ((s_id * 7) % 43)
    processed.append({
        "id": s_id,
        "page": s_id,
        "title": item.get('title', f"तहरीर #{s_id}"),
        "mood": mood,
        "image": item['image'],
        "fallbackImage": item.get('fallbackImage', f"images/{s_id:02d}.jpg"),
        "audio": item.get('audio', None),
        "text": item.get('text', ''),
        "likes": likes
    })

ts_content += json.dumps(processed, ensure_ascii=False, indent=2) + ";\n"

with open("src/data/shayari.ts", "w", encoding="utf-8") as f:
    f.write(ts_content)

print(f"Generated src/data/shayari.ts with {len(processed)} entries.")

