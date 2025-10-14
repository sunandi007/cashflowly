import React from "react";
import { Ionicons } from "@expo/vector-icons";
import type { IconComponentProps } from "@/types/model";

const IconComponent: React.FC<IconComponentProps> = ({
  item,
  size,
  color,
}) => {
  try {
    const iconName = item.icon;
    if (!iconName) return null;

    return <Ionicons name={iconName as any} size={size} color={color} />;

    return null;
  } catch {
    return null;
  }
};

export default IconComponent;
