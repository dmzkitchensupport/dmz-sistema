#!/usr/bin/env python3
"""
DMZ AUDITORIA — Suite de Pruebas Estaticas
Ejecuta 60+ verificaciones sobre AUDITORIA_AI_v8.html
Genera reporte en .github/reports/test_report.txt

Uso local:  python3 .github/scripts/test_auditoria.py
GitHub CI:  corre automatico en cada push a main
"""

import re, sys, os, json
from pathlib import Path
from datetime import datetime

# ── Rutas ──────────────────────────────────────────────────────────
ROOT     = Path(__file__).parent.parent.parent
HTML_FILE = ROOT / 'AUDITORIA_AI_v8.html'
REPORT_DIR = ROOT / '.github' / 'reports'
REPORT_FILE = REPORT_DIR / 'test_report.txt'

# ── Colores ANSI para terminal ──────────────────────────────────────
GREEN  = '\033[92m'
RED    = '\033[91m'
AMBER  = '\033[93m'
CYAN   = '\033[96m'
BOLD   = '\033[1m'
RESET  = '\033[0m'

# ── Estado global ──────────────────────────────────────────────────
results = []   # (id, name, ok, detail)

def check(test_id, name, condition, detail_pass='', detail_fail=''):
    ok = bool(condition)
    detail = detail_pass if ok else detail_fail
    results.append((test_id, name, ok, detail))
    return ok

def contains(s, sub):
    return sub in s

def fn_defined(s, name):
    return f'function {name}(' in s or f'function {name} (' in s

# ── Carga del archivo ──────────────────────────────────────────────
if not HTML_FILE.exists():
    print(f'{RED}ERROR: {HTML_FILE} no encontrado{RESET}')
    sys.exit(1)

with open(HTML_FILE, 'r', encoding='utf-8') as f:
    src = f.read()

size_kb = len(src.encode('utf-8')) / 1024
print(f'{CYAN}Archivo: {HTML_FILE.name} — {size_kb:.1f} KB{RESET}')
print()

# ══════════════════════════════════════════════════════════════════
# GRUPO 1: ESTRUCTURA BASICA
# ══════════════════════════════════════════════════════════════════
print(f'{BOLD}[01] ESTRUCTURA BASICA{RESET}')
check('s01', 'DOCTYPE html',          src.strip().lower().startswith('<!doctype html>'), 'Presente', 'FALTANTE')
check('s02', 'Meta charset UTF-8',    'charset="UTF-8"' in src,                          'UTF-8',    'FALTANTE')
check('s03', 'Meta viewport',         'name="viewport"' in src,                          'Presente', 'FALTANTE')
check('s04', 'Idioma es',             'lang="es"' in src,                                 'lang=es',  'FALTANTE')
check('s05', 'Tamaño > 100 KB',       size_kb > 100, f'{size_kb:.1f} KB OK', f'Solo {size_kb:.1f} KB — muy pequeño')
check('s06', 'DMZ en titulo',         'DMZ Kitchen Support' in src,                       'Presente', 'FALTANTE')
check('s07', 'html2pdf CDN',          'html2pdf' in src,                                  'Presente', 'FALTANTE')
check('s08', 'heic2any CDN',          'heic2any' in src,                                  'Presente', 'FALTANTE')
check('s09', 'Google Fonts Raleway',  'Raleway' in src,                                   'Presente', 'FALTANTE')

# ══════════════════════════════════════════════════════════════════
# GRUPO 2: VERSION
# ══════════════════════════════════════════════════════════════════
print(f'{BOLD}[02] VERSION{RESET}')
ver_match = re.search(r'v(\d+)\.(\d+)', src)
has_ver   = bool(ver_match)
major     = int(ver_match.group(1)) if ver_match else 0
check('v01', 'Version detectada',     has_ver, f'v{ver_match.group(1)}.{ver_match.group(2)}' if has_ver else '', 'No detectada')
check('v02', 'Version >= 10',         major >= 10, f'v{major} OK', f'v{major} < 10')
check('v03', 'Version en JS state',   "'10.0'" in src or '"10.0"' in src, '10.0 en saveState', 'No en JS state')

# ══════════════════════════════════════════════════════════════════
# GRUPO 3: TABS DE NAVEGACION
# ══════════════════════════════════════════════════════════════════
print(f'{BOLD}[03] TABS{RESET}')
for tid, btn in [('n01','btn-cap'),('n02','btn-dash'),('n03','btn-ali'),
                  ('n04','btn-hz'),('n05','btn-clima2'),('n06','btn-rep'),('n07','btn-hist')]:
    check(tid, f'Tab {btn}', f'id="{btn}"' in src, 'Presente', 'FALTANTE')

check('n08', "setMode maneja 'ali'",   "m === 'ali'" in src, 'Presente', 'FALTANTE')
check('n09', 'Drive strip presente',   'id="drive-strip"' in src, 'Presente', 'FALTANTE')

# ══════════════════════════════════════════════════════════════════
# GRUPO 4: FUNCIONES JS CORE
# ══════════════════════════════════════════════════════════════════
print(f'{BOLD}[04] FUNCIONES JS — CORE{RESET}')
core_fns = [
    ('f01','init'), ('f02','setMode'), ('f03','saveSession'),
    ('f04','loadSession'), ('f05','buildReport'), ('f06','renderGrid'),
    ('f07','renderAreaNav'), ('f08','updateProgress'), ('f09','analyzePhoto'),
    ('f10','buildClima2View'), ('f11','generarResumenClima2'),
    ('f12','buildHistorial'), ('f13','saveToHistorial'),
    ('f14','openDelivery'), ('f15','startDelivery'),
    ('f16','exportReportePDF'), ('f17','exportSession'),
]
for (tid, fname) in core_fns:
    check(tid, f'{fname}()', fn_defined(src, fname), 'Definida', 'FALTANTE')

# ══════════════════════════════════════════════════════════════════
# GRUPO 5: MODULO ALIMENTOS
# ══════════════════════════════════════════════════════════════════
print(f'{BOLD}[05] MODULO ALIMENTOS{RESET}')
ali_fns = [
    ('a01','buildAlimentosView'), ('a02','addAlimentoCard'),
    ('a03','setAliStatus'), ('a04','deleteAliCard'),
    ('a05','updateAliField'), ('a06','checkAliTemp'),
    ('a07','renderAlimentosGrid'), ('a08','updateAliSummary'),
    ('a09','buildAlimentosReportSection'), ('a10','exportAlimentosPDF'),
]
for (tid, fname) in ali_fns:
    check(tid, f'{fname}()', fn_defined(src, fname), 'Definida', 'FALTANTE')

check('a11', 'div#alimentos-view',     'id="alimentos-view"' in src, 'Presente', 'FALTANTE')
check('a12', 'ali-grid container',     'id="ali-grid"' in src,       'Presente', 'FALTANTE')
check('a13', 'CSS .ali-card',          '.ali-card {' in src,          'Presente', 'FALTANTE')
check('a14', 'CSS .ali-ect-btn',        '.ali-ect-btn' in src,          'Presente', 'FALTANTE')
check('a15', 'CSS ali-foto-zone',       'ali-foto-zone' in src,         'Presente', 'FALTANTE')
check('a16', 'ALI_STATE definido',     'ALI_STATE = {' in src,        'Presente', 'FALTANTE')
check('a17', 'aliState en saveSession','aliState:' in src,             'Presente', 'FALTANTE')
check('a18', 'aliState en loadSession','saved.aliState' in src,        'Presente', 'FALTANTE')

# ══════════════════════════════════════════════════════════════════
# GRUPO 6: DICCIONARIO Y SANITIZACION
# ══════════════════════════════════════════════════════════════════
print(f'{BOLD}[06] DICCIONARIO Y SANITIZACION{RESET}')
check('d01', 'DICCIONARIO_ACTIVO',       'DICCIONARIO_ACTIVO' in src,         'Presente', 'FALTANTE')
check('d02', 'sanitizarTexto()',          fn_defined(src, 'sanitizarTexto'),   'Definida',  'FALTANTE')
check('d03', 'Regla masa madre',          r'masa\s+madre' in src or 'masa\\s+madre' in src, 'Presente', 'FALTANTE')
check('d04', 'Regla muy sucio',           'muy\\\\s+sucio' in src or "muy\\s+sucio" in src, 'Presente', 'FALTANTE')
check('d05', 'Regla ADN',                 '\\\\badn\\\\b' in src or 'badn' in src.lower(),  'Presente', 'FALTANTE')
check('d06', 'DICCIONARIO itera forEach','DICCIONARIO_ACTIVO.forEach' in src, 'Presente', 'FALTANTE')
num_rules = src.count('{ rx:')
check('d07', f'Minimo 20 reglas ({num_rules})', num_rules >= 20, f'{num_rules} reglas', f'Solo {num_rules}')

# ══════════════════════════════════════════════════════════════════
# GRUPO 7: HIGHLIGHT DE PALABRAS CLAVE
# ══════════════════════════════════════════════════════════════════
print(f'{BOLD}[07] KEYWORD HIGHLIGHT{RESET}')
check('k01', 'KW_HIGHLIGHT_RE definido',      'KW_HIGHLIGHT_RE' in src,               'Presente', 'FALTANTE')
check('k02', 'highlightKeywords() definida',   fn_defined(src, 'highlightKeywords'),   'Definida',  'FALTANTE')
check('k03', 'PEPS en regex',                  'PEPS' in src,                           'Presente', 'FALTANTE')
check('k04', '5S en regex',                    '5S' in src,                             'Presente', 'FALTANTE')
check('k05', 'pre-fermento en regex',          'pre-fermento' in src,                   'Presente', 'FALTANTE')
check('k06', 'highlightKeywords en buildReport','highlightKeywords(rawReport)' in src,  'Presente', 'FALTANTE')
check('k07', 'kw-highlight CSS clase',         'kw-highlight' in src,                   'Presente', 'FALTANTE')

# ══════════════════════════════════════════════════════════════════
# GRUPO 8: REPORTE UNIFICADO
# ══════════════════════════════════════════════════════════════════
print(f'{BOLD}[08] REPORTE UNIFICADO{RESET}')
check('r01', 'Modulo I: Evidencia',           'I · EVIDENCIA' in src,           'Presente', 'FALTANTE')
check('r02', 'Modulo II: Clima',              'II · EVALUACI' in src,           'Presente', 'FALTANTE')
check('r03', 'Modulo III: Alimentos',         'III · CALIFICACI' in src,        'Presente', 'FALTANTE')
check('r04', 'Modulo IV: Hallazgos',          'IV · HALLAZGOS' in src,          'Presente', 'FALTANTE')
check('r05', 'rpt-module-divider CSS',        'rpt-module-divider' in src,      'Presente', 'FALTANTE')
check('r06', 'buildAlimentosReportSection en buildReport', 'buildAlimentosReportSection()' in src, 'Presente', 'FALTANTE')
check('r07', 'buildClima2ReportSection en buildReport',    'buildClima2ReportSection()' in src,    'Presente', 'FALTANTE')
check('r08', 'buildHallazgosReportSection en buildReport', 'buildHallazgosReportSection()' in src, 'Presente', 'FALTANTE')

# ══════════════════════════════════════════════════════════════════
# GRUPO 9: GOOGLE DRIVE Y BACKEND
# ══════════════════════════════════════════════════════════════════
print(f'{BOLD}[09] DRIVE Y BACKEND{RESET}')
check('g01', 'DRIVE_CONFIG definido',         'DRIVE_CONFIG = {' in src,              'Presente', 'FALTANTE')
check('g02', 'driveConnect()',                 fn_defined(src, 'driveConnect'),        'Definida',  'FALTANTE')
check('g03', 'driveHandleOAuthCallback()',     fn_defined(src, 'driveHandleOAuthCallback'), 'Definida', 'FALTANTE')
check('g04', 'driveUploadFile()',              fn_defined(src, 'driveUploadFile'),     'Definida',  'FALTANTE')
check('g05', 'driveBackupSession()',           fn_defined(src, 'driveBackupSession'),  'Definida',  'FALTANTE')
check('g06', 'driveHandleOAuth en init()',     'driveHandleOAuthCallback' in src[src.find('function init()'):src.find('function init()')+600],
             'En init()', 'NO en init()')
check('g07', 'SB Supabase config definido',    'SB = {' in src,                       'Presente', 'FALTANTE')
check('g08', 'sbSaveAuditoria()',              fn_defined(src, 'sbSaveAuditoria'),     'Definida',  'FALTANTE')
check('g09', 'Drive backup en saveSession',    'driveBackupSession()' in src,          'Presente', 'FALTANTE')

# ══════════════════════════════════════════════════════════════════
# GRUPO 10: PERSISTENCIA IndexedDB
# ══════════════════════════════════════════════════════════════════
print(f'{BOLD}[10] PERSISTENCIA — IndexedDB{RESET}')
check('p01', "STORAGE_KEY = 'dmz_audit_v4'", "STORAGE_KEY = 'dmz_audit_v4'" in src, 'OK', 'No coincide')
check('p02', 'IDB_NAME definido',             'IDB_NAME' in src,                     'Presente', 'FALTANTE')
check('p03', "IDB_STORE = 'photos'",          "IDB_STORE   = 'photos'" in src,        'OK', 'No coincide')
check('p04', 'openIDB() definida',            fn_defined(src, 'openIDB'),             'Definida', 'FALTANTE')
check('p05', 'idbPutPhoto() definida',        fn_defined(src, 'idbPutPhoto'),         'Definida', 'FALTANTE')
check('p06', 'idbGetPhoto() definida',        fn_defined(src, 'idbGetPhoto'),         'Definida', 'FALTANTE')
check('p07', 'idbClearAll() definida',        fn_defined(src, 'idbClearAll'),         'Definida', 'FALTANTE')
check('p08', 'HIST_IDB dmz_historial',        'dmz_historial' in src,                'Presente', 'FALTANTE')

# ══════════════════════════════════════════════════════════════════
# GRUPO 11: REGRESION — TERMINOLOGIA
# ══════════════════════════════════════════════════════════════════
print(f'{BOLD}[11] REGRESION — TERMINOLOGIA{RESET}')

# "masa madre" solo puede aparecer como patron regex (/masa\s+madre/)
# no como texto visible en la interfaz
src_no_regex = re.sub(r'/[^/]+/gi?', '', src)  # quitar bloques regex
src_no_comments = re.sub(r'<!--.*?-->', '', src, flags=re.DOTALL)  # quitar comentarios HTML
check('te01', 'Sin "masa madre" en UI', 'masa madre' not in src_no_regex.lower(),
      'No en texto UI', '"masa madre" en texto UI')

# "ADN" no debe aparecer como texto en botones ni labels
adn_in_ui = bool(re.search(r'(?:placeholder|>)[^<]*\bADN\b', src, re.IGNORECASE))
check('te02', 'Sin "ADN" en textos UI', not adn_in_ui, 'No detectado', 'ADN en texto UI')

# Verificar emojis Unicode
emoji_re = re.compile(
    r'[\U0001F300-\U0001FFFF\U00002702-\U000027B0\U000024C2-\U0001F251]',
    re.UNICODE
)
# Solo buscar en texto visible (contenido de etiquetas, no en JS)
ui_text = re.findall(r'(?:<button[^>]*>|<div[^>]*>|<span[^>]*>|<td[^>]*>|<option[^>]*>)([^<]*)', src)
emoji_hits = [t.strip() for t in ui_text if emoji_re.search(t) and t.strip()]
check('te03', 'Sin emojis en elementos UI', len(emoji_hits) == 0,
      'Sin emojis', f'{len(emoji_hits)} elementos con emoji: {emoji_hits[:2]}')

check('te04', '"pre-fermento" presente',   'pre-fermento' in src,  'Presente', 'FALTANTE')
check('te05', 'POWERED BY DMZ presente',   'POWERED BY' in src,    'Presente', 'FALTANTE')
check('te06', 'CL2 tiene 13 preguntas',    src.count('¿') >= 13,   f'{src.count("¿")} encontradas', 'Menos de 13')
check('te07', 'No hay "localStorage only"','localStorage only' not in src, 'OK', 'Frase obsoleta presente')

# ══════════════════════════════════════════════════════════════════

# GRUPO 12: FUNCIONALES — FLUJO Y BOTONES
print(f'{BOLD}[12] FUNCIONALES{RESET}')
check('fn01', 'Drop zone presente',            'id="drop-zone"' in src,               'Presente', 'FALTANTE')
check('fn02', 'File input formatos RAW',       '.dng' in src and '.nef' in src,        'Presente', 'FALTANTE')
check('fn03', 'Boton analizar area',           'id="btn-analyze-all"' in src,          'Presente', 'FALTANTE')
check('fn04', 'Input cliente',                 'id="inp-client"' in src,               'Presente', 'FALTANTE')
check('fn05', 'Input API key',                 'id="inp-key"' in src,                  'Presente', 'FALTANTE')
check('fn06', 'Photo grid container',          'id="photo-grid"' in src,               'Presente', 'FALTANTE')
check('fn07', 'Annotation modal',              'id="ann-modal"' in src,                'Presente', 'FALTANTE')
check('fn08', 'Session modal',                 'id="session-modal"' in src,            'Presente', 'FALTANTE')
check('fn09', 'Toast element',                 'id="toast"' in src,                    'Presente', 'FALTANTE')
check('fn10', 'markDirty() definida',          fn_defined(src, 'markDirty'),           'Definida',  'FALTANTE')
check('fn11', 'Auto-save 60s',                 '60000' in src,                         'Presente', 'FALTANTE')
check('fn12', 'Chips de incidencia',           'chips-row' in src,                     'Presente', 'FALTANTE')
check('fn13', 'Plan accion editable',          'contenteditable="true"' in src,        'Presente', 'FALTANTE')
check('fn14', 'buildAlimentosView en setMode', "buildAlimentosView()" in src,          'Presente', 'FALTANTE')
check('fn15', 'Hz textarea presente',          'id="hz-textarea"' in src,              'Presente', 'FALTANTE')

# GRUPO 13: API ANTHROPIC
print(f'{BOLD}[13] API ANTHROPIC{RESET}')
check('ap01', 'Endpoint /v1/messages',         '/v1/messages' in src,                  'Presente', 'FALTANTE')
check('ap02', 'claude-haiku modelo',           'claude-haiku' in src,                  'Presente', 'FALTANTE')
check('ap03', 'claude-sonnet modelo',          'claude-sonnet' in src,                 'Presente', 'FALTANTE')
check('ap04', 'Header dangerous-direct',       'anthropic-dangerous-direct-browser-access' in src, 'Presente', 'FALTANTE')
check('ap05', 'anthropic-version header',      'anthropic-version' in src,             'Presente', 'FALTANTE')
check('ap06', 'analyzeAll() definida',         fn_defined(src, 'analyzeAll'),          'Definida',  'FALTANTE')
check('ap07', 'Response content[0].text',      "content?.[0]?.text" in src or "content[0].text" in src, 'Presente', 'FALTANTE')
check('ap08', 'max_tokens configurado',        'max_tokens' in src,                    'Presente', 'FALTANTE')
check('ap09', 'JSON.parse respuesta AI',       'JSON.parse' in src,                    'Presente', 'FALTANTE')
check('ap10', 'catch(err) error handling',     'catch(err)' in src or 'catch(e)' in src, 'Presente', 'FALTANTE')
check('ap11', 'Prompt plan de accion',         'Plan de Acción estructurado' in src or 'plan de accion' in src.lower(), 'Presente', 'FALTANTE')
check('ap12', 'Validacion apiKey startsWith',  "startsWith('sk-ant-')" in src,         'Presente', 'FALTANTE')

# GRUPO 14: REGRESION VISUAL — CSS
print(f'{BOLD}[14] REGRESION VISUAL{RESET}')
check('vi01', 'CSS var --gold',                '--gold' in src,                         'Presente', 'FALTANTE')
check('vi02', 'CSS var --dark',                '--dark' in src,                         'Presente', 'FALTANTE')
check('vi03', 'Font Raleway',                  "'Raleway'" in src,                      'Presente', 'FALTANTE')
check('vi04', 'Topbar 52px',                   'height: 52px' in src,                   'Presente', 'FALTANTE')
check('vi05', 'Card layout row',               'flex-direction: row' in src,            'Presente', 'FALTANTE')
check('vi06', 'Photo 45% width',               'width: 45%' in src,                     'Presente', 'FALTANTE')
check('vi07', 'object-fit cover',              'object-fit: cover' in src,              'Presente', 'FALTANTE')
check('vi08', 'Sidebar 196px',                 'width: 196px' in src,                   'Presente', 'FALTANTE')
check('vi09', 'Ali-grid minmax 340px',         'minmax(340px' in src,                   'Presente', 'FALTANTE')
check('vi10', '@keyframes spin',               '@keyframes spin' in src,                'Presente', 'FALTANTE')
check('vi11', '@keyframes pulse',              '@keyframes pulse' in src,               'Presente', 'FALTANTE')
check('vi12', '@media print',                  '@media print' in src,                   'Presente', 'FALTANTE')
check('vi13', 'rpt-module-divider CSS',        '.rpt-module-divider' in src,            'Presente', 'FALTANTE')
check('vi14', 'Drive strip CSS',               '#drive-strip' in src,                   'Presente', 'FALTANTE')
check('vi15', 'Gold #C9952A',                  'C9952A' in src,                         'Presente', 'FALTANTE')# ══════════════════════════════════════════════════════════════════


check('vi15', 'Gold #C9952A',                  'C9952A' in src,                         'Presente', 'FALTANTE')


# REPORTE FINAL
# ══════════════════════════════════════════════════════════════════
total = len(results)
passed = sum(1 for r in results if r[2])
failed = total - passed
pct    = round(passed / total * 100)

print()
print('=' * 65)
print(f'  DMZ AUDITORIA — TEST REPORT')
print(f'  {datetime.now().strftime("%Y-%m-%d %H:%M:%S")} · {HTML_FILE.name}')
print('=' * 65)

for (tid, name, ok, detail) in results:
    if ok:
        print(f'  {GREEN}PASS{RESET}  [{tid:4s}] {name}')
    else:
        print(f'  {RED}FAIL{RESET}  [{tid:4s}] {name}  —  {detail}')

print()
print('=' * 65)
print(f'  RESULTADO: {passed}/{total} ({pct}%) — {"APROBADO" if failed == 0 else str(failed) + " FALLARON"}')
print('=' * 65)

# Guardar reporte en archivo
REPORT_DIR.mkdir(parents=True, exist_ok=True)
report_lines = [
    f'DMZ AUDITORIA TEST REPORT',
    f'Fecha: {datetime.now().isoformat()}',
    f'Archivo: {HTML_FILE.name} ({size_kb:.1f} KB)',
    f'Resultado: {passed}/{total} ({pct}%)',
    '',
]
for (tid, name, ok, detail) in results:
    status = 'PASS' if ok else 'FAIL'
    report_lines.append(f'[{status}] [{tid:4s}] {name}{"  --  " + detail if not ok else ""}')
report_lines.append('')
report_lines.append(f'TOTAL: {passed} pasaron / {failed} fallaron / {total} total')

with open(REPORT_FILE, 'w', encoding='utf-8') as f:
    f.write('\n'.join(report_lines))

print(f'\nReporte guardado en: {REPORT_FILE}')

# Exit code para GitHub Actions
if failed > 0:
    sys.exit(1)
