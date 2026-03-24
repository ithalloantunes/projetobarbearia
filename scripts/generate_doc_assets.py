from __future__ import annotations

import html
import subprocess
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FIG_DIR = ROOT / 'docs_assets' / 'figures'
TMP_DIR = ROOT / 'docs_assets' / 'tmp_html'
REF_DIR = ROOT / 'web' / 'references'

PRIMARY = '#c59f59'
DARK = '#1a1814'
LIGHT = '#f7f4ef'
CARD = '#fffdfa'
TEXT = '#201d18'
MUTED = '#6b655e'
BORDER = '#ddd3c4'

CHROME_CANDIDATES = [
    Path(r'C:\Program Files\Google\Chrome\Application\chrome.exe'),
    Path(r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe'),
    Path(r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'),
    Path(r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'),
]


def find_browser() -> Path:
    for candidate in CHROME_CANDIDATES:
        if candidate.exists():
            return candidate
    raise FileNotFoundError('Chrome ou Edge nao encontrado para captura headless.')


BROWSER = find_browser()


def ensure_dirs() -> None:
    FIG_DIR.mkdir(parents=True, exist_ok=True)
    TMP_DIR.mkdir(parents=True, exist_ok=True)


FONT_CANDIDATES = [
    Path(r'C:\Windows\Fonts\arial.ttf'),
    Path(r'C:\Windows\Fonts\arialbd.ttf'),
    Path(r'C:\Windows\Fonts\calibri.ttf'),
    Path(r'C:\Windows\Fonts\consola.ttf'),
]


def get_font(size: int, bold: bool = False, mono: bool = False):
    candidates = []
    if mono:
        candidates.extend([Path(r'C:\Windows\Fonts\consola.ttf'), Path(r'C:\Windows\Fonts\cour.ttf')])
    elif bold:
        candidates.extend([Path(r'C:\Windows\Fonts\arialbd.ttf'), Path(r'C:\Windows\Fonts\calibrib.ttf')])
    else:
        candidates.extend([Path(r'C:\Windows\Fonts\arial.ttf'), Path(r'C:\Windows\Fonts\calibri.ttf')])
    for path in candidates + FONT_CANDIDATES:
        if path.exists():
            try:
                return ImageFont.truetype(str(path), size=size)
            except OSError:
                continue
    return ImageFont.load_default()


def screenshot(source: Path, output: Path, width: int, height: int, virtual_time_budget: int = 10000) -> None:
    args = [
        str(BROWSER),
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        '--allow-file-access-from-files',
        f'--window-size={width},{height}',
        f'--virtual-time-budget={virtual_time_budget}',
        f'--screenshot={output}',
        source.as_uri(),
    ]
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def crop_image(source: Path, output: Path, box: tuple[int, int, int, int]) -> None:
    with Image.open(source) as image:
        cropped = image.crop(box)
        cropped.save(output)


def text_wrap(draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> list[str]:
    words = text.split()
    if not words:
        return []
    lines = []
    current = words[0]
    for word in words[1:]:
        test = f'{current} {word}'
        width = draw.textbbox((0, 0), test, font=font)[2]
        if width <= max_width:
            current = test
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def draw_box(draw, xy, title, subtitle='', fill=CARD, outline=BORDER):
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle(xy, radius=18, fill=fill, outline=outline, width=2)
    title_font = get_font(28, bold=True)
    subtitle_font = get_font(20)
    draw.text((x1 + 20, y1 + 18), title, fill=TEXT, font=title_font)
    if subtitle:
        draw.text((x1 + 20, y1 + 62), subtitle, fill=MUTED, font=subtitle_font)


def create_canvas(width: int = 1600, height: int = 900, title: str = ''):
    image = Image.new('RGB', (width, height), LIGHT)
    draw = ImageDraw.Draw(image)
    if title:
        draw.text((70, 38), title, fill=TEXT, font=get_font(38, bold=True))
        draw.text((70, 86), 'BarberSaaS • documentação visual do projeto', fill=MUTED, font=get_font(22))
    return image, draw


def save_diagram(image: Image.Image, name: str) -> None:
    image.save(FIG_DIR / name)


def create_eap() -> None:
    image, draw = create_canvas(title='Figura 1 - Modelo EAP do Projeto')
    center = (610, 180, 990, 280)
    draw_box(draw, center, 'Projeto BarberSaaS', 'Sistema web para gestão de barbearias', fill='#f4ead8', outline=PRIMARY)
    nodes = [
        ((120, 420, 400, 520), 'Planejamento', 'escopo, requisitos e cronograma'),
        ((450, 420, 730, 520), 'Desenvolvimento', 'front-end, APIs e banco'),
        ((780, 420, 1060, 520), 'Qualidade', 'testes, validações e revisão'),
        ((1110, 420, 1390, 520), 'Entrega', 'documentação e preparação final'),
    ]
    for xy, title, subtitle in nodes:
        draw_box(draw, xy, title, subtitle)
        draw.line((800, 280, (xy[0] + xy[2]) // 2, xy[1]), fill=PRIMARY, width=5)
    bottom = [
        ((120, 650, 400, 745), 'Descoberta', 'levantamento do problema'),
        ((450, 650, 730, 745), 'Protótipos', 'telas e jornada de uso'),
        ((780, 650, 1060, 745), 'Persistência', 'Prisma e MySQL'),
        ((1110, 650, 1390, 745), 'Documentação', 'ABNT e entrega final'),
    ]
    for xy, title, subtitle in bottom:
        draw_box(draw, xy, title, subtitle, fill='#fffaf2')
    for idx in range(4):
        parent = nodes[idx][0]
        child = bottom[idx][0]
        draw.line(((parent[0] + parent[2]) // 2, parent[3], (child[0] + child[2]) // 2, child[1]), fill='#8c7a60', width=4)
    save_diagram(image, 'fig01_eap.png')


def create_fishbone(name: str, title: str, effect: str, branches: list[tuple[str, list[str]]]) -> None:
    image, draw = create_canvas(title=title)
    draw.line((180, 500, 1260, 500), fill=PRIMARY, width=8)
    draw.polygon([(1260, 460), (1390, 500), (1260, 540)], fill=PRIMARY)
    draw_box(draw, (1230, 360, 1490, 450), effect, 'efeito observado no projeto', fill='#f4ead8', outline=PRIMARY)
    upper_y = 290
    lower_y = 710
    branch_x = [330, 560, 790, 1020]
    label_font = get_font(22, bold=True)
    item_font = get_font(18)
    for idx, (label, items) in enumerate(branches[:4]):
        x = branch_x[idx]
        draw.line((x, 500, x - 110, upper_y), fill='#8c7a60', width=4)
        draw.text((x - 220, upper_y - 30), label, fill=TEXT, font=label_font)
        for item_idx, item in enumerate(items[:2]):
            y = upper_y + 30 + item_idx * 34
            draw.line((x - 45, 430 + item_idx * 24, x - 95, y + 8), fill='#8c7a60', width=2)
            draw.text((x - 315, y), f'• {item}', fill=MUTED, font=item_font)
    for idx, (label, items) in enumerate(branches[4:8]):
        x = branch_x[idx]
        draw.line((x, 500, x - 110, lower_y), fill='#8c7a60', width=4)
        draw.text((x - 220, lower_y - 8), label, fill=TEXT, font=label_font)
        for item_idx, item in enumerate(items[:2]):
            y = lower_y + 26 + item_idx * 34
            draw.line((x - 45, 570 + item_idx * 24, x - 95, y + 8), fill='#8c7a60', width=2)
            draw.text((x - 315, y), f'• {item}', fill=MUTED, font=item_font)
    save_diagram(image, name)


def create_org_chart() -> None:
    image, draw = create_canvas(title='Figura 4 - Gerenciamento de Recursos Humanos')
    draw_box(draw, (590, 180, 1010, 285), 'Product Owner', 'Dono da barbearia', fill='#f4ead8', outline=PRIMARY)
    draw_box(draw, (200, 420, 600, 525), 'Scrum Master', 'Ithallo Adriel Antunes')
    draw_box(draw, (700, 420, 1100, 525), 'Dev', 'Orlando Vieira Ribeiro Neto')
    draw_box(draw, (1100, 420, 1500, 525), 'Dev', 'Vinicius Takeshi Saito Cardoso')
    for child_x in [400, 900, 1300]:
        draw.line((800, 285, child_x, 420), fill=PRIMARY, width=4)
    draw_box(draw, (320, 660, 1280, 790), 'Papéis e responsabilidade compartilhada', 'descoberta do problema, priorização, implementação, revisão e documentação')
    for child_x in [400, 900, 1300]:
        draw.line((child_x, 525, 800, 660), fill='#8c7a60', width=3)
    save_diagram(image, 'fig04_rh.png')


def create_comms() -> None:
    image, draw = create_canvas(title='Figura 5 - Comunicação do Projeto')
    draw_box(draw, (90, 250, 420, 350), 'Cliente / P.O.', 'feedback do negócio', fill='#f4ead8', outline=PRIMARY)
    draw_box(draw, (520, 250, 1080, 350), 'Ritual de alinhamento', 'definição de prioridade, revisão e repasse')
    draw_box(draw, (1180, 250, 1510, 350), 'Equipe Dev', 'implementação e ajustes')
    draw.line((420, 300, 520, 300), fill=PRIMARY, width=5)
    draw.line((1080, 300, 1180, 300), fill=PRIMARY, width=5)
    draw.text((610, 410), 'Canais usados', fill=TEXT, font=get_font(26, bold=True))
    y = 470
    for label in ['reuniões rápidas de acompanhamento', 'mensagens para dúvidas e validações', 'registro em documentação técnica', 'revisão contínua de requisitos e telas']:
        draw.rounded_rectangle((600, y, 1050, y + 54), radius=14, fill=CARD, outline=BORDER, width=2)
        draw.text((625, y + 14), label, fill=MUTED, font=get_font(20))
        y += 72
    save_diagram(image, 'fig05_comunicacao.png')


BASE_CSS = """
:root {
  --primary: #c59f59;
  --dark: #1a1814;
  --light: #f7f4ef;
  --card: #fffdfa;
  --border: #ddd3c4;
  --text: #201d18;
  --muted: #6b655e;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: radial-gradient(circle at top left, #fffaf2, var(--light));
  color: var(--text);
}
.page {
  width: 100%;
  min-height: 100vh;
  padding: 42px;
}
.shell {
  max-width: 1320px;
  margin: 0 auto;
}
.header {
  display:flex; align-items:center; justify-content:space-between; margin-bottom:28px;
}
.brand {
  display:flex; gap:14px; align-items:center;
}
.logo {
  width:48px; height:48px; border-radius:14px; background:var(--primary); color:var(--dark); display:flex; align-items:center; justify-content:center; font-weight:700;
}
.title { font-size: 34px; font-weight: 700; margin: 0; }
.subtitle { color: var(--muted); margin-top: 6px; font-size: 16px; }
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 22px;
  box-shadow: 0 12px 36px rgba(32, 29, 24, 0.08);
}
.grid { display:grid; gap:20px; }
.badge { display:inline-block; padding:8px 12px; border-radius:999px; background:rgba(197,159,89,0.15); color:#7c5b24; font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; }
.kpi { padding:24px; }
.kpi strong { display:block; font-size: 34px; margin-top: 8px; }
.table { width:100%; border-collapse: collapse; }
.table th, .table td { padding: 16px 18px; border-bottom:1px solid #ece2d3; text-align:left; font-size:14px; }
.table th { color: var(--muted); font-size:12px; text-transform:uppercase; letter-spacing:0.08em; }
.tag { display:inline-block; padding:6px 10px; background:rgba(197,159,89,0.15); color:#7c5b24; border-radius:999px; font-size:12px; font-weight:700; }
.muted { color: var(--muted); }
.input {
  width:100%; padding:14px 16px; border:1px solid var(--border); border-radius:14px; background:#fff; margin-top:8px;
}
.button {
  display:inline-block; padding:14px 18px; border-radius:14px; background:var(--primary); color:var(--dark); font-weight:700; text-decoration:none;
}
.editor {
  background:#141313; color:#f5eee4; border-radius:18px; overflow:hidden; border:1px solid #2d2925;
}
.editor-head {
  padding:14px 18px; background:#201d1a; border-bottom:1px solid #312d28; color:#d2c7b7; font-size:13px;
}
.code {
  margin:0; padding:24px; font: 16px/1.6 Consolas, monospace; white-space:pre-wrap;
}
.code .ln { color:#8e877f; display:inline-block; width:36px; user-select:none; }
.hero {
  display:grid; grid-template-columns: 1.05fr 0.95fr; gap: 24px;
}
.panel { padding: 30px; }
.list li { margin-bottom: 10px; }
.chart { display:flex; align-items:flex-end; gap:18px; height:220px; padding: 10px 0; }
.bar { flex:1; background:linear-gradient(180deg, #d8b679, #c59f59); border-radius:18px 18px 8px 8px; }
.small { font-size: 13px; }
.center { text-align:center; }
"""


def mock_page(title: str, subtitle: str, body: str) -> str:
    return f"""<!DOCTYPE html><html lang='pt-BR'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>{html.escape(title)}</title><style>{BASE_CSS}</style></head><body><div class='page'><div class='shell'><div class='header'><div class='brand'><div class='logo'>BS</div><div><h1 class='title'>{html.escape(title)}</h1><div class='subtitle'>{html.escape(subtitle)}</div></div></div><span class='badge'>BarberSaaS</span></div>{body}</div></div></body></html>"""


def write_mock(name: str, html_content: str) -> Path:
    path = TMP_DIR / name
    path.write_text(html_content, encoding='utf-8')
    return path


def create_login_mock() -> None:
    body = """
    <div class='hero'>
      <div class='card panel' style='background:linear-gradient(135deg, #201d18, #2c251d); color:#fff6ea;'>
        <span class='badge'>Acesso Seguro</span>
        <h2 style='font-size:44px; margin:18px 0 8px;'>Entre para gerenciar sua barbearia</h2>
        <p style='color:#eadfce; line-height:1.7;'>Área de autenticação para barbeiros e administradores acompanharem agenda, indicadores e registros de atendimento.</p>
        <ul class='list' style='margin-top:28px; color:#eadfce;'>
          <li>Controle de acesso por perfil</li>
          <li>Centralização das rotinas operacionais</li>
          <li>Proteção de dados internos do negócio</li>
        </ul>
      </div>
      <div class='card panel'>
        <span class='badge'>Tela de Login</span>
        <div style='margin-top:26px;'>
          <label class='small muted'>E-mail</label>
          <input class='input' value='gestor@barbersaas.com'>
        </div>
        <div style='margin-top:18px;'>
          <label class='small muted'>Senha</label>
          <input class='input' value='••••••••••••'>
        </div>
        <div style='display:flex; justify-content:space-between; align-items:center; margin-top:18px; color:var(--muted); font-size:13px;'>
          <span><input type='checkbox' checked> lembrar acesso</span>
          <span>esqueci minha senha</span>
        </div>
        <div style='margin-top:26px; display:flex; gap:12px;'>
          <a class='button' href='#'>Entrar</a>
          <a class='button' href='#' style='background:#efe4d2;'>Acesso demo</a>
        </div>
      </div>
    </div>
    """
    path = write_mock('login.html', mock_page('Acesso ao Sistema', 'módulo de autenticação previsto para a plataforma', body))
    screenshot(path, FIG_DIR / 'fig06_login.png', 1500, 980)


def create_management_mock(filename: str, title: str, subtitle: str, heading: str, rows: list[tuple[str, str, str]]) -> None:
    row_html = ''.join(
        f"<tr><td><strong>{html.escape(a)}</strong></td><td>{html.escape(b)}</td><td><span class='tag'>{html.escape(c)}</span></td><td class='muted'>editar • ativar • excluir</td></tr>"
        for a, b, c in rows
    )
    body = f"""
    <div class='grid' style='grid-template-columns: 320px 1fr;'>
      <div class='card panel'>
        <span class='badge'>{html.escape(heading)}</span>
        <h2 style='font-size:30px; margin:20px 0 10px;'>{html.escape(title)}</h2>
        <p class='muted' style='line-height:1.7;'>{html.escape(subtitle)}</p>
        <div style='display:grid; gap:14px; margin-top:24px;'>
          <div class='card kpi'><span class='muted small'>Itens ativos</span><strong>{len(rows)}</strong></div>
          <div class='card kpi'><span class='muted small'>Atualização</span><strong>Hoje</strong></div>
        </div>
      </div>
      <div class='card panel'>
        <div style='display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;'>
          <div>
            <div class='badge'>Gestão</div>
            <h3 style='font-size:28px; margin:12px 0 0;'>{html.escape(heading)}</h3>
          </div>
          <a class='button' href='#'>Novo cadastro</a>
        </div>
        <table class='table'>
          <thead><tr><th>Nome</th><th>Detalhe</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>{row_html}</tbody>
        </table>
      </div>
    </div>
    """
    path = write_mock(filename + '.html', mock_page(title, subtitle, body))
    screenshot(path, FIG_DIR / filename, 1500, 1100)


def create_booking_stage_mocks() -> None:
    professional_body = """
    <div class='card panel'>
      <span class='badge'>Passo 2 de 4</span>
      <h2 style='font-size:30px; margin:18px 0 8px;'>Escolha o barbeiro</h2>
      <p class='muted'>Seleção do profissional que realizará o atendimento escolhido.</p>
      <div class='grid' style='grid-template-columns: repeat(4, 1fr); margin-top:26px;'>
        <div class='card panel center' style='padding:22px; border:2px solid var(--primary);'>
          <div style='width:88px; height:88px; border-radius:999px; margin:0 auto 12px; background:linear-gradient(135deg, #3a342d, #201d18); border:3px solid var(--primary);'></div>
          <strong style='font-size:24px;'>Marcus</strong>
          <div class='muted'>Senior</div>
        </div>
        <div class='card panel center' style='padding:22px;'>
          <div style='width:88px; height:88px; border-radius:999px; margin:0 auto 12px; background:linear-gradient(135deg, #4e4a44, #26211d);'></div>
          <strong style='font-size:24px;'>André</strong>
          <div class='muted'>Master</div>
        </div>
        <div class='card panel center' style='padding:22px;'>
          <div style='width:88px; height:88px; border-radius:999px; margin:0 auto 12px; background:linear-gradient(135deg, #424548, #1e2022);'></div>
          <strong style='font-size:24px;'>Ricardo</strong>
          <div class='muted'>Junior</div>
        </div>
        <div class='card panel center' style='padding:22px;'>
          <div style='width:88px; height:88px; border-radius:999px; margin:0 auto 12px; background:#ece5da; display:flex; align-items:center; justify-content:center; color:var(--muted); font-weight:700;'>+</div>
          <strong style='font-size:24px;'>Qualquer um</strong>
          <div class='muted'>Disponível</div>
        </div>
      </div>
    </div>
    """
    path = write_mock('booking_professional.html', mock_page('Seleção de Profissional', 'etapa de escolha do barbeiro para o agendamento', professional_body))
    screenshot(path, FIG_DIR / 'fig09_barbeiro.png', 1500, 900)

    datetime_body = """
    <div class='grid' style='grid-template-columns: 1.1fr 0.9fr;'>
      <div class='card panel'>
        <span class='badge'>Passo 3 de 4</span>
        <h2 style='font-size:30px; margin:18px 0 8px;'>Escolha a data</h2>
        <div style='display:grid; grid-template-columns:repeat(7, 1fr); gap:10px; margin-top:24px; text-align:center;'>
          <div class='muted small'>DOM</div><div class='muted small'>SEG</div><div class='muted small'>TER</div><div class='muted small'>QUA</div><div class='muted small'>QUI</div><div class='muted small'>SEX</div><div class='muted small'>SAB</div>
          <div class='card panel center' style='padding:14px;'>1</div><div class='card panel center' style='padding:14px;'>2</div><div class='card panel center' style='padding:14px;'>3</div><div class='card panel center' style='padding:14px;'>4</div><div class='card panel center' style='padding:14px; border:2px solid var(--primary); background:#f4ead8;'>5</div><div class='card panel center' style='padding:14px;'>6</div><div class='card panel center' style='padding:14px;'>7</div>
          <div class='card panel center' style='padding:14px;'>8</div><div class='card panel center' style='padding:14px;'>9</div><div class='card panel center' style='padding:14px;'>10</div><div class='card panel center' style='padding:14px;'>11</div><div class='card panel center' style='padding:14px;'>12</div><div class='card panel center' style='padding:14px;'>13</div><div class='card panel center' style='padding:14px;'>14</div>
        </div>
      </div>
      <div class='card panel'>
        <span class='badge'>Horários</span>
        <h2 style='font-size:30px; margin:18px 0 8px;'>Slots disponíveis</h2>
        <div class='grid' style='grid-template-columns:1fr 1fr; margin-top:24px;'>
          <div class='card panel center' style='padding:18px;'>09:00</div>
          <div class='card panel center' style='padding:18px;'>10:00</div>
          <div class='card panel center' style='padding:18px; border:2px solid var(--primary); background:#f4ead8; font-weight:700;'>11:00</div>
          <div class='card panel center' style='padding:18px;'>13:30</div>
          <div class='card panel center' style='padding:18px;'>14:00</div>
          <div class='card panel center' style='padding:18px;'>15:30</div>
          <div class='card panel center' style='padding:18px;'>16:45</div>
          <div class='card panel center' style='padding:18px;'>18:00</div>
        </div>
      </div>
    </div>
    """
    path = write_mock('booking_datetime.html', mock_page('Data e Horário', 'consulta dos horários compatíveis com o serviço e profissional', datetime_body))
    screenshot(path, FIG_DIR / 'fig10_data_horario.png', 1500, 980)

    confirmation_body = """
    <div class='grid' style='grid-template-columns: 1fr 0.9fr;'>
      <div class='card panel'>
        <span class='badge'>Passo 4 de 4</span>
        <h2 style='font-size:30px; margin:18px 0 8px;'>Confirmação do Agendamento</h2>
        <p class='muted'>Revise os dados antes de persistir a reserva no sistema.</p>
        <div class='grid' style='grid-template-columns:1fr 1fr; margin-top:22px;'>
          <div class='card panel'><div class='muted small'>Serviço</div><strong style='font-size:24px;'>Corte de cabelo</strong></div>
          <div class='card panel'><div class='muted small'>Profissional</div><strong style='font-size:24px;'>Marcus</strong></div>
          <div class='card panel'><div class='muted small'>Data</div><strong style='font-size:24px;'>05/11/2024</strong></div>
          <div class='card panel'><div class='muted small'>Horário</div><strong style='font-size:24px;'>11:00</strong></div>
        </div>
      </div>
      <div class='card panel'>
        <span class='badge'>Resumo</span>
        <table class='table' style='margin-top:18px;'>
          <tbody>
            <tr><td><strong>Valor previsto</strong></td><td>R$ 65,00</td></tr>
            <tr><td><strong>Duração</strong></td><td>45 min</td></tr>
            <tr><td><strong>Notificação</strong></td><td>e-mail e WhatsApp</td></tr>
          </tbody>
        </table>
        <div style='display:flex; gap:12px; margin-top:26px;'>
          <a class='button' href='#' style='background:#efe4d2;'>Voltar</a>
          <a class='button' href='#'>Confirmar agendamento</a>
        </div>
      </div>
    </div>
    """
    path = write_mock('booking_confirmation.html', mock_page('Resumo Final do Agendamento', 'última validação antes do envio para a API', confirmation_body))
    screenshot(path, FIG_DIR / 'fig11_confirmacao.png', 1500, 920)


def create_appointments_mock() -> None:
    body = """
    <div class='card panel'>
      <div style='display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;'>
        <div>
          <span class='badge'>Consulta Operacional</span>
          <h2 style='font-size:30px; margin:16px 0 0;'>Agendamentos cadastrados</h2>
        </div>
        <a class='button' href='#'>Filtrar período</a>
      </div>
      <table class='table'>
        <thead><tr><th>Cliente</th><th>Barbeiro</th><th>Serviço</th><th>Horário</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td><strong>Gustavo Oliveira</strong></td><td>Marcus</td><td>Corte + barba</td><td>14:30</td><td><span class='tag'>pendente</span></td></tr>
          <tr><td><strong>Marcos Henrique</strong></td><td>André</td><td>Corte de cabelo</td><td>15:15</td><td><span class='tag'>confirmado</span></td></tr>
          <tr><td><strong>Thiago Santos</strong></td><td>Ricardo</td><td>Barba terapia</td><td>16:00</td><td><span class='tag'>em espera</span></td></tr>
          <tr><td><strong>Rodrigo Faro</strong></td><td>Marcus</td><td>Combo premium</td><td>16:45</td><td><span class='tag'>confirmado</span></td></tr>
        </tbody>
      </table>
    </div>
    """
    path = write_mock('appointments_admin.html', mock_page('Consulta de Agendamentos', 'visualização administrativa dos registros realizados', body))
    screenshot(path, FIG_DIR / 'fig17_agendamentos.png', 1500, 900)


def create_report_mock() -> None:
    body = """
    <div class='grid' style='grid-template-columns: repeat(3, 1fr);'>
      <div class='card kpi'><span class='muted small'>Atendimentos no dia</span><strong>27</strong></div>
      <div class='card kpi'><span class='muted small'>Receita estimada</span><strong>R$ 1.845</strong></div>
      <div class='card kpi'><span class='muted small'>Ticket médio</span><strong>R$ 68</strong></div>
    </div>
    <div class='grid' style='grid-template-columns: 1.2fr 0.8fr; margin-top:24px;'>
      <div class='card panel'>
        <div class='badge'>Relatório Diário</div>
        <h3 style='font-size:30px; margin:16px 0;'>Distribuição de atendimentos</h3>
        <div class='chart'>
          <div class='bar' style='height:42%;'></div>
          <div class='bar' style='height:72%;'></div>
          <div class='bar' style='height:88%;'></div>
          <div class='bar' style='height:64%;'></div>
          <div class='bar' style='height:54%;'></div>
          <div class='bar' style='height:28%;'></div>
        </div>
        <div style='display:flex; justify-content:space-between; color:var(--muted); font-size:12px; font-weight:700; letter-spacing:0.06em;'>
          <span>09H</span><span>11H</span><span>13H</span><span>15H</span><span>17H</span><span>19H</span>
        </div>
      </div>
      <div class='card panel'>
        <div class='badge'>Resumo</div>
        <table class='table' style='margin-top:16px;'>
          <tbody>
            <tr><td><strong>Corte de cabelo</strong></td><td>11</td></tr>
            <tr><td><strong>Barba</strong></td><td>7</td></tr>
            <tr><td><strong>Combo premium</strong></td><td>5</td></tr>
            <tr><td><strong>Sobrancelha</strong></td><td>4</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    """
    path = write_mock('report.html', mock_page('Relatórios Operacionais', 'visualização gerencial por período e serviço', body))
    screenshot(path, FIG_DIR / 'fig18_relatorio.png', 1500, 1100)


def create_code_mock(filename: str, title: str, subtitle: str, source_path: Path, start_line: int, max_lines: int) -> None:
    source_lines = source_path.read_text(encoding='utf-8').splitlines()[start_line - 1 : start_line - 1 + max_lines]
    rendered = []
    for idx, line in enumerate(source_lines, start_line):
        rendered.append(f"<span class='ln'>{idx:>3}</span>{html.escape(line)}")
    body = f"""
    <div class='editor'>
      <div class='editor-head'>{html.escape(str(source_path.relative_to(ROOT)))} • recorte do código-fonte</div>
      <pre class='code'>{'<br>'.join(rendered)}</pre>
    </div>
    """
    path = write_mock(filename + '.html', mock_page(title, subtitle, body))
    screenshot(path, FIG_DIR / filename, 1600, 1200)


def create_reference_screens() -> None:
    screenshot(REF_DIR / 'part1.html', FIG_DIR / 'ref_part1_full.png', 1440, 2300, 12000)
    screenshot(REF_DIR / 'part2.html', FIG_DIR / 'ref_part2_full.png', 1440, 3400, 12000)
    screenshot(REF_DIR / 'part3.html', FIG_DIR / 'ref_part3_full.png', 1600, 2600, 12000)
    screenshot(REF_DIR / 'part4.html', FIG_DIR / 'ref_part4_full.png', 1440, 2200, 12000)

    crop_image(FIG_DIR / 'ref_part1_full.png', FIG_DIR / 'fig07_inicio.png', (80, 80, 1360, 1880))
    crop_image(FIG_DIR / 'ref_part2_full.png', FIG_DIR / 'fig08_servicos.png', (120, 220, 1320, 1260))
    crop_image(FIG_DIR / 'ref_part2_full.png', FIG_DIR / 'fig09_barbeiro.png', (160, 1180, 1280, 1880))
    crop_image(FIG_DIR / 'ref_part2_full.png', FIG_DIR / 'fig10_data_horario.png', (80, 1780, 1360, 2860))
    crop_image(FIG_DIR / 'ref_part2_full.png', FIG_DIR / 'fig11_confirmacao.png', (260, 2860, 1180, 3340))
    crop_image(FIG_DIR / 'ref_part4_full.png', FIG_DIR / 'fig12_agenda_barbeiro.png', (90, 70, 1350, 1750))
    crop_image(FIG_DIR / 'ref_part4_full.png', FIG_DIR / 'fig13_bloqueios.png', (110, 620, 1330, 1540))
    crop_image(FIG_DIR / 'ref_part3_full.png', FIG_DIR / 'fig16_admin.png', (260, 60, 1540, 1620))
    crop_image(FIG_DIR / 'ref_part3_full.png', FIG_DIR / 'fig17_agendamentos.png', (300, 1460, 1540, 2450))


def create_diagrams() -> None:
    create_eap()
    create_fishbone(
        'fig02_atraso.png',
        'Figura 2 - Espinha de Peixe: Atraso do Projeto',
        'Atraso do projeto',
        [
            ('Pessoas', ['alinhamento incompleto', 'distribuição desigual de tarefas']),
            ('Processo', ['mudança frequente de escopo', 'dependência entre módulos']),
            ('Tecnologia', ['erros em integração', 'ajustes na regra de negócio']),
            ('Comunicação', ['feedback tardio', 'decisões sem registro']),
            ('Planejamento', ['estimativas otimistas', 'priorização instável']),
            ('Documentação', ['atualização tardia', 'informação dispersa']),
            ('Infraestrutura', ['ambiente local inconsistente', 'dependências externas']),
            ('Validação', ['testes insuficientes', 'retrabalho de tela']),
        ],
    )
    create_fishbone(
        'fig03_indisponibilidade.png',
        'Figura 3 - Espinha de Peixe: Indisponibilidade do Sistema',
        'Indisponibilidade do sistema',
        [
            ('Back-end', ['falha em rota', 'erro de validação']),
            ('Banco', ['conexão indisponível', 'dados inconsistentes']),
            ('Front-end', ['estado incorreto', 'tratamento incompleto']),
            ('Integração', ['payload inválido', 'timeout externo']),
            ('Hospedagem', ['infraestrutura instável', 'deploy com falha']),
            ('Segurança', ['credenciais ausentes', 'limites de acesso']),
            ('Operação', ['ausência de monitoramento', 'resposta lenta a incidentes']),
            ('Manutenção', ['mudanças sem revisão', 'falta de rollback']),
        ],
    )
    create_org_chart()
    create_comms()


def create_custom_mocks() -> None:
    create_login_mock()
    create_booking_stage_mocks()
    create_management_mock(
        'fig14_servicos.png',
        'Serviços da Barbearia',
        'cadastro e manutenção dos atendimentos oferecidos',
        'Manter Serviço',
        [
            ('Corte de cabelo', '45 min • R$ 65,00', 'ativo'),
            ('Barba terapia', '30 min • R$ 45,00', 'ativo'),
            ('Combo premium', '90 min • R$ 100,00', 'ativo'),
            ('Sobrancelha', '15 min • R$ 20,00', 'ativo'),
        ],
    )
    create_management_mock(
        'fig15_barbeiros.png',
        'Equipe de Barbeiros',
        'gestão de profissionais, perfis e disponibilidade operacional',
        'Manter Barbeiro',
        [
            ('Marcus', 'Senior • cortes e barba', 'ativo'),
            ('André', 'Master • visagismo', 'ativo'),
            ('Ricardo', 'Junior • cortes rápidos', 'ativo'),
            ('Vinicius', 'Especialista • acabamento', 'ativo'),
        ],
    )
    create_appointments_mock()
    create_report_mock()
    create_code_mock(
        'fig19_frontend.png',
        'Front-end com Next.js e React',
        'recorte de tela do código da camada de interface',
        ROOT / 'web' / 'src' / 'app' / 'agendar' / 'page.tsx',
        1,
        34,
    )
    create_code_mock(
        'fig20_backend.png',
        'Back-end com Next.js API e Prisma',
        'recorte de tela do código da API de agendamentos',
        ROOT / 'web' / 'src' / 'app' / 'api' / 'appointments' / 'route.ts',
        1,
        42,
    )


def main() -> None:
    ensure_dirs()
    create_diagrams()
    create_reference_screens()
    create_custom_mocks()
    print(f'Assets gerados em: {FIG_DIR}')


if __name__ == '__main__':
    main()
