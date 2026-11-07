import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

def inspect_app_router(url, prefix):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode('utf-8')
    
    with open(f"scratch/{prefix}_raw.html", "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"{prefix}: saved raw html, searching for code strings...")
    # Find all script contents or strings containing "ClothingRailHero"
    matches = re.findall(r'(\\"content\\":\\".*?\\")', content)
    print(f"{prefix}: found {len(matches)} content matches")
    
    # Or search for escaped code
    # Look for files array in Next.js streaming data
    for m in re.finditer(r'\{[^{}]*?"name"\s*:\s*"([^"]+)"[^{}]*?"content"\s*:\s*"((?:\\.|[^"\\])*)"', content):
        name = m.group(1)
        raw_code = m.group(2)
        code = raw_code.encode('utf-8').decode('unicode_escape')
        print(f"Found file: {name}, length: {len(code)}")
        with open(f"scratch/{prefix}_{name}", "w", encoding="utf-8") as f:
            f.write(code)

inspect_app_router("https://21st.dev/@dhxwhy/components/product-rail-gallery", "rail")
inspect_app_router("https://21st.dev/@kedhareswer/components/dish-orbit-carousel", "dish")

