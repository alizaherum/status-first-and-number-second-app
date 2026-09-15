import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CATEGORIES, EFFORT_LEVELS, Palette, fmtHour } from "../theme";
import { fonts } from "../fonts";
import { Task } from "../types";

export function TaskRow({ palette, task, onDelete }: { palette: Palette; task: Task; onDelete: (id: string) => void }) {
  const cat = CATEGORIES.find((c) => c.key === task.category) ?? CATEGORIES[0];
  const effort = EFFORT_LEVELS.find((e) => e.key === task.effortLevel) ?? EFFORT_LEVELS[0];
  const isDelayed = task.status === "delayed";
  const statusColor = isDelayed ? palette.status.critical : palette.status.good;

  return (
    <View style={[styles.row, { backgroundColor: palette.surface2 }]}>
      <View style={[styles.chip, { backgroundColor: palette.category[task.category] }]} />
      <View style={styles.main}>
        <Text style={[styles.title, { color: palette.ink, fontFamily: fonts.bodyMedium }]} numberOfLines={1}>
          {task.title}
        </Text>
        <Text style={[styles.sub, { color: palette.inkMuted, fontFamily: fonts.mono }]}>
          {cat.label} · {fmtHour(task.scheduledHour)} · {effort.short}
        </Text>
      </View>
      <View style={[styles.statusPill, { backgroundColor: statusColor + "26" }]}>
        <Text style={[styles.statusText, { color: statusColor, fontFamily: fonts.mono }]}>
          {isDelayed ? `+${task.delayMinutes}m` : "on time"}
        </Text>
      </View>
      <Pressable onPress={() => onDelete(task.id)} hitSlop={8} style={styles.delBtn}>
        <Text style={{ color: palette.inkMuted, fontSize: 18, lineHeight: 18 }}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, padding: 11, borderRadius: 10 },
  chip: { width: 8, height: 8, borderRadius: 4 },
  main: { flex: 1, gap: 1 },
  title: { fontSize: 13.5 },
  sub: { fontSize: 11 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  statusText: { fontSize: 10.5 },
  delBtn: { padding: 4 },
});
