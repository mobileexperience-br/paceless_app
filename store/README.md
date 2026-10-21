# Material das lojas

Imagens e textos da ficha das lojas. Não são usados pelo app.

## Estrutura

```
store/
├── google-play/
│   ├── icon-512.png            ícone da ficha (512×512)
│   ├── feature-1024x500.png    gráfico de recursos (1024×500)
│   └── screenshots/            capturas de celular (2 a 8, 9:16)
└── app-store/
    └── screenshots/            capturas de iPhone (quando a conta Apple existir)
```

## Gerar de novo

O ícone e o gráfico de recursos saem de `assets/` pelo script
`scripts/store-assets.sh` (precisa do ImageMagick 7, comando `magick`):

```bash
npm run store:assets
```

Para trocar os textos do gráfico de recursos sem editar o script:

```bash
STORE_TITLE="Outro título" STORE_SUBTITLE="Outro subtítulo" npm run store:assets
```

| Saída | Fonte |
|---|---|
| `icon-512.png` | `assets/icon.png` redimensionado |
| `feature-1024x500.png` | `assets/hero-welcome.jpg` + `assets/logo-mark.png`, fonte Inter, cores `#BCD243` e `#111111` |

Os textos atuais ("Corra no seu ritmo." / "Planos de corrida, GPS e evolução
semanal") aguardam aprovação do Pedro.

## Capturas de tela

Tiradas no aparelho, com dados reais (sem mock). Nomear em ordem de exibição:
`01-boas-vindas.png`, `02-onboarding-dias.png`, `03-treino-gps.png`,
`04-resumo-treino.png`, `05-historico.png`.
