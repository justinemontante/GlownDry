import { Platform } from "react-native";

let Picker: any = null;
if (Platform.OS !== "web") {
  try {
    Picker = require("@react-native-community/datetimepicker").default;
  } catch {}
}

export function NativeDatePicker(props: any) {
  if (!Picker) return null;
  return <Picker {...props} />;
}
