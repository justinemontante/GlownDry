import React from "react";
import Svg, { Path } from "react-native-svg";

const PATHS: Record<string, string> = {
  home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  calendar: "M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z M16 2v4 M8 2v4 M3 10h18",
  "map-pin": "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 7a3 3 0 100 6 3 3 0 000-6z",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  wind: "M9.59 4.59A2 2 0 1111 8H2M10.59 17.41A2 2 0 1014 16H2M17.65 7.65A2.5 2.5 0 1019.5 12H2",
  "washing-machine": "M5 2h14a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2z M3 6h3 M17 6h.01 M17 13a5 5 0 11-10 0 5 5 0 0110 0z M12 18a2.5 2.5 0 000-5 2.5 2.5 0 010-5",
  "arrow-left": "M19 12H5 M12 19l-7-7 7-7",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  lock: "M12 15v2m-6-4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2m-1 0V7a5 5 0 10-10 0v4",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z",
  phone: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  "eye-off": "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  "bell-off": "M13.73 21a2 2 0 01-3.46 0M18.63 13A17.89 17.89 0 0118 8M6.26 6.26A5.86 5.86 0 006 8c0 7-3 9-3 9h14M18 8a6 6 0 00-9.33-4.69M1 1l22 22",
  check: "M5 13l4 4L19 7",
  "check-circle": "M22 12a10 10 0 11-20 0 10 10 0 0120 0z M9 12l2 2 4-4",
  plus: "M12 5v14 M5 12h14",
  "plus-circle": "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M8 12h8 M12 8v8",
  x: "M18 6L6 18 M6 6l12 12",
  "edit-2": "M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z",
  "log-out": "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  clock: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
  package: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M12 22V12 M12 12L3 7 M21 7l-9 5",
  inbox: "M22 12h-6l-2 3H9l-3-3H2 M2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6 M2 12l2-7h16l2 7",
  loader: "M12 2v4M12 18v4M2 12h4M18 12h4M5.64 5.64l2.83 2.83M15.53 15.53l2.83 2.83M5.64 18.36l2.83-2.83M15.53 8.47l2.83-2.83",
  archive: "M21 8v13a2 2 0 01-2 2H5a2 2 0 01-2-2V8 M4 8h16 M8 3h8l2 3H6l2-3z M10 12h4",
  "chevron-right": "M9 18l6-6-6-6",
  "alert-circle": "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8v4 M12 16h.01",
  camera: "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z M9 14a3 3 0 106 0 3 3 0 00-6 0z",
};

const ICON_MAP: Record<string, string> = {
  home: "home",
  calendar: "calendar",
  "map-pin": "map-pin",
  star: "star",
  wind: "wind",
  "washing-machine": "washing-machine",
  "arrow-left": "arrow-left",
  mail: "mail",
  lock: "lock",
  user: "user",
  phone: "phone",
  eye: "eye",
  "eye-off": "eye-off",
  bell: "bell",
  "bell-off": "bell-off",
  check: "check",
  "check-circle": "check-circle",
  plus: "plus",
  "plus-circle": "plus-circle",
  x: "x",
  "edit-2": "edit-2",
  "log-out": "log-out",
  clock: "clock",
  package: "package",
  inbox: "inbox",
  loader: "loader",
  archive: "archive",
  "chevron-right": "chevron-right",
  "alert-circle": "alert-circle",
  camera: "camera",
};

interface FlaticonIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export function FlaticonIcon({
  name,
  size = 24,
  color = "#212529",
  style,
}: FlaticonIconProps) {
  const iconName = ICON_MAP[name] || name;
  const d = PATHS[iconName];

  if (!d) return null;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {d.split("M").map((segment, i) => {
        if (!segment) return null;
        return <Path key={i} d={`M${segment}`} />;
      })}
    </Svg>
  );
}
