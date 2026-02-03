import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import CountdownTimer from "@/components/home/CountdownTimer";
import QuickAccessCards from "@/components/home/QuickAccessCards";
import { usePublicStats } from "@/hooks/useQueries";
import heroImage from "@/assets/hero-civic.png";

const Index = () => {
  const { data: statsData, isLoading: statsLoading } = usePublicStats();
  const stats = statsData?.data;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] lg:min-h-[85vh] flex items-center bg-gradient-to-b from-muted/50 to-background overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="civic-container relative z-10 py-8 sm:py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-accent/10 text-accent text-xs sm:text-sm font-medium rounded-full mb-4 sm:mb-6">
                Nepal General Election 2082 BS
              </span>
              
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4 sm:mb-6">
                Information for{" "}
                <span className="text-accent">Informed Voting</span>
              </h1>
              
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 sm:mb-8 max-w-xl">
                A neutral, non-partisan election information portal. 
                Access comprehensive resources to make informed voting decisions in the 2026 election.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <Link to="/election-2026">
                    Explore Election 2026
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </motion.div>

            {/* Countdown Timer */}
            <div className="lg:pl-8">
              <CountdownTimer />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-background">
        <div className="civic-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              Explore Election Resources
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Access comprehensive information to help you make informed decisions during the 2082 election.
            </p>
          </motion.div>

          <QuickAccessCards />
        </div>
      </section>

      {/* About Preview Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-muted/30">
        <div className="civic-container">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 sm:mb-6">
                Empowering Citizens Through Information
              </h2>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground">
                <p>
                  This portal is developed by Accountability Lab Nepal in collaboration with 
                  Digital Rights Nepal (DRN) to promote informed citizen participation 
                  in Nepal's democratic process.
                </p>
                <p>
                  We provide neutral, fact-based information about the election process, 
                  political parties, and election monitoring to help voters make informed decisions.
                </p>
              </div>
              <Button variant="outline" className="mt-4 sm:mt-6" asChild>
                <Link to="/about">About the Portal</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-3 sm:gap-4"
            >
              {statsLoading ? (
                <div className="col-span-2 flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                [
                  { number: stats ? `${stats.totalResources}+` : "0", label: "Resources Available" },
                  { number: stats?.partnerOrganizations?.toString() || "2", label: "Partner Organizations" },
                  { number: stats?.electionYear || "2082", label: "BS Election Year" },
                  { number: stats?.accessHours || "24/7", label: "Information Access" },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-card rounded-lg sm:rounded-xl p-4 sm:p-6 text-center border border-border"
                  >
                    <p className="font-display text-2xl sm:text-3xl font-bold text-accent mb-0.5 sm:mb-1">
                      {stat.number}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
