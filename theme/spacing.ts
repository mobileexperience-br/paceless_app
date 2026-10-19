/** Escala de 4pt. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const layout = {
  /** Margem lateral das telas, medida no mockup. */
  screenPadding: 20,
  /** Espaço vertical entre cards empilhados. */
  cardGap: 12,
  /** Padding interno padrão de um card. */
  cardPadding: 16,
  /** Altura de botões e inputs. */
  controlHeight: 52,
  /** Altura da barra de progresso. */
  progressHeight: 8,
  tabBarHeight: 60,
  tabIconSize: 22,
} as const;
