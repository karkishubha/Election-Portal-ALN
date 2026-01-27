import { Info, Users, Target, Handshake } from "lucide-react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import { motion } from "framer-motion";

const About = () => {
  return (
    <Layout>
      <PageHeader
        title="About Us"
        description="Learn about the Nepal Election Portal 2082 and the organizations behind this initiative."
        icon={<Info className="w-6 h-6" />}
      />

      <section className="py-12 lg:py-16">
        <div className="civic-container">
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-6 md:p-8 mb-8"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold mb-3">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Nepal Election Portal 2082 is a neutral, non-partisan information hub 
                  designed to empower citizens with the knowledge they need to participate 
                  meaningfully in Nepal's democratic process. We believe that an informed 
                  electorate is essential for a healthy democracy.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Organizations Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Accountability Lab Nepal */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold">
                  Accountability Lab Nepal
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Accountability Lab Nepal is part of the global Accountability Lab network, 
                working to support active citizens and responsible leaders to build more 
                accountable and inclusive societies.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Through various programs and initiatives, we promote civic engagement, 
                transparency, and good governance in Nepal.
              </p>
            </motion.div>

            {/* Digital Rights Nepal */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Handshake className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display text-lg font-semibold">
                  Digital Rights Nepal (DRN)
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Digital Rights Nepal (DRN) is a non-profit initiative dedicated to protecting and advancing digital rights in Nepal. It works to ensure online freedom of expression, privacy, access to information, and secure internet access for all. Through policy research, advocacy, public awareness campaigns, and capacity-building programs, DRN empowers individuals and institutions to uphold digital rights and contribute to a rights-respecting digital environment in Nepal.
              </p>
            </motion.div>
          </div>

          {/* Portal Purpose */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-muted/30 rounded-xl border border-border p-6 md:p-8"
          >
            <h2 className="font-display text-xl font-semibold mb-4">
              About This Portal
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                This election portal was created to serve as a central hub for reliable, 
                neutral election information during Nepal's 2082 General Election (March 2026).
              </p>
              <p>
                The portal provides:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Voter education resources and guides</li>
                <li>Election integrity and transparency materials</li>
                <li>Regular election monitoring newsletters</li>
                <li>Neutral information about political parties</li>
                <li>Access to official documents and fact sheets</li>
              </ul>
              <p>
                We are committed to providing factual, unbiased information without 
                endorsing any political party or candidate.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
