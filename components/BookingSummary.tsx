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
      <h3 className="text-xl font-display font-black text-white mb-6 tracking-tight">Booking Summary</h3>
      
      <div className="space-y-4 mb-8">
        <div className="flex justify-between text-sm">
          <span className="text-white/50 font-light">Sport:</span>
          <span className="font-semibold text-white">{sport.name}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-white/50 font-light">Court:</span>
          <span className="font-semibold text-white">{court.name}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-white/50 font-light">Location:</span>
          <span className="font-semibold text-white text-right max-w-[60%]">{court.location}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-white/50 font-light">Time Slot:</span>
          {slot ? (
            <Badge variant="success" className="bg-[#0C0C10]/80 backdrop-blur-sm border-white/20 text-white">
              {slot}
            </Badge>
          ) : (
            <span className="text-white/30">Not selected</span>
          )}
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-white/50 font-light">Price per hour:</span>
          <span className="font-semibold text-white numbers">PKR {court.pricePerHour.toLocaleString()}</span>
        </div>
        
        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="flex justify-between text-lg font-display font-black">
            <span className="text-white">Total:</span>
            <span className="text-white numbers">PKR {totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {onConfirm && (
        <>
          {!supabaseConfigured && (
            <div className="mb-4 p-3 bg-[#0C0C10]/80 backdrop-blur-sm border border-white/10 rounded-xl">
              <p className="text-xs text-white/60">
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

