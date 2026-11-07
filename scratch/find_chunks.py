import re

with open('scratch/rail_raw.html', 'r', encoding='utf-8') as f:
    text = f.read()

chunks = re.findall(r'src="(/_next/static/chunks/[^"]+)"', text)
print('Chunks found:', len(chunks))
for c in chunks[:10]:
    print(c)

