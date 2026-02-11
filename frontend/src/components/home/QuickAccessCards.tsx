import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Shield, BarChart3, Users, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import votersEducationImg from "@/assets/voters-education.png";
import electionIntegrityImg from "@/assets/election-integrity.png";
import electionPartiesImg from "@/assets/election-parties.jpg";

const cards = [
  {
    title: "Voter Education",
    description: "Learn about the voting process, eligibility, and your rights as a voter.",
    icon: BookOpen,
    path: "/election-2026?tab=education",
    gradient: "from-blue-600 to-blue-800",
    iconBg: "bg-blue-500",
    hoverBorder: "hover:border-blue-400",
    image: votersEducationImg,
  },
  {
    title: "Election Integrity",
    description: "Resources for free, fair, and transparent elections.",
    icon: Shield,
    path: "/election-2026?tab=integrity",
    gradient: "from-emerald-600 to-emerald-800",
    iconBg: "bg-emerald-500",
    hoverBorder: "hover:border-emerald-400",
    image: electionIntegrityImg,
  },
  {
    title: "Election Data",
    description: "Key facts, figures, and comprehensive information about the 2026 election.",
    icon: BarChart3,
    path: "/election-2026?tab=data",
    gradient: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-500",
    hoverBorder: "hover:border-amber-400",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  },
  {
    title: "Political Parties",
    description: "Neutral information about contesting parties and manifestos.",
    icon: Users,
    path: "/election-2026?tab=parties",
    gradient: "from-rose-600 to-red-700",
    iconBg: "bg-rose-500",
    hoverBorder: "hover:border-rose-400",
    image: electionPartiesImg,
  },
];

const QuickAccessCards = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const currentCard = cards[currentIndex];
  const IconComponent = currentCard.icon;

  return (
    <div className="relative w-full h-[400px] sm:h-[450px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center px-4"
        >
          <Link 
            to={currentCard.path} 
            className={`group block relative bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl border-2 border-gray-100 dark:border-gray-800 overflow-hidden w-full max-w-4xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${currentCard.hoverBorder}`}
          >
            <div className="grid md:grid-cols-2 gap-0">
              {/* Image Section */}
              <div className="relative h-48 md:h-full overflow-hidden">
                <img 
                  src={currentCard.image} 
                  alt={currentCard.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${currentCard.gradient} opacity-15`} />
              </div>
              
              {/* Content Section */}
              <div className="p-6 sm:p-8 flex flex-col justify-center">
                {/* Gradient accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r ${currentCard.gradient}`} />
                
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br ${currentCard.gradient} shadow-lg mb-4 sm:mb-6`}>
                  <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={2} />
                </div>
                
                {/* Content */}
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 group-hover:text-gray-700 dark:group-hover:text-gray-100 transition-colors">
                  {currentCard.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">
                  {currentCard.description}
                </p>
                
                {/* Arrow link */}
                <div className={`inline-flex items-center text-sm sm:text-base font-semibold bg-gradient-to-r ${currentCard.gradient} bg-clip-text text-transparent`}>
                  Explore
                  <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2 transition-transform duration-300 group-hover:translate-x-1 text-gray-600`} />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>
      
      {/* Indicator Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? "bg-gray-900 dark:bg-white w-6" 
                : "bg-gray-300 dark:bg-gray-600"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickAccessCards;
