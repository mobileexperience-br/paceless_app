/**
 * Paleta extraída do painel DESIGN SYSTEM do mockup.
 * Os cinco primeiros hex estão declarados na própria imagem.
 */
export const colors = {
  /** Verde da marca: botões, progresso, aba ativa, cronômetro. */
  primary: '#BCD243',
  /** Verde escurecido para estado pressionado (derivado, não está no mockup). */
  primaryPressed: '#A9BE33',
  /** Verde claro dos círculos de ícone nas listas de atividade. */
  primarySoft: '#EBF4C3',
  /** Verde-oliva das sombras da ilustração do plano. */
  primaryDeep: '#83952A',

  /** Texto primário e fundo da tela de treino. */
  ink: '#111111',
  /** Texto secundário, metadados e ícones inativos. */
  textSecondary: '#687280',

  /** Hairline de cards, inputs e divisórias. */
  border: '#E5E7EB',
  /** Trilho de progresso e círculos neutros. */
  track: '#EDEEF0',

  background: '#FFFFFF',
  surface: '#FFFFFF',

  white: '#FFFFFF',

  /** Tela de treino em andamento. */
  dark: {
    background: '#111111',
    surface: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(255, 255, 255, 0.14)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.64)',
  },

  /** Sobreposição escura sobre a foto da tela de boas-vindas. */
  scrim: 'rgba(17, 17, 17, 0.45)',
} as const;
