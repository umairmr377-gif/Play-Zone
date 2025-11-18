"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sport, Court } from "@/data/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { ArrowLeft } from "lucide-react";

export default function EditCourtPage() {
  const params = useParams();
  const router = useRouter();
  const sportId = params.sportId as string;
  const courtId = params.courtId as string;
  const [court, setCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    pricePerHour: "",
    location: "",
    image: "",
    availableTimeSlots: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourt();
  }, [sportId, courtId]);

  const fetchCourt = async () => {
    try {
      setError(null);
      const response = await fetch("/api/admin/sports");
      if (response.ok) {
        const data = await response.json();
        const sport = data.sports.find((s: Sport) => s.id === sportId);
        const found = sport?.courts.find((c: Court) => c.id === courtId);
        if (found) {
          setCourt(found);
          setFormData({
            name: found.name,
            pricePerHour: found.pricePerHour.toString(),
            location: found.location,
            image: found.image || "",
            availableTimeSlots: found.availableTimeSlots.join(", "),
          });
        } else {
          setError("Court not found");
        }
      } else {
        setError("Failed to load court");
      }
    } catch (error) {
      console.error("Error fetching court:", error);
      setError("Failed to load court");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const timeSlots = formData.availableTimeSlots
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const response = await fetch("/api/admin/courts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sportId,
          courtId,
          name: formData.name,
          pricePerHour: parseFloat(formData.pricePerHour),
          location: formData.location,
          image: formData.image || undefined,
          availableTimeSlots: timeSlots,
        }),
      });

      if (response.ok) {
        router.push(`/admin/sports/${sportId}/courts`);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to update court");
      }
    } catch (error) {
      console.error("Error updating court:", error);
      setError("Failed to update court");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !court) {
    return <ErrorMessage message={error} onRetry={fetchCourt} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/sports/${sportId}/courts`}>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Court</h1>
          <p className="text-gray-600">Update court information</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Court Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per Hour ($) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.pricePerHour}
              onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Path (optional)
            </label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Time Slots (comma-separated, HH:00 format) *
            </label>
            <textarea
              value={formData.availableTimeSlots}
              onChange={(e) => setFormData({ ...formData, availableTimeSlots: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              rows={3}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: 06:00,07:00,08:00 (24-hour format, HH:00)
            </p>
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Link href={`/admin/sports/${sportId}/courts`}>
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

