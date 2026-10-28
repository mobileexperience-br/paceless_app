# Capturas de tela das lojas

Gera as imagens da App Store (1290×2796, iPhone 6,9") e do Google Play
(1080×1920) a partir de capturas reais do app, com título, subtítulo e
moldura de iPhone.

## Como gerar

```bash
bash scripts/store-screenshots.sh
```

Precisa do Google Chrome e do ImageMagick 7 (`magick`). No macOS, o script
acha o Chrome sozinho; se não achar, rode com
`CHROME_BIN="/caminho/do/chrome" bash scripts/store-screenshots.sh`.
As fontes vêm de `node_modules`, então rode `npm ci` antes.

Saída:
- `store/app-store/screenshots/*.png`
- `store/google-play/screenshots/*.png`

## Como alterar (guia para pessoa ou LLM)

Quase tudo se muda em **`config.js`**, sem tocar no layout:

| Quero mudar | Onde |
|---|---|
| Texto do título | `slides[n].title`. O trecho entre `*asteriscos*` sai na cor de destaque. |
| Subtítulo | `slides[n].subtitle` |
| Ordem das imagens | ordem do array `slides` e prefixo do `file` (`01-`, `02-`...) |
| Trocar a tela mostrada | `slides[n].raw`, apontando para um PNG em `raw/` |
| Cores | `colors` (fundo, destaque, título, subtítulo, moldura) |
| Cor da barra de status do celular | `slides[n].screenTop` (padrão: `colors.background`) |
| Tamanho final das imagens | `sizes` |

Layout (posição, tamanho de fonte, brilho, moldura) fica em **`template.html`**.
Para testar uma mudança visual, abra no Chrome:
`store/screenshots/template.html?slide=0` (troque o número do slide) com a janela
em 1290×2796 pelo DevTools.

## Capturas cruas (`raw/`)

Tiradas do app rodando no navegador, com dados reais, em 430×932 com escala 3
(1290×2796):

1. `npx expo start --web --port <porta livre>`
2. Chrome DevTools → modo dispositivo → 430×932, DPR 3.
3. Navegue até a tela e capture ("Capture screenshot").
4. Salve em `raw/` com prefixo numérico e aponte em `config.js`.

Capturas do aparelho de verdade (iPhone, pelo TestFlight) também servem: basta
salvar em `raw/`. Nesse caso, a barra de status já vem na captura; recorte o
topo (cerca de 160 px) antes, para não ficar duplicada.

Regra do projeto: sem dados falsos nas telas. Use uma conta real.
