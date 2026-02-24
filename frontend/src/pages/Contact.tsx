import { Mail, MessageSquare } from "lucide-react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import { motion } from "framer-motion";

const Contact = () => {
  return (
    <Layout>
      <PageHeader
        title="Contact Us"
        description="Have questions or feedback about the Nepal Election Portal? We'd love to hear from you."
        icon={<MessageSquare className="w-6 h-6" />}
      />

      <section className="py-8 sm:py-12 lg:py-16">
        <div className="civic-container">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-6 sm:p-8 md:p-10 text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-accent/10">
                  <Mail className="w-8 h-8 text-accent" />
                </div>
              </div>

              <h2 className="font-display text-2xl font-semibold mb-4">
                Get in Touch
              </h2>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                For any inquiries, questions, or feedback about the Nepal Election Portal,
                please feel free to reach out to us via email.
              </p>

              <div className="inline-flex items-center gap-3 px-6 py-4 bg-muted/30 rounded-lg mb-8">
                <Mail className="w-5 h-5 text-accent" />
                <a
                  href="mailto:info@accountabilitylab.org"
                  className="text-lg font-medium text-accent hover:underline"
                >
                  info@accountabilitylab.org
                </a>
              </div>

              <div className="p-6 bg-muted/20 rounded-lg">
                <h4 className="font-medium text-foreground mb-3">
                  Accountability Lab Nepal
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We are committed to responding to all inquiries in a timely manner. 
                  For urgent matters related to election integrity or misinformation, 
                  please include "URGENT" in your email subject line.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
