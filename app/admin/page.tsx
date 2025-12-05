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
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-3 tracking-tight">Admin Overview</h1>
        <p className="text-white/50 font-light tracking-wide">Manage bookings on Play Zone Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6 bg-[#0A0A0C]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-white/20 hover:shadow-[0_12px_48px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 relative overflow-hidden group">
              {/* Luxury top highlight gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/50 mb-2 font-light tracking-wide">{stat.title}</p>
                  <p className="text-3xl md:text-4xl font-display font-black text-white numbers">{stat.value}</p>
                </div>
                <div className="bg-[#0C0C10] border border-white/10 p-3 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.3)] group-hover:border-white/20 transition-all duration-300">
                  <Icon className="w-6 h-6 text-white/90" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-[#0A0A0C]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]">
          <h2 className="text-xl font-display font-bold text-white mb-6 tracking-tight">Quick Actions</h2>
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

        <Card className="p-6 bg-[#0A0A0C]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]">
          <h2 className="text-xl font-display font-bold text-white mb-6 tracking-tight">Recent Sports</h2>
          <div className="space-y-2">
            {sports.slice(0, 5).map((sport) => (
              <Link
                key={sport.id}
                href={`/admin/sports/${sport.id}`}
                className="block p-4 rounded-xl bg-[#0C0C10]/50 border border-white/5 hover:bg-[#0C0C10] hover:border-white/10 transition-all duration-300 group"
              >
                <p className="font-semibold text-white mb-1 group-hover:text-white/90 transition-colors">{sport.name}</p>
                <p className="text-sm text-white/50 font-light">
                  {sport.courts.length} {sport.courts.length === 1 ? "court" : "courts"}
                </p>
              </Link>
            ))}
            {sports.length === 0 && (
              <p className="text-white/40 text-sm font-light">No sports yet. Create your first sport!</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

