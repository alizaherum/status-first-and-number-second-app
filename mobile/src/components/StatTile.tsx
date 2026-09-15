import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Palette } from "../theme";
import { fonts } from "../fonts";

export function StatTile({
  palette,
  label,
  value,
  sub,
  valueFont = fonts.mono,
}: {
  palette: Palette;
  label: string;
  value: string;
  sub: string;
  valueFont?: string;
}) {
  return (
    <View style={[styles.tile, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <Text style={[styles.label, { color: palette.inkMuted, fontFamily: fonts.bodyMedium }]}>{label}</Text>
      <Text style={[styles.value, { color: palette.ink, fontFamily: valueFont }]} numberOfLines={2}>
        {value}
      </Text>
      <Text style={[styles.sub, { color: palette.ink2, fontFamily: fonts.body }]}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 4,
    minHeight: 88,
  },
  label: { fontSize: 10.5, letterSpacing: 0.6, textTransform: "uppercase" },
  value: { fontSize: 22, lineHeight: 26 },
  sub: { fontSize: 12 },
});
