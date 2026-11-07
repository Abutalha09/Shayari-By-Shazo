"""
Shayari by Shazo - Data Sync Helper Script
Run this script whenever you add new audio files to /audio or new images to /images:
    python update_data.py
"""

import json
import os
import glob

DATA_FILE = "data/shayaris.json"
AUDIO_DIR = "audio"
IMAGES_DIR = "images"

def sync():
    if not os.path.exists(DATA_FILE):
        print(f"Error: {DATA_FILE} not found!")
        return

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        shayaris = json.load(f)

    updated_audio = 0
    for item in shayaris:
        item_id = item["id"]
        # Check for matching audio: 01.mp3, 1.mp3, etc.
        audio_candidates = [
            os.path.join(AUDIO_DIR, f"{item_id:02d}.mp3"),
            os.path.join(AUDIO_DIR, f"{item_id}.mp3"),
            os.path.join(AUDIO_DIR, f"{item_id:02d}.wav"),
            os.path.join(AUDIO_DIR, f"{item_id:02d}.m4a"),
        ]
        
        found_audio = None
        for cand in audio_candidates:
            if os.path.exists(cand):
                found_audio = cand.replace("\\", "/")
                break
        
        if found_audio != item.get("audio"):
            item["audio"] = found_audio
            if found_audio:
                updated_audio += 1

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(shayaris, f, ensure_ascii=False, indent=2)

    print(f"✓ Synchronized data/shayaris.json: {len(shayaris)} shayaris total.")
    print(f"✓ Active voice recordings found: {sum(1 for s in shayaris if s.get('audio'))}")

if __name__ == "__main__":
    sync()

