"""Verify that all preexisting files outside JUEGO are unchanged."""
from pathlib import Path
import json, hashlib
root=Path(__file__).resolve().parents[2]
baseline=json.loads(Path(__file__).with_name('web-original.sha256.json').read_text(encoding='utf-8'))
changed=[]
for name,expected in baseline.items():
    p=root/name
    if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=expected:changed.append(name)
assert not changed, f'Archivos originales modificados: {changed}'
print(f'OK: {len(baseline)} archivos originales intactos.')
