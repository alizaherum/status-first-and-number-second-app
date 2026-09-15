import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CATEGORIES, EFFORT_LEVELS, Palette } from "../theme";
import { fonts } from "../fonts";
import { Cluster } from "../lib/analysis";

export function ClusterCard({ palette, cluster, letter }: { palette: Palette; cluster: Cluster; letter: string }) {
  const catLabel = CATEGORIES.find((c) => c.key === cluster.category)?.label ?? cluster.category;
  const effLabel = EFFORT_LEVELS.find((e) => e.key === cluster.effort)?.label ?? cluster.effort;
  const effShort = EFFORT_LEVELS.find((e) => e.key === cluster.effort)?.short ?? cluster.effort;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.surface, borderColor: palette.border, borderLeftColor: palette.category[cluster.category] },
      ]}
    >
      <View style={styles.head}>
        <Text style={[styles.name, { color: palette.ink, fontFamily: fonts.display }]}>Cluster {letter}</Text>
        <Text style={[styles.rate, { color: palette.ink2, fontFamily: fonts.mono }]}>{Math.round(cluster.rate * 100)}% delayed</Text>
      </View>
      <Text style={[styles.desc, { color: palette.ink2, fontFamily: fonts.body }]}>
        Mostly <Text style={{ fontFamily: fonts.bodySemiBold }}>{catLabel.toLowerCase()}</Text> tasks around{" "}
        <Text style={{ fontFamily: fonts.bodySemiBold }}>{cluster.timeBucket.label.toLowerCase()}</Text> ({cluster.timeBucket.short}),
        typically <Text style={{ fontFamily: fonts.bodySemiBold }}>{effLabel.toLowerCase()}</Text> effort.
      </Text>
      <View style={styles.tags}>
        <View style={[styles.tag, { backgroundColor: palette.surface2 }]}>
          <Text style={[styles.tagText, { color: palette.ink2, fontFamily: fonts.mono }]}>n={cluster.n}</Text>
        </View>
        <View style={[styles.tag, { backgroundColor: palette.surface2 }]}>
          <Text style={[styles.tagText, { color: palette.ink2, fontFamily: fonts.mono }]}>
            {Math.round(cluster.catShare * 100)}% {catLabel.toLowerCase()}
          </Text>
        </View>
        <View style={[styles.tag, { backgroundColor: palette.surface2 }]}>
          <Text style={[styles.tagText, { color: palette.ink2, fontFamily: fonts.mono }]}>
            {Math.round(cluster.effShare * 100)}% {effShort.toLowerCase()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, borderLeftWidth: 3, padding: 14, gap: 7 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 14.5 },
  rate: { fontSize: 12.5 },
  desc: { fontSize: 12.5, lineHeight: 18 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  tagText: { fontSize: 10.5 },
});
