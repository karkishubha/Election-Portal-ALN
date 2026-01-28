import { motion } from "framer-motion";
import { Play, Image, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const Election2026VoterEducation = () => {
  const infographics = [
    {
      id: 1,
      title: "How to Vote",
      description: "Step-by-step guide to the voting process",
      image: "📊"
    },
    {
      id: 2,
      title: "Electoral System Explained",
      description: "FPTP and PR system overview",
      image: "📋"
    }
  ];

  const videos = [
    {
      id: 1,
      title: "Introduction to Nepal's Electoral System",
      source: "Election Commission",
      duration: "5 min"
    },
    {
      id: 2,
      title: "Your Rights as a Voter",
      source: "Civic Education Foundation",
      duration: "4 min"
    }
  ];

  const explainers = [
    {
      id: 1,
      title: "Understanding Proportional Representation",
      description: "A comprehensive guide to how PR voting works in Nepal",
      source: "Election Commission"
    },
    {
      id: 2,
      title: "First-Past-The-Post: A Practical Guide",
      description: "Learn how FPTP elections work and why your vote matters",
      source: "Accountability Lab Nepal"
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
          <div className="grid md:grid-cols-2 gap-6">
            {infographics.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-lg overflow-hidden border hover:border-primary/50 transition-colors"
              >
                <div className="bg-primary/10 h-40 flex items-center justify-center text-6xl">
                  {item.image}
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Image className="w-4 h-4 mr-2" />
                    View Infographic
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-lg overflow-hidden border hover:border-primary/50 transition-colors"
              >
                <div className="bg-primary/20 h-40 flex items-center justify-center">
                  <button className="w-16 h-16 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
                    <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
                  </button>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-foreground mb-2">{video.title}</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{video.source}</span>
                    <span>{video.duration}</span>
                  </div>
                  <Button className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Video
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Explainers Tab */}
        <TabsContent value="explainers" className="space-y-4">
          {explainers.map((explainer) => (
            <motion.div
              key={explainer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-lg p-6 border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <BookOpen className="w-6 h-6 text-primary flex-shrink-0" />
                <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">
                  {explainer.source}
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{explainer.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{explainer.description}</p>
              <Button variant="outline" size="sm">
                Read Full Explainer
              </Button>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Election2026VoterEducation;
