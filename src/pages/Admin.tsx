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

const Admin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [votes, setVotes] = useState<VoteType[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [voteCounts, setVoteCounts] = useState<Record<string, Record<string, number>>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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

      // Load data
      const [votesData, votersData, countsData] = await Promise.all([
        getAllVotes(),
        getAllVoters(),
        getVoteCounts(),
      ]);

      setVotes(votesData);
      setVoters(votersData);
      setVoteCounts(countsData);
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
          const [votesData, countsData] = await Promise.all([
            getAllVotes(),
            getVoteCounts(),
          ]);
          setVotes(votesData);
          setVoteCounts(countsData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/auth");
  };

  const getCategoryData = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return [];

    return category.nominees.map((nominee) => ({
      name: nominee.name,
      votes: voteCounts[categoryId]?.[nominee.id] || 0,
    })).sort((a, b) => b.votes - a.votes);
  };

  const getTotalVotes = () => votes.length;
  const getCompletedVoters = () => voters.filter((v) => v.completed_at).length;
  const getActiveVoters = () => voters.filter((v) => !v.completed_at).length;

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
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <LogOut className="w-4 h-4" />
            خروج
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {totalCategoryVotes} صوت
                    </p>
                  </div>
                  {winner && winner.votes > 0 && (
                    <div className="flex items-center gap-2 text-primary">
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
      </main>
    </div>
  );
};

export default Admin;
