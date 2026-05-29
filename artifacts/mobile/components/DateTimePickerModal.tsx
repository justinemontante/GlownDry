import React, { useMemo, useState } from "react";
import {
  Modal, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { FlaticonIcon } from "./FlaticonIcon";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const TEAL = "#0A7474";
const SLATE = "#1a2a3a";
const MUTED = "#8a94a6";
const BORDER = "#e2e8f0";
const BG_LIGHT = "#f8fafc";

interface DateTimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: string, time: string) => void;
}

export function DateTimePickerModal({ visible, onClose, onSelect }: DateTimePickerModalProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [hourInput, setHourInput] = useState("");
  const [minuteInput, setMinuteInput] = useState("");
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const days = useMemo(() => {
    const d: (number | null)[] = [];
    for (let i = 0; i < startDay; i++) d.push(null);
    for (let i = 1; i <= daysInMonth; i++) d.push(i);
    return d;
  }, [year, month]);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  }

  function parseTime(): string | null {
    const h = parseInt(hourInput.trim(), 10);
    const min = minuteInput.trim();
    if (!/^\d{1,2}$/.test(hourInput.trim()) || h < 1 || h > 12) return null;
    if (!/^\d{2}$/.test(min)) return null;
    const hr24 = ampm === "PM" && h !== 12 ? h + 12 : ampm === "AM" && h === 12 ? 0 : h;
    if (hr24 < 7 || hr24 > 18) return null;
    return `${String(hr24).padStart(2, "0")}:${min}`;
  }

  function isTimePast(): boolean {
    if (!selectedDay || !hourInput.trim() || !minuteInput.trim()) return false;
    const parsed = parseTime();
    if (!parsed) return false;
    const nowPH = new Date();
    const selectedDate = new Date(year, month, selectedDay, parseInt(parsed.split(":")[0]), parseInt(parsed.split(":")[1]));
    return selectedDate <= nowPH;
  }

  function handleConfirm() {
    if (!selectedDay || !hourInput.trim() || !minuteInput.trim()) return;
    const parsed = parseTime();
    if (!parsed) return;
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(selectedDay).padStart(2, "0");
    onSelect(`${year}-${mm}-${dd}`, parsed);
  }

  const timeParsed = parseTime();
  const timeValid = timeParsed !== null && !isTimePast();
  const timePast = timeParsed !== null && isTimePast();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View>
              <View style={styles.headerAccent} />
              <Text style={styles.title}>Select Schedule</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <FlaticonIcon name="x" size={18} color={MUTED} />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionLabelRow}>
            <Text style={styles.sectionLabel}>Time</Text>
          </View>
          <View style={styles.timeRow}>
            <View style={[styles.inputWrap, styles.hourInputWrap, hourInput && !timeValid && styles.inputError]}>
              <TextInput
                style={styles.timeInput}
                placeholder="HH"
                placeholderTextColor="#c0c8d4"
                value={hourInput}
                onChangeText={setHourInput}
                keyboardType="number-pad"
                maxLength={2}
                testID="input-hour"
              />
            </View>
            <Text style={styles.timeColon}>:</Text>
            <View style={[styles.inputWrap, styles.minInputWrap, minuteInput && !timeValid && styles.inputError]}>
              <TextInput
                style={styles.timeInput}
                placeholder="MM"
                placeholderTextColor="#c0c8d4"
                value={minuteInput}
                onChangeText={setMinuteInput}
                keyboardType="number-pad"
                maxLength={2}
                testID="input-minute"
              />
            </View>
            <View style={styles.ampmGroup}>
              <TouchableOpacity
                style={[styles.ampmBtn, ampm === "AM" && styles.ampmBtnActive]}
                onPress={() => setAmpm("AM")}
              >
                <Text style={[styles.ampmText, ampm === "AM" && styles.ampmTextActive]}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ampmBtn, ampm === "PM" && styles.ampmBtnActive]}
                onPress={() => setAmpm("PM")}
              >
                <Text style={[styles.ampmText, ampm === "PM" && styles.ampmTextActive]}>PM</Text>
              </TouchableOpacity>
            </View>
          </View>

          {hourInput && minuteInput && !timeValid && (
            <Text style={styles.errorHint}>
              {timePast ? "This time has already passed today" : "Enter a valid time between 7:00 AM and 6:00 PM"}
            </Text>
          )}

          <Text style={styles.sectionLabel}>Date</Text>
          <View style={styles.monthRow}>
            <TouchableOpacity onPress={prevMonth} style={styles.arrowBtn}>
              <FlaticonIcon name="chevron-right" size={16} color={SLATE} style={{ transform: [{ rotate: "180deg" }] }} />
            </TouchableOpacity>
            <Text style={styles.monthText}>{MONTHS[month]} {year}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.arrowBtn}>
              <FlaticonIcon name="chevron-right" size={16} color={SLATE} />
            </TouchableOpacity>
          </View>

          <View style={styles.dayHeaderRow}>
            {DAYS.map(d => <Text key={d} style={styles.dayHeader}>{d}</Text>)}
          </View>

          <View style={styles.daysGrid}>
            {days.map((d, i) => {
              const isSelected = d === selectedDay;
              const isPast = d !== null && new Date(year, month, d) < new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                  ]}
                  onPress={() => !isPast && setSelectedDay(d)}
                  disabled={isPast}
                >
                  <Text style={[
                    styles.dayText,
                    isSelected && styles.dayTextSelected,
                    isPast && styles.dayTextPast,
                  ]}>
                    {d ?? ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, (!selectedDay || !timeValid) && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={!selectedDay || !timeValid}
            >
              <FlaticonIcon name="check" size={16} color="#fff" />
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center",
    padding: 20,
  },
  modal: {
    width: "100%", maxWidth: 380,
    backgroundColor: "#fff", borderRadius: 24,
    padding: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25, shadowRadius: 40, elevation: 20,
  },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 20, fontFamily: "Inter_700Bold", color: SLATE,
  },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: BG_LIGHT, alignItems: "center", justifyContent: "center",
  },
  sectionLabelRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  sectionLabel: {
    fontSize: 11, fontFamily: "Inter_600SemiBold", color: MUTED,
    textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10,
  },
  monthRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 16,
  },
  arrowBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: BG_LIGHT,
  },
  monthText: {
    fontSize: 16, fontFamily: "Inter_700Bold", color: SLATE,
  },
  dayHeaderRow: {
    flexDirection: "row", justifyContent: "space-around",
    marginBottom: 8,
  },
  dayHeader: {
    width: 38, textAlign: "center",
    fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#94a3b8",
  },
  daysGrid: {
    flexDirection: "row", flexWrap: "wrap",
    marginBottom: 16,
  },
  dayCell: {
    width: "14.28%", aspectRatio: 1,
    alignItems: "center", justifyContent: "center",
    borderRadius: 22, position: "relative",
  },
  dayCellSelected: {
    backgroundColor: TEAL,
  },
  dayText: {
    fontSize: 14, fontFamily: "Inter_500Medium", color: SLATE,
  },
  dayTextSelected: {
    color: "#fff", fontFamily: "Inter_700Bold",
  },
  dayTextPast: {
    color: "#d0d5dd",
  },

  /* Time */
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4,
    borderColor: BORDER, backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#ef4444", backgroundColor: "#FEF2F2",
  },
  timeInput: {
    fontSize: 20, fontFamily: "Inter_700Bold",
    color: SLATE, paddingVertical: 10, textAlign: "center",
  },
  timeColon: {
    fontSize: 22, fontFamily: "Inter_700Bold", color: MUTED,
  },
  timeRow: {
    flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16,
  },
  hourInputWrap: {
    width: 72, flex: 0,
  },
  minInputWrap: {
    width: 72, flex: 0,
  },
  ampmGroup: {
    flexDirection: "column", gap: 4, marginLeft: 4,
  },
  ampmBtn: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1.5, borderColor: BORDER,
    backgroundColor: "#fff",
  },
  ampmBtnActive: {
    backgroundColor: TEAL, borderColor: TEAL,
  },
  ampmText: {
    fontSize: 11, fontFamily: "Inter_700Bold", color: SLATE,
  },
  ampmTextActive: {
    color: "#fff",
  },
  errorHint: {
    fontSize: 11, fontFamily: "Inter_500Medium", color: "#ef4444",
    marginBottom: 16, marginTop: 0,
  },

  /* Buttons */
  btnRow: {
    flexDirection: "row", gap: 10, marginTop: 12,
  },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: BG_LIGHT, alignItems: "center",
  },
  cancelText: {
    fontSize: 14, fontFamily: "Inter_600SemiBold", color: MUTED,
  },
  confirmBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 14, borderRadius: 14,
    backgroundColor: TEAL,
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff",
  },
});
