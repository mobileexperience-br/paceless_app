import { useEffect, useRef, useState, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  CheckCircle2,
  Dumbbell,
  Flame,
  Footprints,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import {
  blockAt,
  blockKindLabels,
  formatBlockTime,
  type BlockKind,
  type WorkoutBlock,
} from '@/lib/workoutBlocks';
import { palettes, radius, sizes, spacing, workout } from '@/theme';

interface BlockGuideProps {
  blocks: WorkoutBlock[];
  activeSeconds: number;
  paused: boolean;
}

const DONE_MESSAGE = 'Treino do plano concluído';

const kindIcons: Record<BlockKind, LucideIcon> = {
  warmup: Flame,
  run: Zap,
  walk: Footprints,
  cooldown: Wind,
  strength: Dumbbell,
};

export function BlockGuide({ blocks, activeSeconds, paused }: BlockGuideProps): ReactElement | null {
  const { colors } = useTheme();
  const position = blockAt(blocks, activeSeconds);
  const [bannerVisible, setBannerVisible] = useState<boolean>(false);
  const lastIndexRef = useRef<number | null>(null);

  useEffect(() => {
    const previous = lastIndexRef.current;
    lastIndexRef.current = position.index;
    if (previous === null || previous === position.index) return undefined;
    setBannerVisible(true);
    const timer = setTimeout(() => {
      setBannerVisible(false);
    }, workout.blockBannerMs);
    return (): void => {
      clearTimeout(timer);
    };
  }, [position.index]);

  if (blocks.length === 0) return null;

  const { current, next, remainingSec, index } = position;

  if (current === null) {
    return (
      <View style={[styles.card, bannerVisible && { borderColor: colors.primary }]}>
        {bannerVisible ? (
          <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.banner, { backgroundColor: colors.primary }]}>
            <Text variant="captionStrong" color={colors.onPrimary}>{DONE_MESSAGE}</Text>
          </View>
        ) : null}
        <View style={styles.row}>
          <CheckCircle2 size={workout.statusIconSize} color={colors.primary} strokeWidth={sizes.iconStroke} />
          <Text variant="captionStrong" color={palettes.dark.ink}>{DONE_MESSAGE}</Text>
        </View>
        <Text variant="caption" color={palettes.dark.textSecondary}>Finalize quando quiser</Text>
      </View>
    );
  }

  const Icon = kindIcons[current.kind];
  const iconColor = current.kind === 'run' ? colors.primary : palettes.dark.ink;
  const bannerText = `Agora: ${blockKindLabels[current.kind]}`;

  return (
    <View style={[styles.card, bannerVisible && { borderColor: colors.primary }]}>
      {bannerVisible ? (
        <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.banner, { backgroundColor: colors.primary }]}>
          <Text variant="captionStrong" color={colors.onPrimary}>{bannerText}</Text>
        </View>
      ) : null}
      <View style={styles.row}>
        <Icon size={workout.statusIconSize} color={iconColor} strokeWidth={sizes.iconStroke} />
        <Text variant="captionStrong" color={palettes.dark.ink}>
          {blockKindLabels[current.kind].toUpperCase()}
        </Text>
        <Text variant="caption" color={palettes.dark.textSecondary} style={styles.blockLabel}>
          {current.label}
        </Text>
      </View>
      {paused ? (
        <Text variant="captionStrong" color={palettes.dark.textSecondary}>Pausado</Text>
      ) : null}
      <Text variant="metric" color={palettes.dark.ink} style={styles.remaining}>
        {formatBlockTime(remainingSec)}
      </Text>
      <Text variant="caption" color={palettes.dark.textSecondary}>Restante do bloco</Text>
      <Text variant="caption" color={palettes.dark.textSecondary}>
        {next !== null
          ? `Próximo: ${blockKindLabels[next.kind]} · ${formatBlockTime(next.endSec - next.startSec)}`
          : 'Último bloco'}
      </Text>
      <Text variant="caption" color={palettes.dark.textSecondary}>
        {`Bloco ${index + 1} de ${blocks.length}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: sizes.hairline,
    borderColor: palettes.dark.surface,
    backgroundColor: palettes.dark.surface,
  },
  banner: {
    alignSelf: 'stretch',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  blockLabel: {
    flexShrink: 1,
  },
  remaining: {
    fontSize: workout.blockTimeSize,
    lineHeight: workout.blockTimeSize,
  },
});
