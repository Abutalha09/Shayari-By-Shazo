with open('scratch/rail_bundle_script_1.js', 'r', encoding='utf-8') as f:
    text = f.read()

end_idx = text.find('c(wd,"ClothingRailHero")')
print('ClothingRailHero end_idx:', end_idx)

# Find where the rail component module starts
# Look for emptySim or earlier
start_idx = text.rfind('c(Xd,"emptySim")', 0, end_idx)
print('emptySim at:', start_idx)

# Find where Hanger or garment art starts
hanger_idx = text.rfind('function', 0, start_idx - 5000)
print('hanger/art around:', hanger_idx)

# Let's save from hanger_idx to end of Detail component
detail_end = text.find('c(Gd,"Detail")', end_idx)
print('detail_end:', detail_end)

with open('scratch/extracted_rail_full.js', 'w', encoding='utf-8') as f:
    f.write(text[start_idx - 25000:detail_end + 30])

print("Saved scratch/extracted_rail_full.js")

