with open('scratch/dish_bundle_script_1.js', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('rS="')
end = text.find('",om=', idx)
css = text[idx+4:end]
with open('scratch/dish_styles.css', 'w', encoding='utf-8') as f:
    f.write(css.replace('"+sd+"', '118').replace('"+sd*Bv+"', '472').replace('"+Yv+"', 'dsh-face'))

print('Saved scratch/dish_styles.css, length:', len(css))

