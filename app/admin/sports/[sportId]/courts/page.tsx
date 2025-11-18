"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sport, Court } from "@/data/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";

export default function AdminCourtsPage() {
  const params = useParams();
  const router = useRouter();
  const sportId = params.sportId as string;
  const [sport, setSport] = useState<Sport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchSport();
  }, [sportId]);

  const fetchSport = async () => {
    try {
      setError(null);
      const response = await fetch("/api/admin/sports");
      if (response.ok) {
        const data = await response.json();
        const found = data.sports.find((s: Sport) => s.id === sportId);
        if (found) {
          setSport(found);
        } else {
          setError("Sport not found");
        }
      } else {
        setError("Failed to load sport");
      }
    } catch (error) {
      console.error("Error fetching sport:", error);
      setError("Failed to load sport");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courtId: string) => {
    if (!confirm("Are you sure you want to delete this court?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/courts?sportId=${sportId}&courtId=${courtId}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        fetchSport();
      } else {
        alert("Failed to delete court");
      }
    } catch (error) {
      console.error("Error deleting court:", error);
      alert("Failed to delete court");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !sport) {
    return <ErrorMessage message={error || "Sport not found"} onRetry={fetchSport} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/sports/${sportId}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Courts for {sport.name}</h1>
            <p className="text-gray-600">Manage courts for this sport</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Court
        </Button>
      </div>

      {sport.courts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600 mb-4">No courts yet. Create your first court!</p>
          <Button onClick={() => setShowCreateModal(true)}>Create Court</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sport.courts.map((court) => (
            <Card key={court.id} className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{court.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{court.location}</p>
              <Badge variant="info" className="mb-4">
                ${court.pricePerHour}/hour
              </Badge>
              <div className="flex gap-2">
                <Link href={`/admin/sports/${sportId}/courts/${court.id}`} className="flex-1">
                  <Button variant="outline" fullWidth size="sm" className="flex items-center justify-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(court.id)}
                  className="flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:border-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateCourtModal
          sportId={sportId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchSport();
          }}
        />
      )}
    </div>
  );
}

function CreateCourtModal({
  sportId,
  onClose,
  onSuccess,
}: {
  sportId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    pricePerHour: "",
    location: "",
    image: "",
    availableTimeSlots: "06:00,07:00,08:00,09:00,10:00,11:00,12:00,13:00,14:00,15:00,16:00,17:00,18:00,19:00,20:00,21:00,22:00,23:00",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const timeSlots = formData.availableTimeSlots
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const response = await fetch("/api/admin/courts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sportId,
          name: formData.name,
          pricePerHour: parseFloat(formData.pricePerHour),
          location: formData.location,
          image: formData.image || undefined,
          availableTimeSlots: timeSlots,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to create court");
      }
    } catch (error) {
      console.error("Error creating court:", error);
      setError("Failed to create court");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Court</h2>
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
              placeholder="/images/court.jpg"
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
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Creating..." : "Create Court"}
            </Button>
            <Button type="button" variant="outline" fullWidth onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

