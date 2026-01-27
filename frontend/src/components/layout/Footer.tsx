import { Link } from "react-router-dom";
import { Vote, Mail, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="civic-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                <Vote className="w-6 h-6" />
              </div>
              <div>
                <p className="font-display font-semibold">Nepal Election Portal</p>
                <p className="text-xs opacity-70">2082 BS</p>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              A neutral, non-partisan election information hub by Accountability Lab Nepal.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
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
            <h4 className="font-display font-semibold mb-4">About</h4>
            <ul className="space-y-2">
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
            <h4 className="font-display font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
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

        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm opacity-70">
              © 2025 Accountability Lab Nepal. All rights reserved.
            </p>
            <p className="text-xs opacity-50">
              This portal is non-partisan and does not endorse any political party.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
