import { Sport, Court } from "@/data/types";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import { isSupabaseConfigured } from "@/lib/supabaseClientCheck";

interface BookingSummaryProps {
  sport: Sport;
  court: Court;
  slot: string | null;
  onConfirm?: () => void;
  isLoading?: boolean;
  className?: string;
}

export default function BookingSummary({
  sport,
  court,
  slot,
  onConfirm,
  isLoading = false,
  className = "",
}: BookingSummaryProps) {
  const totalPrice = slot ? court.pricePerHour : 0;
  const supabaseConfigured = isSupabaseConfigured();

  return (
    <Card className={`p-6 sticky top-24 ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Summary</h3>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Sport:</span>
          <span className="font-medium">{sport.name}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Court:</span>
          <span className="font-medium">{court.name}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Location:</span>
          <span className="font-medium text-right max-w-[60%]">{court.location}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Time Slot:</span>
          {slot ? (
            <Badge variant="success">{slot}</Badge>
          ) : (
            <span className="text-gray-400">Not selected</span>
          )}
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Price per hour:</span>
          <span className="font-medium">${court.pricePerHour}</span>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-primary-600">${totalPrice}</span>
          </div>
        </div>
      </div>

      {onConfirm && (
        <>
          {!supabaseConfigured && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ Bookings are disabled. Please configure Supabase to enable booking functionality.
              </p>
            </div>
          )}
          <Button
            fullWidth
            onClick={onConfirm}
            disabled={!slot || isLoading || !supabaseConfigured}
          >
            {isLoading ? "Processing..." : supabaseConfigured ? "Confirm Booking" : "Booking Disabled"}
          </Button>
        </>
      )}
    </Card>
  );
}

