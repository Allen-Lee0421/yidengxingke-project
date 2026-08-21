from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
html = (root / 'public' / 'input.html').read_text(encoding='utf-8')
assert html.count('<script>') == html.count('</script>'), 'input.html script tags are unbalanced'
assert '/api/auth' in (root / 'public' / 'member.html').read_text(encoding='utf-8')
files = (p for p in root.rglob('*') if p.is_file() and '.git' not in p.parts and p.resolve() != Path(__file__).resolve() and p.suffix not in {'.docx', '.zip', '.mp3', '.pyc'})
source = '\n'.join(p.read_text(encoding='utf-8', errors='ignore') for p in files)
patterns = ["Kc@" + "790421", "gsk_" + r"[A-Za-z0-9]+", "vcp_" + r"[A-Za-z0-9]+"]
for pattern in patterns:
    assert not re.search(pattern, source), f'credential pattern found: {pattern}'
print('HTML script balance: PASS')
print('Member page API binding: PASS')
print('Known credential scan: PASS')
