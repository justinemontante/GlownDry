import React, { useMemo, useState } from "react";
import {
  Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { FlaticonIcon } from "./FlaticonIcon";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const CLOCK_SIZE = 220;
const CLOCK_RADIUS = CLOCK_SIZE / 2;
const DOT_RADIUS = 80;
const BTN_SIZE = 38;
const HALF_BTN = BTN_SIZE / 2;

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function position(index: number, total: number) {
  const angle = (index * (360 / total) - 90) * (Math.PI / 180);
  return {
    left: CLOCK_RADIUS + DOT_RADIUS * Math.cos(angle) - HALF_BTN,
    top: CLOCK_RADIUS + DOT_RADIUS * Math.sin(angle) - HALF_BTN,
  };
}

function handAngle(value: number, total: number) {
  return (value / total) * 360 - 90;
}

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
  const [clockMode, setClockMode] = useState<"hour" | "minute">("hour");
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(null);
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const days = useMemo(() => {
    const d: (number | null)[] = [];
    for (let i = 0; i < startDay; i++) d.push(null);
    for (let i = 1; i <= daysInMonth; i++) d.push(i);
    return d;
  }, [year, month]);

  const selectedTime = useMemo(() => {
    if (selectedHour === null || selectedMinute === null) return "";
    const hr24 = ampm === "PM" && selectedHour !== 12
      ? selectedHour + 12
      : ampm === "AM" && selectedHour === 12
        ? 0
        : selectedHour;
    return `${String(hr24).padStart(2, "0")}:${String(selectedMinute).padStart(2, "0")}`;
  }, [selectedHour, selectedMinute, ampm]);

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

  function handleHourSelect(h: number) {
    setSelectedHour(h);
    setClockMode("minute");
  }

  function handleMinuteSelect(m: number) {
    setSelectedMinute(m);
  }

  function handleConfirm() {
    if (!selectedDay || !selectedHour || selectedMinute === null) return;
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(selectedDay).padStart(2, "0");
    onSelect(`${year}-${mm}-${dd}`, selectedTime);
  }

  function formatTime() {
    if (selectedHour === null) return "";
    const min = selectedMinute !== null ? String(selectedMinute).padStart(2, "0") : "";
    return `${selectedHour}:${min || "–"} ${ampm}`;
  }

  function isDisabledHour(h: number) {
    const hr24 = ampm === "PM" && h !== 12 ? h + 12 : ampm === "AM" && h === 12 ? 0 : h;
    return hr24 < 7 || hr24 > 20;
  }

  const todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const handDeg = clockMode === "hour"
    ? handAngle(HOURS.indexOf(selectedHour ?? 12), 12)
    : handAngle(MINUTES.indexOf(selectedMinute ?? 0), 12);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Schedule</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <FlaticonIcon name="x" size={20} color="#8a94a6" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Date</Text>

          <View style={styles.monthRow}>
            <TouchableOpacity onPress={prevMonth} style={styles.arrowBtn}>
              <FlaticonIcon name="chevron-right" size={18} color="#1a2a3a" style={{ transform: [{ rotate: "180deg" }] }} />
            </TouchableOpacity>
            <Text style={styles.monthText}>{MONTHS[month]} {year}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.arrowBtn}>
              <FlaticonIcon name="chevron-right" size={18} color="#1a2a3a" />
            </TouchableOpacity>
          </View>

          <View style={styles.dayHeaderRow}>
            {DAYS.map(d => <Text key={d} style={styles.dayHeader}>{d}</Text>)}
          </View>

          <View style={styles.daysGrid}>
            {days.map((d, i) => {
              const isToday = d !== null && `${year}-${month}-${d}` === todayStr;
              const isSelected = d === selectedDay;
              const isPast = d !== null && new Date(year, month, d) < new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.dayCell, isSelected && styles.dayCellSelected]}
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

          <Text style={styles.sectionLabel}>Time</Text>

          {/* Time display */}
          <View style={styles.timeDisplayRow}>
            <TouchableOpacity
              style={[styles.timePart, clockMode === "hour" && styles.timePartActive]}
              onPress={() => setClockMode("hour")}
            >
              <Text style={[styles.timePartText, clockMode === "hour" && styles.timePartTextActive]}>
                {selectedHour !== null ? String(selectedHour).padStart(2, "0") : "–"}
              </Text>
            </TouchableOpacity>
            <Text style={styles.timeColon}>:</Text>
            <TouchableOpacity
              style={[styles.timePart, clockMode === "minute" && styles.timePartActive]}
              onPress={() => setClockMode("minute")}
            >
              <Text style={[styles.timePartText, clockMode === "minute" && styles.timePartTextActive]}>
                {selectedMinute !== null ? String(selectedMinute).padStart(2, "0") : "–"}
              </Text>
            </TouchableOpacity>
            <View style={styles.ampmCol}>
              <TouchableOpacity
                style={[styles.ampmBtn, ampm === "AM" && styles.ampmBtnActive]}
                onPress={() => { setAmpm("AM"); setSelectedHour(null); setSelectedMinute(null); setClockMode("hour"); }}
              >
                <Text style={[styles.ampmText, ampm === "AM" && styles.ampmTextActive]}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ampmBtn, ampm === "PM" && styles.ampmBtnActive]}
                onPress={() => { setAmpm("PM"); setSelectedHour(null); setSelectedMinute(null); setClockMode("hour"); }}
              >
                <Text style={[styles.ampmText, ampm === "PM" && styles.ampmTextActive]}>PM</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Clock Dial */}
          <View style={styles.clockFace}>
            <View style={styles.clockCenter} />
            {selectedHour !== null && (
              <View style={[styles.hand, { transform: [{ rotate: `${handDeg}deg` }] }]} />
            )}
            {(clockMode === "hour" ? HOURS : MINUTES).map((val, i) => {
              const pos = position(i, 12);
              const isSelected = clockMode === "hour"
                ? val === selectedHour
                : val === selectedMinute;
              const disabled = clockMode === "hour" && isDisabledHour(val);
              return (
                <TouchableOpacity
                  key={`${clockMode}-${val}`}
                  style={[
                    styles.dotBtn,
                    { left: pos.left, top: pos.top },
                    isSelected && styles.dotBtnSelected,
                  ]}
                  onPress={() => {
                    if (disabled) return;
                    if (clockMode === "hour") handleHourSelect(val as number);
                    else {
                      handleMinuteSelect(val as number);
                      setClockMode("hour");
                    }
                  }}
                  disabled={disabled}
                >
                  <Text style={[
                    styles.dotText,
                    isSelected && styles.dotTextSelected,
                    disabled && styles.dotTextPast,
                  ]}>
                    {clockMode === "hour" ? val : String(val).padStart(2, "0")}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom row: switch mode & confirm */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, (!selectedDay || selectedHour === null || selectedMinute === null) && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={!selectedDay || selectedHour === null || selectedMinute === null}
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

  /* Time display */
  timeDisplayRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 4, marginBottom: 16,
  },
  timePart: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1.5, borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  timePartActive: {
    borderColor: "#0A7474", backgroundColor: "#E8F5F4",
  },
  timePartText: {
    fontSize: 22, fontFamily: "Inter_700Bold", color: "#1a2a3a",
  },
  timePartTextActive: {
    color: "#0A7474",
  },
  timeColon: {
    fontSize: 22, fontFamily: "Inter_700Bold", color: "#1a2a3a",
  },
  ampmCol: {
    marginLeft: 10, gap: 4,
  },
  ampmBtn: {
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1.5, borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  ampmBtnActive: {
    backgroundColor: "#0A7474", borderColor: "#0A7474",
  },
  ampmText: {
    fontSize: 11, fontFamily: "Inter_700Bold", color: "#1a2a3a",
  },
  ampmTextActive: {
    color: "#fff",
  },

  /* Clock dial */
  clockFace: {
    width: CLOCK_SIZE, height: CLOCK_SIZE,
    borderRadius: CLOCK_RADIUS,
    backgroundColor: "#f1f5f9",
    alignSelf: "center",
    marginBottom: 20,
    position: "relative",
    justifyContent: "center", alignItems: "center",
  },
  clockCenter: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: "#0A7474",
    zIndex: 10,
  },
  hand: {
    position: "absolute",
    width: 3, height: DOT_RADIUS - 10,
    backgroundColor: "#0A7474",
    borderRadius: 2,
    bottom: CLOCK_RADIUS - 4,
    transformOrigin: "bottom center",
    zIndex: 5,
  },
  dotBtn: {
    position: "absolute",
    width: BTN_SIZE, height: BTN_SIZE,
    borderRadius: HALF_BTN,
    alignItems: "center", justifyContent: "center",
    zIndex: 20,
  },
  dotBtnSelected: {
    backgroundColor: "#0A7474",
  },
  dotText: {
    fontSize: 14, fontFamily: "Inter_700Bold", color: "#1a2a3a",
  },
  dotTextSelected: {
    color: "#fff",
  },
  dotTextPast: {
    color: "#d0d5dd",
  },

  /* Buttons */
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
