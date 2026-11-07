with open('scratch/extracted_rail_full.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's find CSS in rail component
idx_css = text.find('style')
# Check where style tag or CSS strings are
import re
css_matches = re.findall(r'(\.[a-zA-Z0-9_\-]+\s*\{[^}]+\})', text)
print('CSS rule matches found:', len(css_matches))

# Print function headers and their signatures
for m in re.finditer(r'function ([a-zA-Z0-9_]+)\(([^)]*)\)', text):
    fn_name = m.group(1)
    fn_params = m.group(2)
    print(f'{fn_name}({fn_params})')

