import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CATEGORIES, Palette } from "../theme";
import { fonts } from "../fonts";
import { CellStat } from "../lib/analysis";
import { CategoryKey } from "../types";

export function CategoryBarChart({ palette, catStats }: { palette: Palette; catStats: Record<CategoryKey, CellStat> }) {
  const rows = CATEGORIES.map((c) => {
    const s = catStats[c.key];
    return { cat: c, n: s.n, delayed: s.delayed, rate: s.n > 0 ? s.delayed / s.n : 0 };
  }).sort((a, b) => b.rate - a.rate);

  return (
    <View style={{ gap: 10 }}>
      {rows.map((row) => (
        <View key={row.cat.key} style={styles.row}>
          <Text style={[styles.label, { color: palette.ink2, fontFamily: fonts.body }]} numberOfLines={1}>
            {row.cat.label}
          </Text>
          <View style={[styles.track, { backgroundColor: palette.surface2 }]}>
            <View
              style={[
                styles.fill,
                {
                  width: `${Math.max(row.rate * 100, row.n > 0 ? 3 : 0)}%`,
                  backgroundColor: palette.category[row.cat.key],
                },
              ]}
            />
          </View>
          <Text style={[styles.value, { color: palette.ink2, fontFamily: fonts.mono }]}>
            {row.n > 0 ? `${Math.round(row.rate * 100)}% · n=${row.n}` : "—"}
          </Text>
        </View>
      ))}
      <View style={styles.legend}>
        {CATEGORIES.map((c) => (
          <View key={c.key} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: palette.category[c.key] }]} />
            <Text style={[styles.legendText, { color: palette.ink2, fontFamily: fonts.body }]}>{c.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { width: 84, fontSize: 11.5, textAlign: "right" },
  track: { flex: 1, height: 16, borderRadius: 5, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 5 },
  value: { width: 76, fontSize: 11 },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  swatch: { width: 8, height: 8, borderRadius: 3 },
  legendText: { fontSize: 11 },
});
