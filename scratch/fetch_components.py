import urllib.request
import re
import html
from bs4 import BeautifulSoup
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

def extract_from_url(url, out_name):
    print(f"Fetching {url}...")
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode('utf-8')
    print(f"Loaded {len(content)} bytes")
    
    # Try finding __NEXT_DATA__
    m = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', content)
    if m:
        try:
            data = json.loads(m.group(1))
            print("Found __NEXT_DATA__!")
            # Dump to file to inspect
            with open(f"scratch/{out_name}_nextdata.json", "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print("Error parsing next data:", e)

    # Try finding shiki code blocks
    soup = BeautifulSoup(content, 'html.parser')
    pres = soup.find_all('pre')
    print(f"Found {len(pres)} pre tags")
    for i, pre in enumerate(pres):
        code_text = pre.get_text()
        print(f"Pre {i}: length {len(code_text)}")
        if "ClothingRailHero" in code_text or "DishOrbitCarousel" in code_text or "export" in code_text:
            with open(f"scratch/{out_name}_code_{i}.tsx", "w", encoding="utf-8") as f:
                f.write(code_text)
            print(f"Saved scratch/{out_name}_code_{i}.tsx ({len(code_text)} chars)")

extract_from_url("https://21st.dev/@dhxwhy/components/product-rail-gallery", "rail")
extract_from_url("https://21st.dev/@kedhareswer/components/dish-orbit-carousel", "dish")

