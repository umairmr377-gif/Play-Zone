"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sport } from "@/data/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { ArrowLeft } from "lucide-react";

export default function EditSportPage() {
  const params = useParams();
  const router = useRouter();
  const sportId = params.sportId as string;
  const [sport, setSport] = useState<Sport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });
  const [saving, setSaving] = useState(false);

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
          setFormData({
            name: found.name,
            description: found.description,
            image: found.image,
          });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/sports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sportId, ...formData }),
      });

      if (response.ok) {
        router.push("/admin/sports");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to update sport");
      }
    } catch (error) {
      console.error("Error updating sport:", error);
      setError("Failed to update sport");
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

  if (error && !sport) {
    return <ErrorMessage message={error} onRetry={fetchSport} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/sports">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Sport</h1>
          <p className="text-gray-600">Update sport information</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sport Name *
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
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Path *
            </label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
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
            <Link href="/admin/sports">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Courts</h2>
          <Link href={`/admin/sports/${sportId}/courts`}>
            <Button size="sm">Manage Courts</Button>
          </Link>
        </div>
        {sport && sport.courts.length === 0 ? (
          <p className="text-gray-600">No courts yet. Add courts to this sport.</p>
        ) : (
          <div className="space-y-2">
            {sport?.courts.map((court) => (
              <div
                key={court.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{court.name}</p>
                  <p className="text-sm text-gray-600">{court.location}</p>
                </div>
                <span className="text-sm font-medium text-primary-600">
                  ${court.pricePerHour}/hour
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

