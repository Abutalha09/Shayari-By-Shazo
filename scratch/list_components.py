with open('scratch/extracted_rail_full.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
for m in re.finditer(r'c\(([a-zA-Z0-9_]+),\s*"([^"]+)"\)', text):
    print('Named component:', m.group(1), '->', m.group(2))

