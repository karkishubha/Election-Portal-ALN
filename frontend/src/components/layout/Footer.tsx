import { Link } from "react-router-dom";
import { Vote, Mail, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="civic-container py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                <Vote className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="font-display font-semibold text-sm sm:text-base">Nepal Election Portal</p>
                <p className="text-[10px] sm:text-xs opacity-70">2082 BS</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
              A neutral, non-partisan election information hub by Accountability Lab Nepal.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-sm sm:text-base mb-3 sm:mb-4">Quick Links</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {[
                { label: "Voter Education", path: "/voter-education" },
                { label: "Election Integrity", path: "/election-integrity" },
                { label: "Election Monitoring", path: "/election-monitoring" },
                { label: "Political Parties", path: "/political-parties" },
              ].map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-display font-semibold text-sm sm:text-base mb-3 sm:mb-4">About</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                >
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="https://www.accountabilitylab.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm opacity-80 hover:opacity-100 transition-opacity inline-flex items-center gap-1"
                >
                  Accountability Lab <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-sm sm:text-base mb-3 sm:mb-4">Contact</h4>
            <div className="space-y-2 sm:space-y-3">
              <a
                href="mailto:info@accountabilitylab.org"
                className="text-sm opacity-80 hover:opacity-100 transition-opacity flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                info@accountabilitylab.org
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm opacity-70 text-center sm:text-left">
              © 2025 Accountability Lab Nepal. All rights reserved.
            </p>
            <p className="text-[10px] sm:text-xs opacity-50 text-center sm:text-right">
              This portal is non-partisan and does not endorse any political party.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
