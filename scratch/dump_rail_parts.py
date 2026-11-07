with open('scratch/extracted_rail_full.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect wd (ClothingRailHero) and Gd (Detail) and simulation
with open('scratch/rail_wd.js', 'w', encoding='utf-8') as f:
    idx_wd = text.find('function wd(')
    idx_end = text.find('c(Gd,"Detail")', idx_wd)
    f.write(text[idx_wd:idx_end + 20])

print("Saved scratch/rail_wd.js")

# Let's inspect the SVG art definitions before wd
with open('scratch/rail_art.js', 'w', encoding='utf-8') as f:
    idx_wd = text.find('function wd(')
    f.write(text[:idx_wd])

print("Saved scratch/rail_art.js")

