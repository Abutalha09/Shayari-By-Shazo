with open('scratch/dish_bundle_script_1.js', 'r', encoding='utf-8') as f:
    text = f.read()

helpers = ['eS', 'nS', 'sm', 'rm', '_x', '$x', 'Ix', 'tS', 'sd', 'Bv', 'uS', 'fm', 'cm', 'lS', 'iS', 'aS', 'Yv', 'rS', 'zu']

for h in helpers:
    idx = text.find(f'{h}=')
    if idx == -1:
        idx = text.find(f'function {h}(')
    if idx == -1:
        idx = text.find(f'const {h}=')
    if idx == -1:
        idx = text.find(f'let {h}=')
    if idx == -1:
        idx = text.find(f'var {h}=')
    print(f'=== {h} at {idx} ===')
    if idx != -1:
        print(repr(text[max(0, idx-10):min(len(text), idx+200)]))

