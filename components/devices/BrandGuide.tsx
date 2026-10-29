import { useState, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { ChevronDown, ChevronUp, Watch } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { IconBadge } from '@/components/IconBadge';
import { ListRow } from '@/components/ListRow';
import { Text } from '@/components/Text';
import { brandGuides } from '@/lib/brandGuides';
import { providerLabels } from '@/lib/healthHubLabels';
import { layout, sizes, spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import type { HealthProvider } from '@/types/healthHub';

interface BrandGuideProps {
  provider: HealthProvider;
}

export function BrandGuide({ provider }: BrandGuideProps): ReactElement {
  const { colors } = useTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  return (
    <View style={styles.section}>
      <Text variant="captionStrong">Seu relógio no Paceless</Text>
      <Text variant="caption" color={colors.textSecondary}>
        {`Relógios chegam ao Paceless pelo ${providerLabels[provider]}. Ative a sincronização no app da sua marca:`}
      </Text>
      <Card flush>
        {brandGuides.map((guide, index) => {
          const expanded = expandedId === guide.id;
          const Chevron = expanded ? ChevronUp : ChevronDown;
          return (
            <View key={guide.id}>
              <ListRow
                title={guide.name}
                divider={index < brandGuides.length - 1 || expanded}
                accessibilityState={{ expanded }}
                leading={
                  <IconBadge size={sizes.badgeSm}>
                    <Watch size={sizes.iconMd} color={colors.ink} strokeWidth={sizes.iconStroke} />
                  </IconBadge>
                }
                trailing={
                  <Chevron size={sizes.iconMd} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />
                }
                onPress={(): void => {
                  setExpandedId(expanded ? null : guide.id);
                }}
              />
              {expanded ? (
                <Text variant="caption" color={colors.textSecondary} style={styles.steps}>
                  {guide.steps[provider]}
                </Text>
              ) : null}
            </View>
          );
        })}
      </Card>
      <Text variant="caption" color={colors.textSecondary}>
        Os nomes dos menus podem variar conforme a versão do app da marca. Os treinos aparecem depois que o app da marca sincroniza.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  steps: {
    paddingHorizontal: layout.cardPadding,
    paddingBottom: spacing.md,
  },
});
