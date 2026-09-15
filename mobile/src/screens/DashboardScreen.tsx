import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Palette } from "../theme";
import { fonts } from "../fonts";
import { Task } from "../types";
import { computeAll, computeClusters } from "../lib/analysis";
import { StatTile } from "../components/StatTile";
import { InsightCard } from "../components/InsightCard";
import { CategoryBarChart } from "../components/CategoryBarChart";
import { Heatmap } from "../components/Heatmap";
import { ClusterCard } from "../components/ClusterCard";
import { EmptyNote } from "../components/EmptyNote";
import { CATEGORIES } from "../theme";

export function DashboardScreen({ palette, tasks }: { palette: Palette; tasks: Task[] }) {
  const data = useMemo(() => computeAll(tasks), [tasks]);
  const clusterData = useMemo(() => computeClusters(tasks), [tasks]);

  const top = data.insights[0];
  const topCatLabel = top ? CATEGORIES.find((c) => c.key === top.category)?.label : undefined;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heroStats}>
        <StatTile
          palette={palette}
          label="Delay rate"
          value={data.total === 0 ? "—" : `${Math.round((data.delayed / data.total) * 100)}%`}
          sub={data.total === 0 ? "no tasks yet" : `${data.delayed} of ${data.total} delayed`}
        />
        <StatTile palette={palette} label="Logged" value={String(data.total)} sub=" " />
      </View>
      {top ? (
        <StatTile
          palette={palette}
          label="Strongest trigger"
          value={`${topCatLabel} · ${top.timeBucket.short}`}
          sub={`${Math.round(top.rate * 100)}% delayed (n=${top.n})`}
          valueFont={fonts.bodySemiBold}
        />
      ) : null}

      <Section title="Detected patterns" note="Category × time combos with 3+ logged tasks, ranked by confidence" palette={palette}>
        {data.total === 0 ? (
          <EmptyNote palette={palette} text="Log a few tasks below and this will start surfacing the category / time-of-day combinations you delay most often." />
        ) : data.insights.length === 0 ? (
          <EmptyNote palette={palette} text="Not enough repeated category/time combinations yet — each needs at least 3 logged tasks before a pattern counts." />
        ) : (
          <View style={{ gap: 10 }}>
            {data.insights.map((ins, i) => (
              <InsightCard key={`${ins.category}-${ins.timeBucket.key}`} palette={palette} insight={ins} rank={i + 1} />
            ))}
          </View>
        )}
      </Section>

      <Section title="Delay rate by category" palette={palette}>
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <CategoryBarChart palette={palette} catStats={data.catStats} />
        </View>
      </Section>

      <Section title="Category × time of day" palette={palette}>
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Heatmap palette={palette} ctStats={data.ctStats} />
        </View>
      </Section>

      <Section
        title="Behavioral clusters"
        note={
          clusterData.ready
            ? "Unsupervised k-means over category, time and effort"
            : `Log ${clusterData.needed} more task${clusterData.needed === 1 ? "" : "s"} to unlock (needs 12+ total)`
        }
        palette={palette}
      >
        {clusterData.ready ? (
          <View style={{ gap: 10 }}>
            {clusterData.clusters.map((cl, i) => (
              <ClusterCard key={i} palette={palette} cluster={cl} letter={String.fromCharCode(65 + i)} />
            ))}
          </View>
        ) : (
          <EmptyNote palette={palette} text="Clustering groups tasks by category, time of day and effort all at once — patterns the table above can miss." />
        )}
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  note,
  palette,
  children,
}: {
  title: string;
  note?: string;
  palette: Palette;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={[styles.sectionTitle, { color: palette.ink, fontFamily: fonts.display }]}>{title}</Text>
      {note ? <Text style={[styles.sectionNote, { color: palette.inkMuted, fontFamily: fonts.body }]}>{note}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 26, paddingBottom: 48 },
  heroStats: { flexDirection: "row", gap: 10 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16 },
  sectionTitle: { fontSize: 18 },
  sectionNote: { fontSize: 12, marginTop: -6 },
});
