"use client";

import TimeSlot from "./TimeSlot";
import { generateTimeSlots } from "@/lib/utils";

interface TimeSlotGridProps {
  availableSlots: string[];
  bookedSlots: string[];
  selectedSlots: string[];
  onSlotToggle: (time: string) => void;
}

export default function TimeSlotGrid({
  availableSlots,
  bookedSlots,
  selectedSlots,
  onSlotToggle,
}: TimeSlotGridProps) {
  // Generate all time slots from 6 AM to 11 PM
  const allSlots = generateTimeSlots(6, 23);

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-xl font-display font-semibold text-text-primary">Select Time Slot</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
        {allSlots.map((time) => {
          const isBooked = bookedSlots.includes(time);
          const isSelected = selectedSlots.includes(time);
          const isAvailable = !isBooked;

          return (
            <TimeSlot
              key={time}
              time={time}
              isAvailable={isAvailable}
              isSelected={isSelected}
              onClick={() => onSlotToggle(time)}
            />
          );
        })}
      </div>
      {selectedSlots.length > 0 && (
        <div className="mt-6 p-4 card-glass rounded-2xl border border-primary/20 animate-slide-in">
          <p className="text-sm font-medium text-text-primary">
            <span className="text-primary font-semibold">Selected:</span> {selectedSlots.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

