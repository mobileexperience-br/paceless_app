import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from './Screen';
import { ScreenHeader } from './ScreenHeader';
import { Text } from './Text';
import type { LegalContent } from '@/content/legal/types';
import { colors, layout, spacing } from '@/theme';

interface LegalDocumentProps {
  content: LegalContent;
}

interface BulletListProps {
  items: string[];
}

function BulletList({ items }: BulletListProps): ReactElement {
  return (
    <View style={styles.bullets}>
      {items.map((item) => (
        <View key={item} style={styles.bulletRow}>
          <Text variant="body" color={colors.textSecondary}>
            {'•'}
          </Text>
          <Text variant="body" style={styles.bulletText}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function LegalDocument({ content }: LegalDocumentProps): ReactElement {
  return (
    <Screen scroll flush>
      <ScreenHeader showBack title={content.title} />
      <View style={styles.body}>
        <Text variant="caption" color={colors.textSecondary}>
          Última atualização: {content.updatedAt}
        </Text>
        {content.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text variant="title3">{section.heading}</Text>
            {section.paragraphs?.map((paragraph) => (
              <Text key={paragraph} variant="body">
                {paragraph}
              </Text>
            ))}
            {section.bullets ? <BulletList items={section.bullets} /> : null}
            {section.closing?.map((paragraph) => (
              <Text key={paragraph} variant="body">
                {paragraph}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  bullets: {
    gap: spacing.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bulletText: {
    flex: 1,
  },
});
