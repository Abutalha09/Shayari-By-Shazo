import re
import json

with open("scratch/rail_raw.html", "r", encoding="utf-8") as f:
    rail_html = f.read()

# Let's search for "product-rail-gallery.tsx"
for idx in [m.start() for m in re.finditer(r'product-rail-gallery\.tsx', rail_html)]:
    snippet = rail_html[max(0, idx - 100):min(len(rail_html), idx + 500)]
    print("--- Rail snippet at", idx, "---")
    print(snippet[:300])

with open("scratch/dish_raw.html", "r", encoding="utf-8") as f:
    dish_html = f.read()

for idx in [m.start() for m in re.finditer(r'dish-orbit-carousel\.tsx', dish_html)]:
    snippet = dish_html[max(0, idx - 100):min(len(dish_html), idx + 500)]
    print("--- Dish snippet at", idx, "---")
    print(snippet[:300])

