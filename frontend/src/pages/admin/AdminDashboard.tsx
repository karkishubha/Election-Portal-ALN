import { BookOpen, Shield, Newspaper, Users, TrendingUp, FileText, Loader2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAdminStats } from "@/hooks/useQueries";
import { formatDistanceToNow } from "date-fns";

const getActivityLabel = (type: string) => {
  switch (type) {
    case 'voter-education': return 'Voter Education';
    case 'election-integrity': return 'Election Integrity';
    case 'newsletter': return 'Newsletter';
    case 'political-party': return 'Political Party';
    default: return type;
  }
};

const AdminDashboard = () => {
  const { data, isLoading } = useAdminStats();
  const stats = data?.data;

  const statsCards = [
    { 
      label: "Voter Education Resources", 
      value: stats?.voterEducation.total || 0, 
      icon: BookOpen, 
      path: "/admin/voter-education" 
    },
    { 
      label: "Violations", 
      value: stats?.electionIntegrity.total || 0, 
      icon: Shield, 
      path: "/admin/violations" 
    },
    { 
      label: "Newsletters Published", 
      value: stats?.newsletters.total || 0, 
      icon: Newspaper, 
      path: "/admin/newsletters" 
    },
    { 
      label: "Political Parties", 
      value: stats?.politicalParties.total || 0, 
      icon: Users, 
      path: "/admin/political-parties" 
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage election portal content and resources
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            <div className="col-span-4 flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            statsCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={stat.path}
                  className="block admin-card hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <stat.icon className="w-5 h-5 text-accent" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="admin-card"
          >
            <h2 className="font-display text-lg font-semibold mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              {[ 
                { label: "Add Voter Education Resource", path: "/admin/voter-education", icon: BookOpen },
                { label: "Upload Newsletter", path: "/admin/newsletters", icon: Newspaper },
                { label: "Add Political Party", path: "/admin/political-parties", icon: Users },
                { label: "Add Violation", path: "/admin/violations", icon: Shield },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.path}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <action.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="admin-card"
          >
            <h2 className="font-display text-lg font-semibold mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                  >
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        {activity.action} {getActivityLabel(activity.type)}: {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No recent activity. Start by adding some content!
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Content Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="admin-card mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">
              Content Overview
            </h2>
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Use the sidebar navigation to manage different content sections. 
            Each section allows you to add, edit, and remove resources. 
            All changes will be reflected on the public portal immediately.
          </p>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
