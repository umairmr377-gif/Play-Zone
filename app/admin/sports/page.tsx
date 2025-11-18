"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sport } from "@/data/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function AdminSportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      setError(null);
      const response = await fetch("/api/admin/sports");
      if (response.ok) {
        const data = await response.json();
        setSports(data.sports || []);
      } else {
        setError("Failed to load sports");
      }
    } catch (error) {
      console.error("Error fetching sports:", error);
      setError("Failed to load sports");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sportId: string) => {
    if (!confirm("Are you sure you want to delete this sport? All courts under it will also be deleted.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/sports?id=${sportId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchSports();
      } else {
        alert("Failed to delete sport");
      }
    } catch (error) {
      console.error("Error deleting sport:", error);
      alert("Failed to delete sport");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchSports} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sports Management</h1>
          <p className="text-gray-600">Manage sports and their courts</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Sport
        </Button>
      </div>

      {sports.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600 mb-4">No sports yet. Create your first sport!</p>
          <Button onClick={() => setShowCreateModal(true)}>Create Sport</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sports.map((sport) => (
            <Card key={sport.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{sport.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{sport.description}</p>
                  <Badge variant="success">
                    {sport.courts.length} {sport.courts.length === 1 ? "Court" : "Courts"}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/sports/${sport.id}`} className="flex-1">
                  <Button variant="outline" fullWidth size="sm" className="flex items-center justify-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(sport.id)}
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
        <CreateSportModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchSports();
          }}
        />
      )}
    </div>
  );
}

function CreateSportModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/sports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to create sport");
      }
    } catch (error) {
      console.error("Error creating sport:", error);
      setError("Failed to create sport");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Sport</h2>
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
              rows={3}
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
              placeholder="/images/football.jpg"
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
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Creating..." : "Create Sport"}
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

