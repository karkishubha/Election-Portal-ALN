import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Shield, Newspaper, Users, ArrowRight } from "lucide-react";

const cards = [
  {
    title: "Voter Education",
    description: "Learn about the voting process, eligibility, and your rights as a voter.",
    icon: BookOpen,
    path: "/voter-education",
    gradient: "from-blue-600 to-blue-800",
    iconBg: "bg-blue-500",
    hoverBorder: "hover:border-blue-400",
  },
  {
    title: "Election Integrity",
    description: "Resources for free, fair, and transparent elections.",
    icon: Shield,
    path: "/election-integrity",
    gradient: "from-emerald-600 to-emerald-800",
    iconBg: "bg-emerald-500",
    hoverBorder: "hover:border-emerald-400",
  },
  {
    title: "Election Monitoring",
    description: "Access newsletters and reports from election observers.",
    icon: Newspaper,
    path: "/election-monitoring",
    gradient: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-500",
    hoverBorder: "hover:border-amber-400",
  },
  {
    title: "Political Parties",
    description: "Neutral information about contesting parties and manifestos.",
    icon: Users,
    path: "/political-parties",
    gradient: "from-rose-600 to-red-700",
    iconBg: "bg-rose-500",
    hoverBorder: "hover:border-rose-400",
  },
];

const QuickAccessCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.path}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
        >
          <Link 
            to={card.path} 
            className={`group block relative bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-800 p-6 h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${card.hoverBorder}`}
          >
            {/* Gradient accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl bg-gradient-to-r ${card.gradient}`} />
            
            {/* Icon */}
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg mb-5`}>
              <card.icon className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            
            {/* Content */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-gray-700 dark:group-hover:text-gray-100 transition-colors">
              {card.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
              {card.description}
            </p>
            
            {/* Arrow link */}
            <div className={`inline-flex items-center text-sm font-semibold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
              Explore
              <ArrowRight className={`w-4 h-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-1 text-gray-600`} />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickAccessCards;
