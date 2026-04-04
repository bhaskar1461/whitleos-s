import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/lib/theme";

type ChoiceChipsProps = {
  label: string;
  options: readonly string[];
  value: string | string[];
  multiple?: boolean;
  onChange: (value: string | string[]) => void;
};

export function ChoiceChips({
  label,
  options,
  value,
  multiple = false,
  onChange,
}: ChoiceChipsProps) {
  function handlePress(option: string) {
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      const exists = current.includes(option);
      const next = exists ? current.filter((item) => item !== option) : [...current, option].slice(0, 4);
      onChange(next);
      return;
    }

    onChange(option);
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((option) => {
          const active = Array.isArray(value) ? value.includes(option) : value === option;
          return (
            <Pressable
              key={option}
              onPress={() => handlePress(option)}
              style={[styles.chip, active ? styles.activeChip : null]}
            >
              <Text style={[styles.chipText, active ? styles.activeChipText : null]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  activeChip: {
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.neonSoft,
  },
  chipText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  activeChipText: {
    color: theme.colors.neon,
  },
});
