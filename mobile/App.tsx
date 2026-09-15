import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import { usePalette } from "./src/hooks/usePalette";
import { fontAssets, fonts } from "./src/fonts";
import { Task } from "./src/types";
import { loadTasks, saveTasks, clearAllTasks } from "./src/data/storage";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { LogScreen } from "./src/screens/LogScreen";

SplashScreen.preventAutoHideAsync().catch(() => {});

type Tab = "dashboard" | "log";

function genId(): string {
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function Root() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");

  useEffect(() => {
    loadTasks().then((t) => {
      setTasks(t);
      setReady(true);
    });
  }, []);

  const addTask = useCallback((task: Omit<Task, "id">) => {
    setTasks((prev) => {
      const next = [{ ...task, id: genId() }, ...prev];
      saveTasks(next);
      return next;
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveTasks(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setTasks([]);
    clearAllTasks();
  }, []);

  if (!ready) return null;

  const sortedTasks = [...tasks].sort((a, b) => (a.loggedAt < b.loggedAt ? 1 : -1));

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <StatusBar style={palette.bg === "#0e0f12" ? "light" : "dark"} />
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: palette.bg, borderColor: palette.border }]}>
        <Text style={[styles.eyebrow, { color: palette.accent, fontFamily: fonts.mono }]}>CASE FILE · PERSONAL DELAY ANALYSIS</Text>
        <Text style={[styles.title, { color: palette.ink, fontFamily: fonts.displayItalic }]}>Procrastination{"\n"}Pattern Matcher</Text>

        <View style={[styles.tabs, { backgroundColor: palette.surface2 }]}>
          <TabButton label="Insights" active={tab === "dashboard"} palette={palette} onPress={() => setTab("dashboard")} />
          <TabButton label="Log task" active={tab === "log"} palette={palette} onPress={() => setTab("log")} />
        </View>
      </View>

      {tab === "dashboard" ? (
        <DashboardScreen palette={palette} tasks={sortedTasks} />
      ) : (
        <LogScreen palette={palette} tasks={sortedTasks} onAdd={addTask} onDelete={deleteTask} onClearAll={clearAll} />
      )}
    </View>
  );
}

function TabButton({ label, active, palette, onPress }: { label: string; active: boolean; palette: ReturnType<typeof usePalette>; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabBtn, active ? { backgroundColor: palette.accent } : null]}
    >
      <Text style={{ color: active ? palette.accentInk : palette.ink2, fontFamily: active ? fonts.bodySemiBold : fonts.bodyMedium, fontSize: 13.5 }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <Root />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 14, gap: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  eyebrow: { fontSize: 10.5, letterSpacing: 1.2 },
  title: { fontSize: 26, lineHeight: 30 },
  tabs: { flexDirection: "row", borderRadius: 10, padding: 3, marginTop: 6 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
});
