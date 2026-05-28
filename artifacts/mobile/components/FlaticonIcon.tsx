import { useEffect, useState, useRef } from "react";
import { SvgXml } from "react-native-svg";

const ICON_MAP: Record<string, string> = {
  home: "home",
  calendar: "calendar",
  "map-pin": "marker",
  star: "star",
  wind: "wind",
  "arrow-left": "arrow-left",
  mail: "envelope",
  lock: "lock",
  user: "user",
  phone: "phone",
  eye: "eye",
  "eye-off": "eye-crossed",
  bell: "bell",
  "bell-off": "bell-slash",
  check: "check",
  "check-circle": "circle-check",
  plus: "plus",
  "plus-circle": "circle-plus",
  x: "cross",
  "edit-2": "pen",
  "log-out": "sign-out-alt",
  clock: "clock",
  package: "box",
  inbox: "inbox",
  loader: "spinner",
  archive: "archive",
  "chevron-right": "chevron-right",
  "alert-circle": "circle-exclamation",
};

const BASE_URL =
  "https://cdn.jsdelivr.net/npm/@flaticon/flaticon-uicons@4.0.0/svg/regular-rounded";

const cache = new Map<string, string>();

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
  const [xml, setXml] = useState<string | null>(null);
  const mounted = useRef(true);

  const iconName = ICON_MAP[name] || name;
  const uri = `${BASE_URL}/fi-rr-${iconName}.svg`;

  useEffect(() => {
    mounted.current = true;

    if (cache.has(uri)) {
      const cached = cache.get(uri)!;
      setXml(replaceColor(cached, color));
      return;
    }

    let cancelled = false;
    fetch(uri)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load icon");
        return r.text();
      })
      .then((svg) => {
        if (cancelled || !mounted.current) return;
        cache.set(uri, svg);
        setXml(replaceColor(svg, color));
      })
      .catch(() => {
        if (!cancelled && mounted.current) setXml(null);
      });

    return () => {
      cancelled = true;
      mounted.current = false;
    };
  }, [uri, color]);

  if (!xml) return null;

  return <SvgXml xml={xml} width={size} height={size} style={style} />;
}

function replaceColor(svg: string, color: string): string {
  const hexColor = color.startsWith("#") ? color : color;
  return svg
    .replace(/stroke="[^"]*"/gi, `stroke="${hexColor}"`)
    .replace(/fill="[^"]*"/gi, (match) => {
      if (match.includes('fill="none"')) return match;
      return `fill="${hexColor}"`;
    });
}
