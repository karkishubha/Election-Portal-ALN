import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, Shield, BookOpen } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import OfficialAnnouncements from "@/components/shared/OfficialAnnouncements";
import Election2026Data from "./election2026/Data";
import Election2026Parties from "./election2026/Parties";
import Election2026Integrity from "./election2026/Integrity";
import Election2026VoterEducation from "./election2026/VoterEducation";

type TabType = "data" | "parties" | "integrity" | "education";

const Election2026 = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as TabType;
  const [activeTab, setActiveTab] = useState<TabType>(tabFromUrl || "data");

  // Update tab when URL changes
  useEffect(() => {
    if (tabFromUrl && ["data", "parties", "integrity", "education"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Update URL when tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const tabs = [
    {
      id: "data" as TabType,
      label: "Election Data",
      icon: BarChart3,
      description: "Key facts and figures of the 2026 election"
    },
    {
      id: "parties" as TabType,
      label: "Political Parties",
      icon: Users,
      description: "Parties contesting in the 2026 election"
    },
    {
      id: "integrity" as TabType,
      label: "Election Integrity",
      icon: Shield,
      description: "Monitoring and integrity-related content"
    },
    {
      id: "education" as TabType,
      label: "Voter Education",
      icon: BookOpen,
      description: "Educational materials for voters"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-12 lg:py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="civic-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Nepal Election 2026
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive information about the 2026 election to help you make informed decisions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="sticky top-20 z-40 bg-card/95 backdrop-blur-sm border-b">
        <div className="civic-container">
          <div className="flex overflow-x-auto gap-2 py-4 md:justify-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => handleTabChange(tab.id)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-12 lg:py-20 bg-background">
        <div className="civic-container grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === "data" && <Election2026Data />}
            {activeTab === "parties" && <Election2026Parties />}
            {activeTab === "integrity" && <Election2026Integrity />}
            {activeTab === "education" && <Election2026VoterEducation />}
          </div>
          <div className="hidden lg:block">
            <OfficialAnnouncements />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Election2026;
