import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CATEGORIES, Palette, TIME_BUCKETS } from "../theme";
import { fonts } from "../fonts";
import { CellStat } from "../lib/analysis";
import { CategoryKey } from "../types";

function stepIndexFor(rate: number, steps: number): number {
  return Math.min(steps - 1, Math.round(rate * (steps - 1)));
}

export function Heatmap({
  palette,
  ctStats,
}: {
  palette: Palette;
  ctStats: Record<CategoryKey, Record<string, CellStat>>;
}) {
  const [active, setActive] = useState<{ cat: string; bucket: string } | null>(null);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={styles.headerRow}>
          <View style={styles.rowHeadCell} />
          {TIME_BUCKETS.map((tb) => (
            <Text key={tb.key} style={[styles.colHead, { color: palette.inkMuted, fontFamily: fonts.mono }]}>
              {tb.short}
            </Text>
          ))}
        </View>
        {CATEGORIES.map((c) => (
          <View key={c.key} style={styles.dataRow}>
            <Text style={[styles.rowHead, { color: palette.ink2, fontFamily: fonts.bodyMedium }]}>{c.label}</Text>
            {TIME_BUCKETS.map((tb) => {
              const cell = ctStats[c.key][tb.key];
              const isActive = active?.cat === c.key && active?.bucket === tb.key;
              if (cell.n < 1) {
                return (
                  <View key={tb.key} style={[styles.cell, styles.emptyCell, { borderColor: palette.borderStrong, backgroundColor: palette.surface2 }]}>
                    <Text style={{ color: palette.inkMuted, fontSize: 11 }}>·</Text>
                  </View>
                );
              }
              const rate = cell.delayed / cell.n;
              const stepIdx = stepIndexFor(rate, palette.sequential.length);
              const bg = palette.sequential[stepIdx];
              const lightText = stepIdx >= 3;
              return (
                <Pressable
                  key={tb.key}
                  onPress={() => setActive(isActive ? null : { cat: c.key, bucket: tb.key })}
                  style={[styles.cell, { backgroundColor: bg }]}
                >
                  <Text style={{ color: lightText ? "#ffffff" : "#14161b", fontSize: 11, fontFamily: fonts.mono }}>
                    {cell.n >= 3 ? `${Math.round(rate * 100)}%` : "·"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
        {active && (
          <View style={[styles.tooltip, { backgroundColor: palette.ink }]}>
            <Text style={{ color: palette.bg, fontSize: 12, fontFamily: fonts.bodyMedium }}>
              {CATEGORIES.find((c) => c.key === active.cat)?.label} ·{" "}
              {TIME_BUCKETS.find((t) => t.key === active.bucket)?.label}
            </Text>
            <Text style={{ color: palette.bg, fontSize: 11.5, fontFamily: fonts.body, opacity: 0.9 }}>
              {Math.round((ctStats[active.cat as CategoryKey][active.bucket].delayed / ctStats[active.cat as CategoryKey][active.bucket].n) * 100)}%
              delayed ({ctStats[active.cat as CategoryKey][active.bucket].delayed} of{" "}
              {ctStats[active.cat as CategoryKey][active.bucket].n})
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const CELL = 46;
const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", marginBottom: 6 },
  rowHeadCell: { width: 84 },
  colHead: { width: CELL, fontSize: 10, textAlign: "center" },
  dataRow: { flexDirection: "row", marginBottom: 4, alignItems: "center" },
  rowHead: { width: 84, fontSize: 11.5 },
  cell: { width: CELL - 4, height: 32, marginHorizontal: 2, borderRadius: 5, alignItems: "center", justifyContent: "center" },
  emptyCell: { borderWidth: 1, borderStyle: "dashed" },
  tooltip: { marginTop: 8, padding: 10, borderRadius: 10, gap: 2 },
});
