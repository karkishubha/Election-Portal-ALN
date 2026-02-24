import { motion } from "framer-motion";
import { Bell, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnnouncements } from "@/hooks/useQueries";

const OfficialAnnouncements = () => {
  const { data } = useAnnouncements(1);
  const announcements = data?.data || [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 border-red-200";
      case "medium":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card rounded-lg border overflow-hidden sticky top-24 h-fit"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 border-b">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Official Announcements</h3>
        </div>
        <p className="text-xs text-muted-foreground">From Election Commission</p>
      </div>

      {/* Announcements List */}
      <div className="divide-y max-h-96 overflow-y-auto">
        {announcements.map((announcement) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 hover:bg-muted/50 transition-colors ${getPriorityColor(
              announcement.priority
            )}`}
          >
            {/* Priority Badge */}
            <span
              className={`inline-block text-xs font-semibold px-2 py-1 rounded mb-2 ${getPriorityBadgeColor(
                announcement.priority
              )}`}
            >
              {announcement.priority === "high" ? "Urgent" : "Update"}
            </span>

            {/* Title */}
            <h4 className="font-semibold text-foreground text-sm mb-3 line-clamp-2">
              {announcement.title}
            </h4>

            {/* Link */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-auto p-0 text-primary hover:text-primary/80 justify-start text-xs"
              asChild
            >
              <a href={announcement.link} target="_blank" rel="noopener noreferrer">
                Read More
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/30">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          asChild
        >
          <a href="https://election.gov.np/np/press-release" target="_blank" rel="noopener noreferrer">
            View All Announcements
          </a>
        </Button>
      </div>
    </motion.div>
  );
};

export default OfficialAnnouncements;
