import React, { useMemo, useState } from "react";
import {
  Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { FlaticonIcon } from "./FlaticonIcon";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const TIMES = ["8:00 AM","10:00 AM","12:00 PM","2:00 PM","4:00 PM","6:00 PM"];

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
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

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

  function handleConfirm() {
    if (!selectedDay || !selectedTime) return;
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(selectedDay).padStart(2, "0");
    onSelect(`${year}-${mm}-${dd}`, selectedTime);
  }

  const todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Drop off Schedule</Text>

          {/* Month/Year Header */}
          <View style={styles.monthRow}>
            <TouchableOpacity onPress={prevMonth} style={styles.arrowBtn}>
              <FlaticonIcon name="chevron-right" size={20} color="#1a2a3a" style={{ transform: [{ rotate: "180deg" }] }} />
            </TouchableOpacity>
            <Text style={styles.monthText}>{MONTHS[month]} {year}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.arrowBtn}>
              <FlaticonIcon name="chevron-right" size={20} color="#1a2a3a" />
            </TouchableOpacity>
          </View>

          {/* Day Headers */}
          <View style={styles.dayHeaderRow}>
            {DAYS.map(d => (
              <Text key={d} style={styles.dayHeader}>{d}</Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {days.map((d, i) => {
              const isToday = d !== null && `${year}-${month}-${d}` === todayStr;
              const isSelected = d === selectedDay;
              const isPast = d !== null && new Date(year, month, d + 1) < new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isToday && !isSelected && styles.dayCellToday,
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

          {/* Time */}
          <Text style={styles.timeLabel}>Time</Text>
          <View style={styles.timeGrid}>
            {TIMES.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.timeChip, selectedTime === t && styles.timeChipSelected]}
                onPress={() => setSelectedTime(t)}
              >
                <Text style={[styles.timeChipText, selectedTime === t && styles.timeChipTextSelected]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, (!selectedDay || !selectedTime) && { opacity: 0.5 }]}
              onPress={handleConfirm}
              disabled={!selectedDay || !selectedTime}
            >
              <FlaticonIcon name="check" size={16} color="#fff" />
              <Text style={styles.confirmText}>Set Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center", alignItems: "center",
    padding: 20,
  },
  modal: {
    width: "100%", maxWidth: 380,
    backgroundColor: "#fff", borderRadius: 24,
    padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 24, elevation: 10,
  },
  title: {
    fontSize: 18, fontFamily: "Inter_700Bold", color: "#1a2a3a",
    textAlign: "center", marginBottom: 16,
  },
  monthRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 12,
  },
  arrowBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  monthText: {
    fontSize: 16, fontFamily: "Inter_700Bold", color: "#1a2a3a",
  },
  dayHeaderRow: {
    flexDirection: "row", justifyContent: "space-around",
    marginBottom: 4,
  },
  dayHeader: {
    width: 40, textAlign: "center",
    fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#8a94a6",
  },
  daysGrid: {
    flexDirection: "row", flexWrap: "wrap",
    marginBottom: 16,
  },
  dayCell: {
    width: "14.28%", aspectRatio: 1,
    alignItems: "center", justifyContent: "center",
    borderRadius: 20,
  },
  dayCellSelected: {
    backgroundColor: "#0A7474",
  },
  dayCellToday: {
    borderWidth: 1.5, borderColor: "#0A7474",
  },
  dayText: {
    fontSize: 14, fontFamily: "Inter_500Medium", color: "#1a2a3a",
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
  timeLabel: {
    fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8a94a6",
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8,
  },
  timeGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 8,
    marginBottom: 20,
  },
  timeChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: "#e2e8f0",
  },
  timeChipSelected: {
    backgroundColor: "#0A7474", borderColor: "#0A7474",
  },
  timeChipText: {
    fontSize: 13, fontFamily: "Inter_500Medium", color: "#1a2a3a",
  },
  timeChipTextSelected: {
    color: "#fff", fontFamily: "Inter_600SemiBold",
  },
  btnRow: {
    flexDirection: "row", gap: 10,
  },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: "#f1f5f9", alignItems: "center",
  },
  cancelText: {
    fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#8a94a6",
  },
  confirmBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 14, borderRadius: 12,
    backgroundColor: "#0A7474",
  },
  confirmText: {
    fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff",
  },
});
