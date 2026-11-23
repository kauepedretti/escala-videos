# Pipeline de render – Escala do Absurdo

O ambiente de trabalho do Claude é temporário. Esta pasta guarda tudo que é preciso para recriá-lo num chat novo.

## Recriar o ambiente
```
cd /home/claude && git clone https://github.com/kauepedretti/escala-videos.git
bash /home/claude/escala-videos/pipeline/setup.sh
```
Chromium e Playwright já vêm instalados no ambiente (não reinstalar).

## Estrutura de um episódio (/home/claude/epNN)
- `narracao.mp3` – áudio do Kauê (ElevenLabs, voz Paulo)
- `p.js` – legendas: `[inicio, fim, texto, [palavras destacadas], tipo]` (tipo "mid" no fechamento; legenda longa vira 2 pedaços). Tempos tirados com `ffmpeg -i narracao.mp3 -af silencedetect=noise=-38dB:d=0.15 -f null -`
- `img.js` – fotos reais em base64 (`new Image()` com data URL)
- `sNN.js` – cena (window.renderAt(t) desenha o frame t)
- `index.html` (copiar de `index_template.html`, trocar o nome do scene) e `render.cjs`
- `ln -s /home/claude/ep40/node_modules node_modules`

## Montar a cena
```
cat ../ep3/common_head.js p.js ../lib3d.js ../earth_sprite.js ../ep3/common_2d.js img.js sNN.js > sceneNN.js
```
`earth_sprite.js` só é preciso quando a cena 3D mostra a Terra (sprite da Blue Marble 2012: `earthSprite()`, `placeEarth()`, `earthTexSync()`).

## Conferir antes do render
`RPORT=9xxx node render.cjs stills 1.0 12.5 30.0` → olhar `stills/*.jpg` nos momentos mais cheios.

## Render completo
```
cd /home/claude && export RPORT=9xxx
(bash render_ep.sh epNN DUR NN old_final.mp4 && bash outro_to.sh epNN NN DUR "x") > epNN/render.log
```
DUR = duração do narracao.mp3. Saída: `/home/claude/final/escala-do-absurdo-epNN.mp4` (com vinheta de ~4,6 s).
`render_ep.sh` pula chunks já existentes: apague `chunk*.mp4` para re-renderizar.

## Layout (1080×1920)
HUD/título até ~y440 · diagramas 450–1040 · legendas a partir de ~1080. Rodapé de crédito: `NOTE('...')`.

## Exemplo completo
`exemplo-ep135/` – EP135 (aurora, pergunta do Felype): p.js com timings, img.js com fotos, scene montada.

## Identidade visual (desde 23/11/2026)
- Legendas: palavras de destaque em **verde neon `#3CFF7A`** (constante `ACCENT` em `ep3/common_head.js`).
- Destaques, réguas, números e títulos do HUD: verde (`VGOLD` em `vshared/vlib.js` agora é `#3CFF7A`).
- Cores com significado ficam: Sol/estrelas (amarelo), Terra/água (azul), perigo/alerta (vermelho).
- Um estilo visual por série: Em 1 ano → calendário · A Terra do tamanho de… → zoom de escala · Você perguntou → lousa de observatório · IA × universo → tela de IA · naves → blueprint (azul-marinho e vermelho como referência, sem logo da NASA) · notícias/datas fixas → foto real + dados · planetas → 3D.
