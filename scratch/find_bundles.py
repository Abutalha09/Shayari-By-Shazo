import re

with open('scratch/rail_raw.html', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.findall(r'https://cdn\.21st\.dev/[a-zA-Z0-9_\-\./]+bundle[a-zA-Z0-9_\-\./]+', text)
print('Rail bundle matches:', m)

with open('scratch/dish_raw.html', 'r', encoding='utf-8') as f:
    text2 = f.read()

m2 = re.findall(r'https://cdn\.21st\.dev/[a-zA-Z0-9_\-\./]+bundle[a-zA-Z0-9_\-\./]+', text2)
print('Dish bundle matches:', m2)

