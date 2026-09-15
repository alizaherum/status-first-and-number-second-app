import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Palette } from "../theme";
import { fonts } from "../fonts";

export function EmptyNote({ palette, text }: { palette: Palette; text: string }) {
  return (
    <View style={[styles.wrap, { backgroundColor: palette.surface, borderColor: palette.borderStrong }]}>
      <Text style={[styles.text, { color: palette.ink2, fontFamily: fonts.body }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 14, borderWidth: 1, borderStyle: "dashed", padding: 16 },
  text: { fontSize: 13, lineHeight: 19 },
});
