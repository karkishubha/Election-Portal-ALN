import { motion } from "framer-motion";
import { Play, Image, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ResourceCard from "@/components/shared/ResourceCard";
import { useInfographics, useVideos, useExplainers } from "@/hooks/useQueries";

const Election2026VoterEducation = () => {
  const { data: infographicsData } = useInfographics(1);
  const { data: videosData } = useVideos(1);
  const { data: explainersData } = useExplainers(1);
  const infographics = infographicsData?.data || [];
  const videos = videosData?.data || [];
  const explainers = explainersData?.data || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="bg-muted/50 rounded-lg p-6 border">
        <h2 className="text-2xl font-bold text-foreground mb-2">Voter Education</h2>
        <p className="text-muted-foreground">
          This section focuses on helping voters better understand the election and voting process. 
          It features infographics, videos, and explainers created by various organisations, including 
          the Election Commission and civic groups. Content is presented in a visual-first format with 
          plain language that's easy to understand.
        </p>
      </div>

      <Tabs defaultValue="infographics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="infographics">Infographics</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="explainers">Explainers</TabsTrigger>
        </TabsList>

        {/* Infographics Tab */}
        <TabsContent value="infographics" className="space-y-4">
          <div className="space-y-3">
            {infographics.map((item) => (
              <ResourceCard
                key={item.id}
                title={item.title}
                description={item.description}
                downloadUrl={item.resourceUrl}
              />
            ))}
            {infographics.length === 0 && (
              <p className="text-center text-muted-foreground py-6">No infographics available.</p>
            )}
          </div>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-4">
          <div className="space-y-3">
            {videos.map((video) => (
              <ResourceCard
                key={video.id}
                title={video.title}
                description={video.description}
                externalUrl={video.resourceUrl}
                type="link"
              />
            ))}
            {videos.length === 0 && (
              <p className="text-center text-muted-foreground py-6">No videos available.</p>
            )}
          </div>
        </TabsContent>

        {/* Explainers Tab */}
        <TabsContent value="explainers" className="space-y-4">
          <div className="space-y-3">
            {explainers.map((item) => (
              <ResourceCard
                key={item.id}
                title={item.title}
                description={item.description}
                downloadUrl={item.resourceUrl}
              />
            ))}
            {explainers.length === 0 && (
              <p className="text-center text-muted-foreground py-6">No explainers available.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Election2026VoterEducation;
