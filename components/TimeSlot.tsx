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
    "px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 cursor-pointer border relative overflow-hidden group active:scale-[0.98]";
  
  const states = {
    available: "bg-[#0A0A0C]/80 backdrop-blur-sm border-white/10 text-white/70 hover:bg-[#0C0C10] hover:text-white hover:border-white/20 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]",
    unavailable: "bg-[#0A0A0C]/40 border-white/5 text-white/30 cursor-not-allowed opacity-40",
    selected: "bg-[#0C0C10] border-white/20 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] scale-[1.02] hover:scale-[1.03]",
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
      {/* Luxury top highlight gradient */}
      <span className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <span className="relative z-10">{time}</span>
    </button>
  );
}

