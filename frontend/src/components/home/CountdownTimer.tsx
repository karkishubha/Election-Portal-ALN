import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ELECTION_DATE = new Date("2026-03-05T00:00:00");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = ELECTION_DATE.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeUnits = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-primary rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl"
    >
      <div className="text-center mb-6">
        <h3 className="text-primary-foreground/80 text-sm sm:text-base uppercase tracking-wider mb-2">
          Days Until Election
        </h3>
        <p className="text-primary-foreground/60 text-xs sm:text-sm">
          Falgun 21, 2082 BS • March 5, 2026
        </p>
      </div>

      <div className="flex justify-center gap-3 sm:gap-4 lg:gap-6">
        {timeUnits.map((unit, index) => (
          <motion.div
            key={unit.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="countdown-box"
          >
            <span className="countdown-number">
              {unit.value.toString().padStart(2, "0")}
            </span>
            <span className="countdown-label">{unit.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default CountdownTimer;
