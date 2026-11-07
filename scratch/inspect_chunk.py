with open('scratch/rail_bundle_script_1.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect from character 230000 to 260000
chunk = text[230000:265000]
print("Chunk length:", len(chunk))
with open('scratch/rail_component_chunk.js', 'w', encoding='utf-8') as f:
    f.write(chunk)
print("Saved scratch/rail_component_chunk.js")

