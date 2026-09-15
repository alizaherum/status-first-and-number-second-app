import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Palette, CATEGORIES } from "../theme";
import { fonts } from "../fonts";
import { Insight } from "../lib/analysis";

function severity(rate: number): { label: string; color: string } {
  if (rate >= 0.6) return { label: "critical", color: "critical" };
  if (rate >= 0.3) return { label: "elevated", color: "warning" };
  return { label: "mild", color: "good" };
}

export function InsightCard({ palette, insight, rank }: { palette: Palette; insight: Insight; rank: number }) {
  const catLabel = CATEGORIES.find((c) => c.key === insight.category)?.label ?? insight.category;
  const catColor = palette.category[insight.category];
  const sev = severity(insight.rate);
  const sevColor = palette.status[sev.color as "good" | "warning" | "critical"];
  const pct = Math.round(insight.rate * 100);

  return (
    <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <Text style={[styles.rank, { color: palette.inkMuted, fontFamily: fonts.mono }]}>{rank}</Text>
      <View style={[styles.chip, { backgroundColor: catColor }]} />
      <View style={styles.body}>
        <Text style={[styles.text, { color: palette.ink, fontFamily: fonts.body }]}>
          You delay <Text style={{ fontFamily: fonts.bodySemiBold }}>{catLabel.toLowerCase()}</Text> tasks{" "}
          {insight.timeBucket.phrase}{" "}
          <Text style={{ fontFamily: fonts.bodySemiBold }}>{pct}%</Text> of the time.
        </Text>
        <Text style={[styles.meta, { color: palette.inkMuted, fontFamily: fonts.mono }]}>
          n={insight.n} · {insight.delayed} of {insight.n} delayed
        </Text>
      </View>
      <View style={[styles.pill, { backgroundColor: sevColor + "29" }]}>
        <View style={[styles.dot, { backgroundColor: sevColor }]} />
        <Text style={[styles.pillText, { color: sevColor, fontFamily: fonts.monoMedium }]}>{sev.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  rank: { fontSize: 12, width: 16, textAlign: "center" },
  chip: { width: 9, height: 9, borderRadius: 3 },
  body: { flex: 1, gap: 3 },
  text: { fontSize: 13.5, lineHeight: 19 },
  meta: { fontSize: 11 },
  pill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 11 },
});
