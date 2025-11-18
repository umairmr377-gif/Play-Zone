"use client";

interface TimeSlotProps {
  time: string;
  isAvailable: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export default function TimeSlot({
  time,
  isAvailable,
  isSelected,
  onClick,
}: TimeSlotProps) {
  const baseStyles =
    "px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 cursor-pointer border-2 active:scale-95";
  
  const states = {
    available: "bg-background-light border-primary/30 text-black hover:bg-primary hover:text-white hover:border-primary hover:shadow-glow",
    unavailable: "bg-background-card/50 border-text-secondary/30 text-text-secondary cursor-not-allowed opacity-50",
    selected: "bg-primary border-primary text-white shadow-glow scale-105 hover:scale-110",
  };

  const getState = () => {
    if (isSelected) return states.selected;
    if (!isAvailable) return states.unavailable;
    return states.available;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isAvailable}
      className={`${baseStyles} ${getState()}`}
    >
      {time}
    </button>
  );
}

