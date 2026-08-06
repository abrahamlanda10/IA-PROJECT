import type { CSSProperties } from "react";

interface SectionHeadingProps {
  tag: string;
  title: string;
}

const CHAR_MS = 45; // typing speed, ms per character
const MIN_DURATION_S = 0.3;
const BLINK_COUNT = 6;

function typingStyle(text: string, delayS: number): CSSProperties {
  const durationS = Math.max(MIN_DURATION_S, (text.length * CHAR_MS) / 1000);
  const caretHideDelayS = delayS + durationS + 1;
  return {
    width: `${text.length}ch`,
    animationName: "pf-type-reveal, pf-caret-blink, pf-caret-hide",
    animationDuration: `${durationS}s, 1s, 0.01s`,
    animationTimingFunction: `steps(${text.length}), step-end, linear`,
    animationDelay: `${delayS}s, ${delayS}s, ${caretHideDelayS}s`,
    animationIterationCount: `1, ${BLINK_COUNT}, 1`,
    animationFillMode: "both, forwards, forwards",
  } as CSSProperties;
}

// Types the eyebrow tag first, then the title — a two-line terminal boot
// sequence rather than both lines typing simultaneously.
const SectionHeading = ({ tag, title }: SectionHeadingProps) => {
  const tagDurationS = Math.max(MIN_DURATION_S, (tag.length * CHAR_MS) / 1000);

  return (
    <div className="pf-section-head" data-reveal>
      <h2 className="pf-section-title">
        <span className="pf-type" style={typingStyle(title, tagDurationS + 0.15)}>{title}</span>
      </h2>
      <span className="pf-tag">
        <span className="pf-type" style={typingStyle(tag, 0)}>{tag}</span>
      </span>
    </div>
  );
};

export default SectionHeading;
