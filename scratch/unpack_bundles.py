from bs4 import BeautifulSoup
import re

with open('scratch/rail_bundle.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

scripts = soup.find_all('script')
print('Rail bundle script tags:', len(scripts))
for i, s in enumerate(scripts):
    txt = s.get_text()
    print(f'Script {i}: length {len(txt)}')
    if len(txt) > 500:
        with open(f'scratch/rail_bundle_script_{i}.js', 'w', encoding='utf-8') as out:
            out.write(txt)
            print(f'  Saved scratch/rail_bundle_script_{i}.js')

with open('scratch/dish_bundle.html', 'r', encoding='utf-8') as f:
    soup2 = BeautifulSoup(f.read(), 'html.parser')

scripts2 = soup2.find_all('script')
print('Dish bundle script tags:', len(scripts2))
for i, s in enumerate(scripts2):
    txt = s.get_text()
    print(f'Script {i}: length {len(txt)}')
    if len(txt) > 500:
        with open(f'scratch/dish_bundle_script_{i}.js', 'w', encoding='utf-8') as out:
            out.write(txt)
            print(f'  Saved scratch/dish_bundle_script_{i}.js')

