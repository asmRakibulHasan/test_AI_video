import React from "react";

interface CatIconProps {
  size: number;
  color: string;
  outline?: string;
}

/**
 * A plain SVG cat face with explicit fill colors. Deliberately not an emoji:
 * headless Chrome on Linux render machines often lacks a color-emoji font,
 * so 🐱 renders as a flat black glyph there even though it looks fine in a
 * normal desktop browser. Real shapes with real fills always render
 * correctly regardless of the machine doing the rendering.
 */
export const CatIcon: React.FC<CatIconProps> = ({ size, color, outline = "#0b1220" }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <polygon
        points="18,38 32,8 42,36"
        fill={color}
        stroke={outline}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <polygon
        points="82,38 68,8 58,36"
        fill={color}
        stroke={outline}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <polygon points="24,33 33,16 38,33" fill={outline} opacity={0.25} />
      <polygon points="76,33 67,16 62,33" fill={outline} opacity={0.25} />
      <circle cx="50" cy="58" r="38" fill={color} stroke={outline} strokeWidth={3} />
      <ellipse cx="36" cy="56" rx="5" ry="7" fill={outline} />
      <ellipse cx="64" cy="56" rx="5" ry="7" fill={outline} />
      <polygon points="45,66 55,66 50,73" fill={outline} />
      <line x1="8" y1="62" x2="30" y2="60" stroke={outline} strokeWidth={2.5} strokeLinecap="round" />
      <line x1="8" y1="72" x2="30" y2="68" stroke={outline} strokeWidth={2.5} strokeLinecap="round" />
      <line x1="92" y1="62" x2="70" y2="60" stroke={outline} strokeWidth={2.5} strokeLinecap="round" />
      <line x1="92" y1="72" x2="70" y2="68" stroke={outline} strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
};
