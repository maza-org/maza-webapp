from pathlib import Path
import fitz

output = Path(__file__).resolve().parent.parent / '.codex-tmp' / 'certificate-verification-20261125'
expected = (output / 'expected-url.txt').read_text()
for name in ('web-certificate', 'native-certificate'):
    with fitz.open(output / (name + '.pdf')) as pdf:
        assert len(pdf) == 1, (name, 'unexpected extra page')
        page = pdf[0]
        assert page.rect.width > page.rect.height
        assert any(link.get('uri') == expected for link in page.get_links()), (name, 'missing signed link')
        assert 'Titular de Teste'.upper() in page.get_text().upper()
        page.get_pixmap(matrix=fitz.Matrix(2, 2)).save(output / (name + '-render.png'))
        print('PASS:', name, 'single landscape page, signed clickable link, holder text, rendered PNG')
