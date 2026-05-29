import React, { useMemo, useState } from "react";
import {
  Modal, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { FlaticonIcon } from "./FlaticonIcon";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

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
    if (hr24 < 7 || hr24 > 20) return null;
    return `${String(hr24).padStart(2, "0")}:${min}`;
  }

  function handleConfirm() {
    if (!selectedDay || !hourInput.trim() || !minuteInput.trim()) return;
    const parsed = parseTime();
    if (!parsed) return;
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(selectedDay).padStart(2, "0");
    onSelect(`${year}-${mm}-${dd}`, parsed);
  }

  const todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select Schedule</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <FlaticonIcon name="x" size={20} color="#8a94a6" />
            </TouchableOpacity>
          </View>

          {/* Date Section */}
          <Text style={styles.sectionLabel}>Date</Text>

          {/* Month/Year */}
          <View style={styles.monthRow}>
            <TouchableOpacity onPress={prevMonth} style={styles.arrowBtn}>
              <FlaticonIcon name="chevron-right" size={18} color="#1a2a3a" style={{ transform: [{ rotate: "180deg" }] }} />
            </TouchableOpacity>
            <Text style={styles.monthText}>{MONTHS[month]} {year}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.arrowBtn}>
              <FlaticonIcon name="chevron-right" size={18} color="#1a2a3a" />
            </TouchableOpacity>
          </View>

          {/* Day Headers */}
          <View style={styles.dayHeaderRow}>
            {DAYS.map(d => <Text key={d} style={styles.dayHeader}>{d}</Text>)}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {days.map((d, i) => {
              const isToday = d !== null && `${year}-${month}-${d}` === todayStr;
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
                    isToday && !isSelected && styles.dayTextToday,
                  ]}>
                    {d ?? ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Time Section */}
          <Text style={styles.sectionLabel}>Time</Text>
          <View style={styles.timeRow}>
            <View style={[styles.inputWrap, styles.hourInputWrap, !hourInput.trim() || parseTime() ? {} : styles.inputError]}>
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
            <View style={[styles.inputWrap, styles.minInputWrap, !minuteInput.trim() || parseTime() ? {} : styles.inputError]}>
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
            <View style={styles.ampmRow}>
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

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, (!selectedDay || !hourInput.trim() || !minuteInput.trim() || !parseTime()) && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={!selectedDay || !hourInput.trim() || !minuteInput.trim() || !parseTime()}
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
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center", alignItems: "center",
    padding: 20,
  },
  modal: {
    width: "100%", maxWidth: 380,
    backgroundColor: "#fff", borderRadius: 28,
    padding: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2, shadowRadius: 32, elevation: 16,
  },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18, fontFamily: "Inter_700Bold", color: "#1a2a3a",
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center",
  },
  sectionLabel: {
    fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#8a94a6",
    textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10,
  },
  monthRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 14,
  },
  arrowBtn: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  monthText: {
    fontSize: 15, fontFamily: "Inter_700Bold", color: "#1a2a3a",
  },
  dayHeaderRow: {
    flexDirection: "row", justifyContent: "space-around",
    marginBottom: 6,
  },
  dayHeader: {
    width: 40, textAlign: "center",
    fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#94a3b8",
  },
  daysGrid: {
    flexDirection: "row", flexWrap: "wrap",
    marginBottom: 20,
  },
  dayCell: {
    width: "14.28%", aspectRatio: 1,
    alignItems: "center", justifyContent: "center",
    borderRadius: 20,
  },
  dayCellSelected: {
    backgroundColor: "#0A7474",
  },
  dayText: {
    fontSize: 13, fontFamily: "Inter_500Medium", color: "#1a2a3a",
  },
  dayTextSelected: {
    color: "#fff", fontFamily: "Inter_700Bold",
  },
  dayTextToday: {
    color: "#0A7474", fontFamily: "Inter_700Bold",
  },
  dayTextPast: {
    color: "#d0d5dd",
  },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4,
    borderColor: "#e2e8f0",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  timeInput: {
    fontSize: 18, fontFamily: "Inter_700Bold",
    color: "#1a2a3a", paddingVertical: 8, textAlign: "center",
  },
  timeColon: {
    fontSize: 20, fontFamily: "Inter_700Bold", color: "#1a2a3a",
  },
  timeRow: {
    flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 24,
  },
  hourInputWrap: {
    width: 68, flex: 0,
  },
  minInputWrap: {
    width: 68, flex: 0,
  },
  ampmRow: {
    flexDirection: "row", gap: 6,
  },
  ampmBtn: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1.5, borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  ampmBtnActive: {
    backgroundColor: "#0A7474", borderColor: "#0A7474",
  },
  ampmText: {
    fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1a2a3a",
  },
  ampmTextActive: {
    color: "#fff",
  },
  btnRow: {
    flexDirection: "row", gap: 10,
  },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: "#f1f5f9", alignItems: "center",
  },
  cancelText: {
    fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#94a3b8",
  },
  confirmBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 14, borderRadius: 14,
    backgroundColor: "#0A7474",
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff",
  },
});
