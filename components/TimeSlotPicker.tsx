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
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">Select Time Slot</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
        {slots.map((slot) => {
          const disabled = isSlotDisabled(slot);
          const selected = isSlotSelected(slot);

          const baseStyles = "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 border-2";
          
          let buttonStyles = "";
          if (disabled) {
            buttonStyles = "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed";
          } else if (selected) {
            buttonStyles = "bg-primary-600 border-primary-600 text-white hover:bg-primary-700";
          } else {
            buttonStyles = "bg-white border-gray-300 text-gray-700 hover:border-primary-500 hover:bg-primary-50";
          }

          return (
            <button
              key={slot}
              type="button"
              onClick={() => !disabled && onSelect(slot)}
              disabled={disabled}
              className={`${baseStyles} ${buttonStyles}`}
            >
              {slot}
            </button>
          );
        })}
      </div>
      {selectedSlot && (
        <div className="mt-4 p-4 bg-primary-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Selected:</strong> {selectedSlot}
          </p>
        </div>
      )}
    </div>
  );
}

