import linePlaying from "../../styles/assets/linePlaying.png";
import lineFailed from "../../styles/assets/lineFailed.png";
import linePaused from "../../styles/assets/linePaused.png";
import lineStopped from "../../styles/assets/lineStopped.png";
import lineBlock from "../../styles/assets/lineBlock.png";

export const SESSION_STATES = {
  RUNNING: "running",
  STARTING: "starting",
  STOPPING: "stopping",
  HIBERNATED: "hibernated",
  FAILED: "failed",
} as const;

export const SESSION_STYLES = {
  WARNING: {
    textColor: "text-warning-emphasis",
    bgColor: "warning",
    borderColor: "border-warning",
    sessionLine: linePlaying,
  },
  SUCCESS: {
    textColor: "text-success-emphasis",
    bgColor: "success",
    borderColor: "border-success",
    sessionLine: linePlaying,
  },
  HIBERNATED: {
    textColor: "text-dark-emphasis",
    bgColor: "light",
    borderColor: "border-dark-subtle",
    sessionLine: linePaused,
  },
  FAILED: {
    textColor: "text-danger-emphasis",
    bgColor: "danger",
    borderColor: "border-danger",
    sessionLine: lineFailed,
  },
  STOPPING: {
    textColor: "text-warning-emphasis",
    bgColor: "warning",
    borderColor: "border-warning",
    sessionLine: lineStopped,
  },
  DEFAULT: {
    textColor: "text-warning",
    bgColor: "warning",
    borderColor: "border-warning",
    sessionLine: lineBlock,
  },
} as const;
