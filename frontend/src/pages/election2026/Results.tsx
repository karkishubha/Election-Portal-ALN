import { Trophy, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FPTPResults from "@/pages/election2026/FPTPResults";
import PRResults from "@/pages/election2026/PRResults";

const Results = () => {
  return (
    <div className="space-y-6">
      {/* Results Tabs */}
      <Tabs defaultValue="fptp" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fptp" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            FPTP Results
          </TabsTrigger>
          <TabsTrigger value="pr" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            PR Results
          </TabsTrigger>
        </TabsList>

        {/* FPTP Tab */}
        <TabsContent value="fptp" className="space-y-4 mt-4">
          <FPTPResults />
        </TabsContent>

        {/* PR Tab */}
        <TabsContent value="pr" className="mt-4">
          <PRResults />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Results;
