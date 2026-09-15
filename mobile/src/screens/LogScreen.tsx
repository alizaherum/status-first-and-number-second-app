import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Palette } from "../theme";
import { fonts } from "../fonts";
import { Task } from "../types";
import { TaskForm } from "../components/TaskForm";
import { TaskRow } from "../components/TaskRow";
import { EmptyNote } from "../components/EmptyNote";

export function LogScreen({
  palette,
  tasks,
  onAdd,
  onDelete,
  onClearAll,
}: {
  palette: Palette;
  tasks: Task[];
  onAdd: (task: Omit<Task, "id">) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}) {
  function confirmClear() {
    Alert.alert("Clear all tasks?", "This deletes every logged task on this device. This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear all", style: "destructive", onPress: onClearAll },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <Text style={[styles.cardTitle, { color: palette.ink, fontFamily: fonts.display }]}>Log a task</Text>
        <TaskForm palette={palette} onSubmit={onAdd} />
      </View>

      <View style={{ gap: 10 }}>
        <View style={styles.recentHead}>
          <Text style={[styles.cardTitle, { color: palette.ink, fontFamily: fonts.display }]}>Recent entries</Text>
          {tasks.length > 0 ? (
            <Pressable onPress={confirmClear}>
              <Text style={{ color: palette.status.critical, fontSize: 12.5, fontFamily: fonts.bodyMedium }}>Clear all</Text>
            </Pressable>
          ) : null}
        </View>
        {tasks.length === 0 ? (
          <EmptyNote palette={palette} text="Nothing logged yet." />
        ) : (
          <View style={{ gap: 8 }}>
            {tasks.map((t) => (
              <TaskRow key={t.id} palette={palette} task={t} onDelete={onDelete} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 24, paddingBottom: 48 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  cardTitle: { fontSize: 16 },
  recentHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
