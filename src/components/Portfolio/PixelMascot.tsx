import type { CSSProperties } from "react";

type Pose = "about" | "skills" | "experience" | "education" | "badges" | "projects" | "contact";
type Side = "left" | "right";

const LINE = "var(--line)";
const INK = "var(--ink)";
const ACCENT = "var(--accent)";
const ACCENT2 = "var(--accent-2)";

// Container is 100 x 132. Head/body/legs are fixed anchor points shared by
// every pose so limbs always read as attached to the body regardless of angle.
const HEAD = { x: 50, y: 6, d: 26 };
const BODY = { x: 50, y: 28, w: 38, h: 46 };
const SHOULDER_L = { x: 27, y: 32 };
const SHOULDER_R = { x: 73, y: 32 };
const HIP_L = { x: 41, y: 70 };
const HIP_R = { x: 59, y: 70 };

function headBox(dx = 0, dy = 0): CSSProperties {
  return {
    position: "absolute", left: HEAD.x - HEAD.d / 2, top: HEAD.y, width: HEAD.d, height: HEAD.d,
    borderRadius: "50%", background: INK, border: `2px solid ${LINE}`,
    transform: dx || dy ? `translate(${dx}px, ${dy}px)` : undefined,
  };
}
function bodyBox(rotate = 0): CSSProperties {
  return {
    position: "absolute", left: BODY.x - BODY.w / 2, top: BODY.y, width: BODY.w, height: BODY.h,
    borderRadius: 9, background: ACCENT2, border: `2px solid ${LINE}`,
    transformOrigin: "50% 20%", transform: `rotate(${rotate}deg)`,
  };
}
// A limb rotates around its own top-center, which is pinned to the anchor —
// so it always stays visually attached to the body no matter the angle.
function limbBox(anchor: { x: number; y: number }, angleDeg: number, len = 20, w = 11, color = ACCENT2): CSSProperties {
  return {
    position: "absolute", left: anchor.x - w / 2, top: anchor.y, width: w, height: len,
    borderRadius: 4, background: color, border: `2px solid ${LINE}`,
    transformOrigin: "50% 0%", transform: `rotate(${angleDeg}deg)`,
  };
}
function legsBoxes(spread: number, bendL: number, bendR: number): CSSProperties[] {
  return [
    limbBox({ x: HIP_L.x - spread / 2, y: HIP_L.y }, bendL, 20, 12, ACCENT2),
    limbBox({ x: HIP_R.x + spread / 2, y: HIP_R.y }, bendR, 20, 12, ACCENT2),
  ];
}
function propRectBox(x: number, y: number, w: number, h: number, color = ACCENT, rotate = 0, radius = 2): CSSProperties {
  return {
    position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h,
    background: color, border: `2px solid ${LINE}`, borderRadius: radius,
    transform: rotate ? `rotate(${rotate}deg)` : undefined,
  };
}
function propCircleBox(x: number, y: number, d: number, color = ACCENT): CSSProperties {
  return {
    position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d,
    borderRadius: "50%", background: color, border: `2px solid ${LINE}`,
  };
}

const POSES: Record<Pose, CSSProperties[]> = {
  about: [
    bodyBox(0), ...legsBoxes(8, 0, 0),
    limbBox(SHOULDER_L, 6, 20, 11), limbBox(SHOULDER_R, 22, 18, 11),
    headBox(),
    propRectBox(84, 46, 12, 15, ACCENT, -8), // folder held out at side
  ],
  skills: [
    bodyBox(0), ...legsBoxes(8, 0, 0),
    limbBox(SHOULDER_L, -100, 16, 11), // bent bicep-flex arm
    limbBox(SHOULDER_R, 10, 18, 11),
    headBox(),
    propCircleBox(50, 2, 14, ACCENT), // gear/idea circle floating above head
    propRectBox(44, -3, 3, 8, ACCENT, 0, 1),
    propRectBox(56, -3, 3, 8, ACCENT, 0, 1), // gear teeth ticks
  ],
  experience: [
    bodyBox(-10), ...legsBoxes(10, -6, 4),
    limbBox(SHOULDER_L, 40, 20, 11),
    limbBox({ x: SHOULDER_R.x + 2, y: SHOULDER_R.y }, -30, 20, 11),
    headBox(-3, 0),
    propRectBox(80, 54, 22, 6, ACCENT, 42), // wrench, long thin rotated bar
  ],
  education: [
    bodyBox(0), ...legsBoxes(8, 0, 0),
    limbBox(SHOULDER_L, 8, 20, 11), limbBox(SHOULDER_R, 18, 18, 11),
    headBox(),
    propRectBox(50, 4, 30, 6, LINE, 0, 1),   // mortarboard flat top
    propRectBox(50, 8, 8, 8, ACCENT2, 0, 1), // mortarboard button/base
    propRectBox(64, 10, 2, 14, LINE, 12, 0), // tassel
    propRectBox(83, 48, 16, 11, ACCENT, 0),  // book held at side
  ],
  badges: [
    bodyBox(4), ...legsBoxes(10, 4, -2),
    limbBox({ x: SHOULDER_L.x - 2, y: SHOULDER_L.y }, -165, 22, 11), // arm raised straight up
    limbBox(SHOULDER_R, 14, 18, 11),
    headBox(),
    propRectBox(24, 8, 2, 20, ACCENT, 0, 0), // ribbon
    propCircleBox(24, 2, 14, ACCENT),        // medal held aloft
  ],
  projects: [
    bodyBox(-16), ...legsBoxes(8, -8, -8),
    limbBox({ x: SHOULDER_L.x + 4, y: SHOULDER_L.y - 2 }, 70, 18, 11),
    limbBox({ x: SHOULDER_R.x - 2, y: SHOULDER_R.y - 2 }, 55, 18, 11),
    headBox(-6, 2),
    propRectBox(58, 66, 26, 4, ACCENT2, 0, 1), // laptop base
    propRectBox(58, 56, 24, 16, ACCENT, 0, 2), // laptop screen, upright
  ],
  contact: [
    bodyBox(0), ...legsBoxes(8, 0, 0),
    limbBox(SHOULDER_L, -150, 20, 11), // waving arm raised near head
    limbBox(SHOULDER_R, 10, 18, 11),
    headBox(),
    propRectBox(82, 50, 15, 11, ACCENT, -6), // envelope body
    propRectBox(82, 46, 15, 6, LINE, -6, 0), // envelope flap sliver on top
  ],
};

interface PixelMascotProps {
  pose: Pose;
  side: Side;
}

const PixelMascot = ({ pose, side }: PixelMascotProps) => (
  <div className={`pf-mascot pf-mascot--${side}`} data-reveal aria-hidden="true">
    <div className="pf-mascot-figure">
      {POSES[pose].map((style, i) => (
        <span key={i} style={style} />
      ))}
    </div>
  </div>
);

export default PixelMascot;
export type { Pose, Side };
