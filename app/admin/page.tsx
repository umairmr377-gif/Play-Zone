import Link from "next/link";
import { getAllSports, getAdminStats } from "@/lib/admin";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Activity, Calendar, TrendingUp, Plus } from "lucide-react";

export default async function AdminOverview() {
  const stats = await getAdminStats();
  const sports = await getAllSports();

  const statCards = [
    {
      title: "Total Sports",
      value: stats.totalSports,
      icon: Activity,
      color: "bg-blue-500",
    },
    {
      title: "Total Courts",
      value: stats.totalCourts,
      icon: Activity,
      color: "bg-green-500",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: Calendar,
      color: "bg-purple-500",
    },
    {
      title: "Bookings Today",
      value: stats.bookingsToday,
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Overview</h1>
        <p className="text-gray-600">Manage bookings on Play Zone Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/admin/sports">
              <Button fullWidth className="flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Create New Sport
              </Button>
            </Link>
            <Link href="/admin/bookings">
              <Button fullWidth variant="outline" className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                View All Bookings
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Sports</h2>
          <div className="space-y-2">
            {sports.slice(0, 5).map((sport) => (
              <Link
                key={sport.id}
                href={`/admin/sports/${sport.id}`}
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium text-gray-900">{sport.name}</p>
                <p className="text-sm text-gray-600">
                  {sport.courts.length} {sport.courts.length === 1 ? "court" : "courts"}
                </p>
              </Link>
            ))}
            {sports.length === 0 && (
              <p className="text-gray-500 text-sm">No sports yet. Create your first sport!</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

