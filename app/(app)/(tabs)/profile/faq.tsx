import { useState, type ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { Card, Screen, ScreenHeader, Text } from '@/components';
import { faq, type FaqEntry } from '@/content/faq';
import { createStyles, layout, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

interface FaqItemProps {
  entry: FaqEntry;
  divider: boolean;
}

function FaqItem({ entry, divider }: FaqItemProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [open, setOpen] = useState(false);
  const Chevron = open ? ChevronUp : ChevronDown;

  return (
    <View style={divider ? styles.divider : null}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => { setOpen((current) => !current); }}
        style={styles.question}
      >
        <Text variant="bodyStrong" style={styles.questionText}>
          {entry.question}
        </Text>
        <Chevron size={sizes.iconMd} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />
      </Pressable>
      {open ? (
        <Text variant="body" color={colors.textSecondary} style={styles.answer}>
          {entry.answer}
        </Text>
      ) : null}
    </View>
  );
}

export default function FaqScreen(): ReactElement {
  const styles = useThemedStyles(makeStyles);
  return (
    <Screen scroll flush>
      <ScreenHeader showBack title="Perguntas frequentes" />
      <View style={styles.body}>
        <Card flush>
          {faq.map((entry, index) => (
            <FaqItem key={entry.question} entry={entry} divider={index < faq.length - 1} />
          ))}
        </Card>
      </View>
    </Screen>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    body: {
      paddingHorizontal: layout.screenPadding,
    },
    divider: {
      borderBottomWidth: sizes.hairline,
      borderBottomColor: colors.border,
    },
    question: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: layout.cardPadding,
      minHeight: 56,
    },
    questionText: {
      flex: 1,
    },
    answer: {
      paddingHorizontal: layout.cardPadding,
      paddingBottom: layout.cardPadding,
    },
  }),
);
