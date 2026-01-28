import { motion } from "framer-motion";
import { Users, MapPin, Award } from "lucide-react";

const Election2026Data = () => {
  const data = [
    {
      icon: Users,
      label: "Total Candidates",
      value: "2,847",
      description: "Contesting in the 2026 election"
    },
    {
      icon: Users,
      label: "Male Candidates",
      value: "1,852",
      percentage: "65%"
    },
    {
      icon: Users,
      label: "Female Candidates",
      value: "995",
      percentage: "35%"
    },
    {
      icon: MapPin,
      label: "Polling Stations",
      value: "6,842",
      description: "Across Nepal"
    },
    {
      icon: Award,
      label: "Political Parties",
      value: "48",
      description: "Registered parties"
    },
    {
      icon: MapPin,
      label: "Constituencies",
      value: "165",
      description: "Constituencies nationwide"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="bg-muted/50 rounded-lg p-6 border">
        <h2 className="text-2xl font-bold text-foreground mb-2">Election 2026 Data</h2>
        <p className="text-muted-foreground">
          This section provides a snapshot of the key facts and figures related to the 2026 election. 
          Here, you will find election data presented in a clear and visual way—such as the number of 
          candidates contesting, gender-wise breakdown of candidates and other demographic breakdowns, 
          polling stations and centres, and other essential statistics. This helps voters quickly 
          understand the scale and structure of the election.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-lg p-6 border hover:border-primary/50 transition-colors"
            >
              <Icon className="w-8 h-8 text-primary mb-3" />
              <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              {stat.percentage && (
                <p className="text-sm text-accent font-semibold mt-2">{stat.percentage}</p>
              )}
              {stat.description && (
                <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Additional Statistics */}
      <div className="bg-muted/30 rounded-lg p-6 border">
        <h3 className="text-xl font-bold text-foreground mb-4">Additional Demographics</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-foreground mb-3">Candidate Distribution by Gender</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Male</span>
                  <span className="font-semibold">65%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "65%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Female</span>
                  <span className="font-semibold">35%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full" style={{ width: "35%" }} />
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Electoral System</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• First-Past-The-Post (FPTP): 165 constituencies</p>
              <p>• Proportional Representation (PR): 110 seats</p>
              <p>• Total Parliament Members: 275</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Election2026Data;
