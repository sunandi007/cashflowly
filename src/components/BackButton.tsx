import { Ionicons } from "@expo/vector-icons";
import React from "react";

export default function BackButton({ color = "#fff", iconSize = 24 }) {
  return <Ionicons name="chevron-back" size={iconSize} color={color} />;
}