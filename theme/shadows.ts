import type { ViewStyle } from 'react-native';

/**
 * No mockup os cards são praticamente flat: a separação vem da hairline
 * #E5E7EB, com uma sombra muito discreta por baixo.
 */
export const shadows = {
  card: {
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  } satisfies ViewStyle,
  /** Não vem do mockup: usada só no FAB de Atividades na tab bar. */
  fab: {
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  } satisfies ViewStyle,
} as const;
