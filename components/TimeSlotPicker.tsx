"use client";

interface TimeSlotPickerProps {
  slots: string[];
  selectedSlot: string | null;
  onSelect: (slot: string) => void;
  disabledSlots?: string[];
  className?: string;
}

export default function TimeSlotPicker({
  slots,
  selectedSlot,
  onSelect,
  disabledSlots = [],
  className = "",
}: TimeSlotPickerProps) {
  const isSlotDisabled = (slot: string) => disabledSlots.includes(slot);
  const isSlotSelected = (slot: string) => selectedSlot === slot;

  return (
    <div className={`space-y-6 ${className}`}>
      <h3 className="text-xl font-display font-bold text-white mb-2 tracking-tight">Select Time Slot</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
        {slots.map((slot) => {
          const disabled = isSlotDisabled(slot);
          const selected = isSlotSelected(slot);

          const baseStyles = "px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 border relative overflow-hidden group active:scale-[0.98]";
          
          let buttonStyles = "";
          if (disabled) {
            buttonStyles = "bg-[#0A0A0C]/40 border-white/5 text-white/30 cursor-not-allowed opacity-40";
          } else if (selected) {
            buttonStyles = "bg-[#0C0C10] border-white/20 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] scale-[1.02] hover:scale-[1.03]";
          } else {
            buttonStyles = "bg-[#0A0A0C]/80 backdrop-blur-sm border-white/10 text-white/70 hover:bg-[#0C0C10] hover:text-white hover:border-white/20 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]";
          }

          return (
            <button
              key={slot}
              type="button"
              onClick={() => !disabled && onSelect(slot)}
              disabled={disabled}
              className={`${baseStyles} ${buttonStyles}`}
            >
              {/* Luxury top highlight gradient */}
              <span className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <span className="relative z-10">{slot}</span>
            </button>
          );
        })}
      </div>
      {selectedSlot && (
        <div className="mt-6 p-4 bg-[#0A0A0C]/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]">
          <p className="text-sm font-medium text-white">
            <span className="text-white/60 font-semibold tracking-wide">Selected:</span> <span className="text-white/90">{selectedSlot}</span>
          </p>
        </div>
      )}
    </div>
  );
}

