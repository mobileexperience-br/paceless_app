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
import { useTheme, useThemedStyles } from '@/hooks/useTheme';
import {
  blockAt,
  blockKindLabels,
  formatBlockTime,
  type BlockKind,
  type WorkoutBlock,
} from '@/lib/workoutBlocks';
import { createStyles, layout, radius, sizes, spacing, workout } from '@/theme';

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
  const styles = useThemedStyles(makeStyles);
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
          <Text variant="captionStrong" color={colors.ink}>{DONE_MESSAGE}</Text>
        </View>
        <Text variant="caption" color={colors.textSecondary}>Finalize quando quiser</Text>
      </View>
    );
  }

  const Icon = kindIcons[current.kind];
  const iconColor = current.kind === 'run' ? colors.primary : colors.ink;
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
        <Text variant="captionStrong" color={colors.ink}>
          {blockKindLabels[current.kind].toUpperCase()}
        </Text>
        <Text variant="caption" color={colors.textSecondary} style={styles.blockLabel}>
          {current.label}
        </Text>
      </View>
      {paused ? (
        <Text variant="captionStrong" color={colors.textSecondary}>Pausado</Text>
      ) : null}
      <Text variant="metric" color={colors.ink} style={styles.remaining} numberOfLines={1} adjustsFontSizeToFit>
        {formatBlockTime(remainingSec)}
      </Text>
      <Text variant="caption" color={colors.textSecondary}>Restante do bloco</Text>
      <Text variant="caption" color={colors.textSecondary}>
        {next !== null
          ? `Próximo: ${blockKindLabels[next.kind]} • ${formatBlockTime(next.endSec - next.startSec)}`
          : 'Último bloco'}
      </Text>
      <Text variant="caption" color={colors.textSecondary}>
        {`Bloco ${String(index + 1)} de ${String(blocks.length)}`}
      </Text>
    </View>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    card: {
      gap: spacing.sm,
      marginBottom: spacing.xl,
      padding: layout.cardPadding,
      borderRadius: radius.lg,
      borderWidth: sizes.hairline,
      borderColor: colors.surface,
      backgroundColor: colors.surface,
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
  }),
);
