import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Users,
  Vote,
  LogOut,
  Loader2,
  Trophy,
  TrendingUp,
  Clock,
  Download,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { categories } from "@/data/categories";
import {
  getAllVotes,
  getAllVoters,
  getVoteCounts,
  checkIsAdmin,
  Vote as VoteType,
  Voter,
} from "@/services/voteService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import vanderLandeLogo from "@/assets/vanderlande-logo.png";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import * as XLSX from "xlsx";

interface ExtendedVote extends VoteType {
  approved?: boolean | null;
}

const Admin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [votes, setVotes] = useState<ExtendedVote[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [voteCounts, setVoteCounts] = useState<Record<string, Record<string, number>>>({});
  const [activeTab, setActiveTab] = useState<"stats" | "votes">("stats");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/admin/auth");
        return;
      }

      const adminStatus = await checkIsAdmin(session.user.id);
      setIsAdmin(adminStatus);

      await loadData();
      setIsLoading(false);
    };

    checkAuth();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("votes-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        async () => {
          await loadData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "voters" },
        async () => {
          const votersData = await getAllVoters();
          setVoters(votersData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const loadData = async () => {
    const [votesData, votersData, countsData] = await Promise.all([
      getAllVotes(),
      getAllVoters(),
      getVoteCounts(),
    ]);

    setVotes(votesData as ExtendedVote[]);
    setVoters(votersData);
    setVoteCounts(countsData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/auth");
  };

  const getCategoryData = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return [];

    // Only count approved votes
    const approvedVotes = votes.filter(v => v.approved !== false);
    const categoryCounts: Record<string, number> = {};
    
    approvedVotes.forEach(vote => {
      if (vote.category_id === categoryId) {
        categoryCounts[vote.nominee_id] = (categoryCounts[vote.nominee_id] || 0) + 1;
      }
    });

    return category.nominees.map((nominee) => ({
      name: nominee.name,
      votes: categoryCounts[nominee.id] || 0,
    })).sort((a, b) => b.votes - a.votes);
  };

  const getTotalVotes = () => votes.filter(v => v.approved !== false).length;
  const getCompletedVoters = () => voters.filter((v) => v.completed_at).length;
  const getActiveVoters = () => voters.filter((v) => !v.completed_at).length;

  const handleApproveVote = async (voteId: string, approved: boolean) => {
    const { error } = await supabase
      .from("votes")
      .update({ approved } as any)
      .eq("id", voteId);

    if (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الصوت",
        variant: "destructive",
      });
    } else {
      toast({
        title: approved ? "تم القبول" : "تم الرفض",
        description: approved ? "تم قبول الصوت بنجاح" : "تم رفض الصوت",
      });
      await loadData();
    }
  };

  const downloadResults = () => {
    // Prepare data for Excel
    const resultsData: any[] = [];
    
    categories.forEach(category => {
      const categoryData = getCategoryData(category.id);
      categoryData.forEach((nominee, index) => {
        resultsData.push({
          "الفئة": category.title,
          "المرشح": nominee.name,
          "الأصوات": nominee.votes,
          "الترتيب": index + 1,
        });
      });
    });

    // Create voters sheet
    const votersData = voters.map(voter => ({
      "الاسم": voter.name,
      "التقدم": `${voter.current_category_index}/${categories.length}`,
      "الحالة": voter.completed_at ? "مكتمل" : "جاري",
      "تاريخ التسجيل": new Date(voter.created_at).toLocaleDateString("ar-SA"),
    }));

    // Create detailed votes sheet
    const votesData = votes.map(vote => {
      const category = categories.find(c => c.id === vote.category_id);
      const nominee = category?.nominees.find(n => n.id === vote.nominee_id);
      const voter = voters.find(v => v.id === vote.voter_id);
      
      return {
        "المصوت": voter?.name || "غير معروف",
        "الفئة": category?.title || vote.category_id,
        "المرشح": nominee?.name || vote.nominee_id,
        "الحالة": vote.approved === true ? "مقبول" : vote.approved === false ? "مرفوض" : "معلق",
        "التاريخ": new Date(vote.created_at).toLocaleDateString("ar-SA"),
      };
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    const ws1 = XLSX.utils.json_to_sheet(resultsData);
    XLSX.utils.book_append_sheet(wb, ws1, "النتائج");
    
    const ws2 = XLSX.utils.json_to_sheet(votersData);
    XLSX.utils.book_append_sheet(wb, ws2, "المصوتين");
    
    const ws3 = XLSX.utils.json_to_sheet(votesData);
    XLSX.utils.book_append_sheet(wb, ws3, "تفاصيل الأصوات");

    // Download
    XLSX.writeFile(wb, `نتائج_التصويت_فاندلاند_2025.xlsx`);
    
    toast({
      title: "تم التحميل",
      description: "تم تحميل ملف النتائج بنجاح",
    });
  };

  const getVoterName = (voterId: string) => {
    const voter = voters.find(v => v.id === voterId);
    return voter?.name || "غير معروف";
  };

  const getCategoryTitle = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.title || categoryId;
  };

  const getNomineeName = (categoryId: string, nomineeId: string) => {
    const category = categories.find(c => c.id === categoryId);
    const nominee = category?.nominees.find(n => n.id === nomineeId);
    return nominee?.name || nomineeId;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="glass-card p-8 text-center max-w-md">
          <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold gold-text mb-4">غير مصرح</h1>
          <p className="text-muted-foreground mb-6">
            ليس لديك صلاحية للوصول إلى لوحة الإدارة
          </p>
          <Button onClick={handleLogout} variant="outline">
            تسجيل الخروج
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <header className="glass-card rounded-none border-x-0 border-t-0 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={vanderLandeLogo} alt="Logo" className="w-24 h-auto" />
            <div>
              <h1 className="text-xl font-bold gold-text">لوحة الإدارة</h1>
              <p className="text-sm text-muted-foreground">إحصائيات التصويت</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={downloadResults} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              تحميل النتائج
            </Button>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="w-4 h-4" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={activeTab === "stats" ? "default" : "outline"}
            onClick={() => setActiveTab("stats")}
            className="gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            الإحصائيات
          </Button>
          <Button
            variant={activeTab === "votes" ? "default" : "outline"}
            onClick={() => setActiveTab("votes")}
            className="gap-2"
          >
            <Vote className="w-4 h-4" />
            إدارة الأصوات
          </Button>
        </div>

        {activeTab === "stats" ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Vote className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">إجمالي الأصوات</p>
                    <p className="text-3xl font-bold gold-text">{getTotalVotes()}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Users className="w-7 h-7 text-green-500" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">أتموا التصويت</p>
                    <p className="text-3xl font-bold text-green-500">{getCompletedVoters()}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Clock className="w-7 h-7 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">لم يكملوا بعد</p>
                    <p className="text-3xl font-bold text-orange-500">{getActiveVoters()}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {categories.map((category, index) => {
                const data = getCategoryData(category.id);
                const totalCategoryVotes = data.reduce((sum, d) => sum + d.votes, 0);
                const winner = data[0];
                const IconComponent = category.icon;

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card p-6"
                  >
                    {/* Category Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{category.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {totalCategoryVotes} صوت
                        </p>
                      </div>
                      {winner && winner.votes > 0 && (
                        <div className="flex items-center gap-2 text-primary shrink-0">
                          <Trophy className="w-5 h-5" />
                          <span className="font-bold">{winner.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Chart */}
                    {data.length > 0 && totalCategoryVotes > 0 ? (
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                            <YAxis
                              dataKey="name"
                              type="category"
                              width={80}
                              stroke="hsl(var(--muted-foreground))"
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                              }}
                            />
                            <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
                              {data.map((entry, i) => (
                                <Cell
                                  key={i}
                                  fill={i === 0 ? "hsl(43, 74%, 49%)" : "hsl(var(--muted))"}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-48 flex items-center justify-center text-muted-foreground">
                        لا توجد أصوات بعد
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Recent Voters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6 mt-8"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                آخر المصوتين
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/20">
                      <th className="text-right py-3 px-4 text-muted-foreground">الاسم</th>
                      <th className="text-right py-3 px-4 text-muted-foreground">التقدم</th>
                      <th className="text-right py-3 px-4 text-muted-foreground">الحالة</th>
                      <th className="text-right py-3 px-4 text-muted-foreground">التسجيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {voters.slice(0, 20).map((voter) => (
                      <tr key={voter.id} className="border-b border-primary/10">
                        <td className="py-3 px-4 font-medium">{voter.name}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{
                                  width: `${(voter.current_category_index / categories.length) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {voter.current_category_index}/{categories.length}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {voter.completed_at ? (
                            <span className="inline-flex items-center gap-1 text-green-500 text-sm">
                              <TrendingUp className="w-4 h-4" />
                              مكتمل
                            </span>
                          ) : (
                            <span className="text-orange-500 text-sm">جاري</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">
                          {new Date(voter.created_at).toLocaleDateString("ar-SA")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        ) : (
          /* Votes Management Tab */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Vote className="w-5 h-5 text-primary" />
              إدارة الأصوات
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/20">
                    <th className="text-right py-3 px-4 text-muted-foreground">المصوت</th>
                    <th className="text-right py-3 px-4 text-muted-foreground">الفئة</th>
                    <th className="text-right py-3 px-4 text-muted-foreground">المرشح</th>
                    <th className="text-right py-3 px-4 text-muted-foreground">الحالة</th>
                    <th className="text-right py-3 px-4 text-muted-foreground">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {votes.map((vote) => (
                    <tr key={vote.id} className="border-b border-primary/10">
                      <td className="py-3 px-4 font-medium">{getVoterName(vote.voter_id)}</td>
                      <td className="py-3 px-4 text-sm">{getCategoryTitle(vote.category_id)}</td>
                      <td className="py-3 px-4">{getNomineeName(vote.category_id, vote.nominee_id)}</td>
                      <td className="py-3 px-4">
                        {vote.approved === true ? (
                          <span className="inline-flex items-center gap-1 text-green-500 text-sm">
                            <Check className="w-4 h-4" />
                            مقبول
                          </span>
                        ) : vote.approved === false ? (
                          <span className="inline-flex items-center gap-1 text-red-500 text-sm">
                            <X className="w-4 h-4" />
                            مرفوض
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-yellow-500 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            معلق
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={vote.approved === true ? "default" : "outline"}
                            className="h-8 w-8 p-0"
                            onClick={() => handleApproveVote(vote.id, true)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={vote.approved === false ? "destructive" : "outline"}
                            className="h-8 w-8 p-0"
                            onClick={() => handleApproveVote(vote.id, false)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Admin;