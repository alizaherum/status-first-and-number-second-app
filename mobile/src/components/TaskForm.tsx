import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { CATEGORIES, EFFORT_LEVELS, Palette, fmtHour } from "../theme";
import { fonts } from "../fonts";
import { CategoryKey, EffortKey, Task, TaskStatus } from "../types";

const HOURS = Array.from({ length: 24 }, (_, h) => h);

export function TaskForm({ palette, onSubmit }: { palette: Palette; onSubmit: (task: Omit<Task, "id">) => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategoryKey>("admin");
  const [hour, setHour] = useState(9);
  const [effort, setEffort] = useState<EffortKey>("medium");
  const [status, setStatus] = useState<TaskStatus>("on_time");
  const [delayMinutes, setDelayMinutes] = useState("30");
  const [confirmMsg, setConfirmMsg] = useState("");

  function handleSubmit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit({
      title: trimmed.slice(0, 80),
      category,
      scheduledHour: hour,
      effortLevel: effort,
      status,
      delayMinutes: status === "delayed" ? Math.max(1, parseInt(delayMinutes, 10) || 30) : 0,
      loggedAt: new Date().toISOString(),
    });
    setTitle("");
    setConfirmMsg("Logged ✓");
    setTimeout(() => setConfirmMsg(""), 2200);
  }

  const inputStyle = [styles.input, { backgroundColor: palette.surface2, borderColor: palette.borderStrong, color: palette.ink, fontFamily: fonts.body }];

  return (
    <View style={{ gap: 12 }}>
      <View style={styles.field}>
        <Text style={[styles.label, { color: palette.ink2, fontFamily: fonts.bodyMedium }]}>Task</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. File expense report"
          placeholderTextColor={palette.inkMuted}
          maxLength={80}
          style={inputStyle}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: palette.ink2, fontFamily: fonts.bodyMedium }]}>Category</Text>
        <View style={[styles.pickerWrap, { backgroundColor: palette.surface2, borderColor: palette.borderStrong }]}>
          <Picker selectedValue={category} onValueChange={(v) => setCategory(v)} style={{ color: palette.ink }} dropdownIconColor={palette.ink}>
            {CATEGORIES.map((c) => (
              <Picker.Item key={c.key} label={c.label} value={c.key} color={palette.ink} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.fieldRow}>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={[styles.label, { color: palette.ink2, fontFamily: fonts.bodyMedium }]}>Scheduled for</Text>
          <View style={[styles.pickerWrap, { backgroundColor: palette.surface2, borderColor: palette.borderStrong }]}>
            <Picker selectedValue={hour} onValueChange={(v) => setHour(v)} style={{ color: palette.ink }} dropdownIconColor={palette.ink}>
              {HOURS.map((h) => (
                <Picker.Item key={h} label={fmtHour(h)} value={h} color={palette.ink} />
              ))}
            </Picker>
          </View>
        </View>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={[styles.label, { color: palette.ink2, fontFamily: fonts.bodyMedium }]}>Effort</Text>
          <View style={[styles.pickerWrap, { backgroundColor: palette.surface2, borderColor: palette.borderStrong }]}>
            <Picker selectedValue={effort} onValueChange={(v) => setEffort(v)} style={{ color: palette.ink }} dropdownIconColor={palette.ink}>
              {EFFORT_LEVELS.map((e) => (
                <Picker.Item key={e.key} label={e.short} value={e.key} color={palette.ink} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: palette.ink2, fontFamily: fonts.bodyMedium }]}>Outcome</Text>
        <View style={styles.radioRow}>
          {(["on_time", "delayed"] as TaskStatus[]).map((s) => {
            const checked = status === s;
            return (
              <Pressable
                key={s}
                onPress={() => setStatus(s)}
                style={[
                  styles.radioOpt,
                  {
                    borderColor: checked ? palette.accent : palette.borderStrong,
                    backgroundColor: checked ? palette.accentSoft : "transparent",
                  },
                ]}
              >
                <Text style={{ color: checked ? palette.ink : palette.ink2, fontFamily: checked ? fonts.bodySemiBold : fonts.body, fontSize: 13 }}>
                  {s === "on_time" ? "Done on time" : "Delayed"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {status === "delayed" && (
        <View style={styles.field}>
          <Text style={[styles.label, { color: palette.ink2, fontFamily: fonts.bodyMedium }]}>Delayed by (minutes)</Text>
          <TextInput
            value={delayMinutes}
            onChangeText={setDelayMinutes}
            keyboardType="number-pad"
            style={inputStyle}
          />
        </View>
      )}

      <Pressable onPress={handleSubmit} style={[styles.submit, { backgroundColor: palette.accent }]}>
        <Text style={{ color: palette.accentInk, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>Log task</Text>
      </Pressable>
      {confirmMsg ? <Text style={{ color: palette.status.good, fontSize: 12.5, fontFamily: fonts.body }}>{confirmMsg}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 5 },
  fieldRow: { flexDirection: "row", gap: 10 },
  label: { fontSize: 12 },
  input: { borderRadius: 9, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 9, fontSize: 14 },
  pickerWrap: { borderRadius: 9, borderWidth: 1, overflow: "hidden" },
  radioRow: { flexDirection: "row", gap: 8 },
  radioOpt: { flex: 1, borderWidth: 1, borderRadius: 9, paddingVertical: 10, alignItems: "center" },
  submit: { borderRadius: 9, paddingVertical: 12, alignItems: "center", marginTop: 2 },
});
