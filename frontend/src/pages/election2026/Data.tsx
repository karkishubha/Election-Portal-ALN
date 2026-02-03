import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, MapPin, Award, Vote, TrendingUp, Accessibility, Building2, Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCandidatesData, useAggregatedStats } from "@/hooks/useCandidates";

// ============ PR STATIC DATA (from user-provided statistics) ============
const PR_DATA = {
  total: 3213,
  male: 1396,
  female: 1817,
  parties: 62,
  districts: 77,
  byGender: { "पुरुष": 1396, "महिला": 1817 },
  byProvince: [
    { name: "कोशी", candidates: 637, share: 19.8, nameEn: "Koshi" },
    { name: "मधेश", candidates: 780, share: 24.3, nameEn: "Madhesh" },
    { name: "बागमती", candidates: 718, share: 22.3, nameEn: "Bagmati" },
    { name: "गण्डकी", candidates: 228, share: 7.1, nameEn: "Gandaki" },
    { name: "लुम्बिनी", candidates: 463, share: 14.4, nameEn: "Lumbini" },
    { name: "कर्णाली", candidates: 173, share: 5.4, nameEn: "Karnali" },
    { name: "सुदूरपश्चिम", candidates: 214, share: 6.7, nameEn: "Sudurpashchim" },
  ],
  byInclusiveGroup: [
    { name: "खस आर्य", candidates: 959, percentage: 29.8, femalePercent: 55.2, color: "#E53E3E" },
    { name: "आदिवासी जनजाति", candidates: 929, percentage: 28.9, femalePercent: 55.3, color: "#3182CE" },
    { name: "मधेसी", candidates: 526, percentage: 16.4, femalePercent: 53.6, color: "#D69E2E" },
    { name: "दलित", candidates: 433, percentage: 13.5, femalePercent: 58.0, color: "#38A169" },
    { name: "थारु", candidates: 211, percentage: 6.6, femalePercent: 64.5, color: "#805AD5" },
    { name: "मुस्लिम", candidates: 155, percentage: 4.8, femalePercent: 67.7, color: "#DD6B20" },
  ],
  topDistricts: [
    { name: "काठमाण्डौ", candidates: 232 },
    { name: "मोरङ", candidates: 137 },
    { name: "झापा", candidates: 125 },
    { name: "सिरहा", candidates: 110 },
    { name: "सुनसरी", candidates: 110 },
  ],
  specialCategories: {
    backwardArea: 140,
    disability: 85,
  },
};

// Electoral system constants (fixed - verified)
const ELECTORAL_SYSTEM = {
  fptpSeats: 165,
  prSeats: 110,
  totalSeats: 275,
};

// ============ Chart Colors ============
const COLORS = {
  male: "hsl(215, 55%, 45%)",
  female: "hsl(350, 55%, 55%)",
  province: ["#E53E3E", "#3182CE", "#D69E2E", "#38A169", "#805AD5", "#DD6B20", "#319795"],
};

// Province name mapping for FPTP API data
const PROVINCE_ORDER = ["कोशी प्रदेश", "मधेश प्रदेश", "बागमती प्रदेश", "गण्डकी प्रदेश", "लुम्बिनी प्रदेश", "कर्णाली प्रदेश", "सुदूरपश्चिम प्रदेश"];
const PROVINCE_SHORT_NAMES: Record<string, string> = {
  "कोशी प्रदेश": "कोशी",
  "मधेश प्रदेश": "मधेश",
  "बागमती प्रदेश": "बागमती",
  "गण्डकी प्रदेश": "गण्डकी",
  "लुम्बिनी प्रदेश": "लुम्बिनी",
  "कर्णाली प्रदेश": "कर्णाली",
  "सुदूरपश्चिम प्रदेश": "सुदूरपश्चिम",
};

const Election2026Data = () => {
  const [activeDataTab, setActiveDataTab] = useState<"fptp" | "pr">("fptp");
  
  // Fetch FPTP data from API (with caching)
  const { candidates: fptpCandidates, isLoading: fptpLoading, error: fptpError } = useCandidatesData();
  const fptpStats = useAggregatedStats(fptpCandidates);

  // Process FPTP data for charts
  const fptpProcessed = useMemo(() => {
    if (fptpCandidates.length === 0) return null;

    const male = fptpStats.byGender["पुरुष"] || 0;
    const female = fptpStats.byGender["महिला"] || 0;
    const total = fptpCandidates.length;
    const partiesCount = Object.keys(fptpStats.byParty).length;
    const districtsCount = Object.keys(fptpStats.byDistrict).length;

    // Province data sorted
    const byProvince = PROVINCE_ORDER.map((prov) => ({
      name: PROVINCE_SHORT_NAMES[prov] || prov,
      fullName: prov,
      candidates: fptpStats.byProvince[prov] || 0,
    })).filter(p => p.candidates > 0);

    // Top parties sorted by count
    const topParties = Object.entries(fptpStats.byParty)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count], i) => ({
        name: name.length > 20 ? name.substring(0, 20) + "..." : name,
        fullName: name,
        candidates: count,
        color: COLORS.province[i % COLORS.province.length],
      }));

    // Top districts
    const topDistricts = Object.entries(fptpStats.byDistrict)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, candidates: count }));

    return {
      total,
      male,
      female,
      partiesCount,
      districtsCount,
      byProvince,
      topParties,
      topDistricts,
      byGender: { "पुरुष": male, "महिला": female },
      byQualification: fptpStats.byQualification,
      byAgeGroup: fptpStats.byAgeGroup,
    };
  }, [fptpCandidates, fptpStats]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="bg-muted/50 rounded-lg p-6 border">
        <h2 className="text-2xl font-bold text-foreground mb-2">निर्वाचन २०८२ तथ्याङ्क</h2>
        <p className="text-muted-foreground">
          यस खण्डमा २०८२ को निर्वाचनसँग सम्बन्धित तथ्याङ्कहरू प्रस्तुत गरिएको छ।
          प्रत्यक्ष निर्वाचन (FPTP) र समानुपातिक प्रतिनिधित्व (PR) को डाटा छुट्टाछुट्टै हेर्नुहोस्।
        </p>
      </div>

      {/* Electoral System Overview - Always visible */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto">
        <StatCard 
          icon={Building2} 
          label="कुल सिट" 
          value={ELECTORAL_SYSTEM.totalSeats.toString()}
          sublabel="संघीय संसद"
        />
        <StatCard 
          icon={Vote} 
          label="FPTP सिट" 
          value={ELECTORAL_SYSTEM.fptpSeats.toString()}
          sublabel="प्रत्यक्ष निर्वाचन"
          highlight="blue"
        />
        <StatCard 
          icon={Vote} 
          label="PR सिट" 
          value={ELECTORAL_SYSTEM.prSeats.toString()}
          sublabel="समानुपातिक"
          highlight="green"
        />
      </div>

      {/* Data Tabs: FPTP / PR */}
      <Tabs value={activeDataTab} onValueChange={(v) => setActiveDataTab(v as typeof activeDataTab)} className="space-y-6">
        <TabsList className="grid w-full max-w-sm mx-auto grid-cols-2">
          <TabsTrigger value="fptp" className="flex items-center gap-2">
            FPTP उम्मेदवार
            {fptpLoading && <Loader2 className="w-3 h-3 animate-spin" />}
          </TabsTrigger>
          <TabsTrigger value="pr">PR उम्मेदवार</TabsTrigger>
        </TabsList>

        {/* FPTP Tab - Data from API */}
        <TabsContent value="fptp" className="space-y-6">
          {fptpLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">FPTP उम्मेदवार डाटा लोड हुँदैछ...</p>
            </div>
          ) : fptpError ? (
            <div className="text-center py-12">
              <p className="text-red-500">डाटा लोड गर्न सकिएन: {fptpError.message}</p>
            </div>
          ) : fptpProcessed ? (
            <>
              {/* FPTP Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
                <StatCard icon={Users} label="कुल उम्मेदवार" value={fptpProcessed.total.toLocaleString()} sublabel="FPTP Candidates" />
                <StatCard icon={Users} label="पुरुष" value={fptpProcessed.male.toLocaleString()} sublabel={`${((fptpProcessed.male / fptpProcessed.total) * 100).toFixed(1)}%`} highlight="blue" />
                <StatCard icon={Users} label="महिला" value={fptpProcessed.female.toLocaleString()} sublabel={`${((fptpProcessed.female / fptpProcessed.total) * 100).toFixed(1)}%`} highlight="pink" />
                <StatCard icon={Award} label="राजनीतिक दल" value={fptpProcessed.partiesCount.toString()} sublabel="Parties" />
                <StatCard icon={MapPin} label="जिल्ला" value={fptpProcessed.districtsCount.toString()} sublabel="Districts" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Gender Distribution */}
                <div className="bg-card rounded-xl border p-4 sm:p-6">
                  <h3 className="font-bold text-base sm:text-lg mb-1">लिङ्ग वितरण</h3>
                  <p className="text-xs text-muted-foreground mb-3 sm:mb-4">FPTP Gender Distribution</p>
                  <div className="h-48 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "पुरुष", value: fptpProcessed.male },
                            { name: "महिला", value: fptpProcessed.female },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                          labelLine={false}
                        >
                          <Cell fill={COLORS.male} />
                          <Cell fill={COLORS.female} />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Parties */}
                <div className="bg-card rounded-xl border p-4 sm:p-6">
                  <h3 className="font-bold text-base sm:text-lg mb-1">प्रमुख दलहरू</h3>
                  <p className="text-xs text-muted-foreground mb-3 sm:mb-4">Top Parties by Candidates</p>
                  <div className="h-48 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={fptpProcessed.topParties}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={95} />
                        <Tooltip 
                          formatter={(value: number, name: string, props: { payload: { fullName: string } }) => [value, props.payload.fullName]}
                        />
                        <Bar dataKey="candidates" radius={[0, 4, 4, 0]}>
                          {fptpProcessed.topParties.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Province Bar Chart */}
              <div className="bg-card rounded-xl border p-4 sm:p-6">
                <h3 className="font-bold text-base sm:text-lg mb-1">प्रदेश अनुसार उम्मेदवार</h3>
                <p className="text-xs text-muted-foreground mb-3 sm:mb-4">FPTP Candidates by Province</p>
                <div className="h-56 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fptpProcessed.byProvince} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value: number, name: string, props: { payload: { fullName: string } }) => [value, props.payload.fullName]}
                      />
                      <Bar dataKey="candidates" radius={[4, 4, 0, 0]}>
                        {fptpProcessed.byProvince.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS.province[index]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Qualification & Age Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Qualification */}
                <div className="bg-card rounded-xl border p-4 sm:p-6">
                  <h3 className="font-bold text-base sm:text-lg mb-1">शैक्षिक योग्यता</h3>
                  <p className="text-xs text-muted-foreground mb-3 sm:mb-4">Education Qualification</p>
                  <div className="h-48 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(fptpProcessed.byQualification).map(([name, value]) => ({ name, value }))}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={75} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3182CE" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Districts */}
                <div className="bg-card rounded-xl border p-4 sm:p-6">
                  <h3 className="font-bold text-base sm:text-lg mb-1">शीर्ष जिल्लाहरू</h3>
                  <p className="text-xs text-muted-foreground mb-3 sm:mb-4">Top 5 Districts by FPTP Candidates</p>
                  <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                    {fptpProcessed.topDistricts.map((district, index) => (
                      <div key={district.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="font-medium">{district.name}</span>
                        </div>
                        <span className="text-muted-foreground">{district.candidates}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </TabsContent>

        {/* PR Tab - Static Data */}
        <TabsContent value="pr" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
            <StatCard icon={Users} label="कुल उम्मेदवार" value={PR_DATA.total.toLocaleString()} sublabel="PR Candidates" />
            <StatCard icon={Users} label="पुरुष" value={PR_DATA.male.toLocaleString()} sublabel={`${((PR_DATA.male / PR_DATA.total) * 100).toFixed(1)}%`} highlight="blue" />
            <StatCard icon={Users} label="महिला" value={PR_DATA.female.toLocaleString()} sublabel={`${((PR_DATA.female / PR_DATA.total) * 100).toFixed(1)}% ✅`} highlight="pink" />
            <StatCard icon={Award} label="राजनीतिक दल" value={PR_DATA.parties.toString()} sublabel="Parties" />
            <StatCard icon={MapPin} label="जिल्ला" value={PR_DATA.districts.toString()} sublabel="Districts" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Gender Distribution */}
            <div className="bg-card rounded-xl border p-4 sm:p-6">
              <h3 className="font-bold text-base sm:text-lg mb-1">लिङ्ग वितरण</h3>
              <p className="text-xs text-muted-foreground mb-3 sm:mb-4">PR Gender Distribution - Women Dominate!</p>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "पुरुष", value: PR_DATA.male },
                        { name: "महिला", value: PR_DATA.female },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                      labelLine={false}
                    >
                      <Cell fill={COLORS.male} />
                      <Cell fill={COLORS.female} />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-sm text-green-600 font-medium mt-2">
                ✅ महिला बहुमत (56.6%) - संवैधानिक आवश्यकता पूरा
              </p>
            </div>

            {/* Inclusive Group Distribution */}
            <div className="bg-card rounded-xl border p-4 sm:p-6">
              <h3 className="font-bold text-base sm:text-lg mb-1">समावेशी समूह वितरण</h3>
              <p className="text-xs text-muted-foreground mb-3 sm:mb-4">Inclusive Group Distribution</p>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PR_DATA.byInclusiveGroup}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="candidates"
                      nameKey="name"
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      labelLine={false}
                    >
                      {PR_DATA.byInclusiveGroup.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value.toLocaleString(), "उम्मेदवार"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Female % by Inclusive Group */}
          <div className="bg-card rounded-xl border p-4 sm:p-6">
            <h3 className="font-bold text-base sm:text-lg mb-1">समूह अनुसार महिला प्रतिशत</h3>
            <p className="text-xs text-muted-foreground mb-3 sm:mb-4">Female Percentage by Inclusive Group</p>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[...PR_DATA.byInclusiveGroup].sort((a, b) => b.femalePercent - a.femalePercent)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={95} />
                  <Tooltip formatter={(value: number) => [`${value}%`, "महिला"]} />
                  <Bar dataKey="femalePercent" radius={[0, 4, 4, 0]}>
                    {[...PR_DATA.byInclusiveGroup].sort((a, b) => b.femalePercent - a.femalePercent).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              मुस्लिम समुदायमा सबैभन्दा बढी महिला सहभागिता (67.7%)
            </p>
          </div>

          {/* Province Distribution */}
          <div className="bg-card rounded-xl border p-4 sm:p-6">
            <h3 className="font-bold text-base sm:text-lg mb-1">प्रदेश अनुसार उम्मेदवार</h3>
            <p className="text-xs text-muted-foreground mb-3 sm:mb-4">PR Candidates by Province</p>
            <div className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PR_DATA.byProvince} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), "उम्मेदवार"]} />
                  <Bar dataKey="candidates" radius={[4, 4, 0, 0]}>
                    {PR_DATA.byProvince.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.province[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Districts & Special Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-card rounded-xl border p-4 sm:p-6">
              <h3 className="font-bold text-base sm:text-lg mb-1">शीर्ष जिल्लाहरू</h3>
              <p className="text-xs text-muted-foreground mb-3 sm:mb-4">Top 5 Districts by PR Candidates</p>
              <div className="space-y-2 sm:space-y-3">
                {PR_DATA.topDistricts.map((district, index) => (
                  <div key={district.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium">{district.name}</span>
                    </div>
                    <span className="text-muted-foreground">{district.candidates}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border p-4 sm:p-6">
              <h3 className="font-bold text-base sm:text-lg mb-1">विशेष श्रेणी</h3>
              <p className="text-xs text-muted-foreground mb-3 sm:mb-4">Special Categories</p>
              <div className="space-y-3 sm:space-y-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-amber-600" />
                      <span className="font-medium">पिछडा क्षेत्र</span>
                    </div>
                    <span className="text-xl font-bold">{PR_DATA.specialCategories.backwardArea}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">4.36% of total PR candidates</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Accessibility className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">अपाङ्गता</span>
                    </div>
                    <span className="text-xl font-bold">{PR_DATA.specialCategories.disability}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">2.65% - Area for improvement</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Takeaways for PR */}
          <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-xl border p-4 sm:p-6">
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              PR मुख्य निष्कर्षहरू
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-card/50 p-4 rounded-lg">
                <p className="text-sm">✅ महिला बहुमत (56.6%) - संवैधानिक आवश्यकता पूरा</p>
              </div>
              <div className="bg-card/50 p-4 rounded-lg">
                <p className="text-sm">🏛️ मधेश प्रदेशमा सबैभन्दा बढी उम्मेदवार (24.3%)</p>
              </div>
              <div className="bg-card/50 p-4 rounded-lg">
                <p className="text-sm">👥 मुस्लिम समुदायमा सबैभन्दा बढी महिला (67.7%)</p>
              </div>
              <div className="bg-card/50 p-4 rounded-lg">
                <p className="text-sm">📍 काठमाण्डौमा सबैभन्दा धेरै उम्मेदवार (232)</p>
              </div>
              <div className="bg-card/50 p-4 rounded-lg">
                <p className="text-sm">♿ अपाङ्गता प्रतिनिधित्व (2.65%) - सुधारको क्षेत्र</p>
              </div>
              <div className="bg-card/50 p-4 rounded-lg">
                <p className="text-sm">🎯 62 राजनीतिक दलबाट उम्मेदवारी</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sublabel?: string;
  highlight?: "blue" | "pink" | "green";
}

const StatCard = ({ icon: Icon, label, value, sublabel, highlight }: StatCardProps) => {
  const highlightColors = {
    blue: "border-blue-300 bg-blue-50 dark:bg-blue-950/30",
    pink: "border-pink-300 bg-pink-50 dark:bg-pink-950/30",
    green: "border-green-300 bg-green-50 dark:bg-green-950/30",
  };
  
  return (
    <div className={`bg-card rounded-lg p-4 border transition-colors ${highlight ? highlightColors[highlight] : "hover:border-primary/50"}`}>
      <Icon className="w-6 h-6 text-primary mb-2" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
    </div>
  );
};

export default Election2026Data;
