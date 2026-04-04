import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { theme } from "@/lib/theme";

type FieldProps = TextInputProps & {
  label: string;
  helper?: string;
};

export function Field({ label, helper, multiline, style, ...rest }: FieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.colors.textFaint}
        multiline={multiline}
        style={[styles.input, multiline ? styles.multiline : null, style]}
        {...rest}
      />
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    minHeight: 52,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: 16,
    color: theme.colors.text,
    fontSize: 15,
  },
  multiline: {
    minHeight: 140,
    paddingVertical: 16,
    textAlignVertical: "top",
  },
  helper: {
    color: theme.colors.textSoft,
    fontSize: 12,
  },
});
