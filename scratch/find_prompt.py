with open('scratch/rail_raw.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'prompt', text)]
print('prompt matches:', len(matches))
for idx in matches[:10]:
    print('--- at', idx, '---')
    print(repr(text[max(0, idx-40):min(len(text), idx+300)]))

