import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, ArrowLeft, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { registerVoter, getCurrentVoter } from "@/services/voteService";
import vanderLandeLogo from "@/assets/vanderlande-logo.png";

const Introduction = () => {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkExistingVoter = async () => {
      const voter = await getCurrentVoter();
      if (voter) {
        if (voter.completed_at) {
          navigate("/complete");
        } else {
          navigate("/vote");
        }
      }
    };
    checkExistingVoter();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim().length < 2) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم صالح (حرفين على الأقل)",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const voter = await registerVoter(name.trim());
    
    if (voter) {
      toast({
        title: "أهلاً بك!",
        description: `مرحباً ${name.trim()}، يمكنك الآن التصويت`,
      });
      navigate("/vote");
    } else {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء التسجيل",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center" dir="rtl">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: i * 0.2 }}
            className={`absolute w-80 h-80 border-4 border-primary/30 rotate-45 ${
              i === 0 ? "-top-20 -left-20" : i === 1 ? "-top-20 -right-20" : i === 2 ? "-bottom-20 -left-20" : "-bottom-20 -right-20"
            }`}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-lg mx-4"
      >
        <div className="glass-card p-8 md:p-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 1 }}
            className="flex justify-center mb-8"
          >
            <motion.img
              src={vanderLandeLogo}
              alt="Vanderlande Logo"
              className="w-48 md:w-64 h-auto"
              animate={{
                filter: [
                  "drop-shadow(0 0 10px hsl(43, 74%, 49%))",
                  "drop-shadow(0 0 30px hsl(43, 74%, 49%))",
                  "drop-shadow(0 0 10px hsl(43, 74%, 49%))",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold gold-text mb-2">ترشيحات فاندلاند 2025</h1>
            <p className="text-muted-foreground">أدخل اسمك للمشاركة في التصويت</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <Input
                type="text"
                placeholder="أدخل اسمك..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pr-12 py-6 text-lg bg-muted/50 border-primary/30 focus:border-primary"
                maxLength={30}
                autoFocus
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Button type="submit" disabled={isSubmitting || name.trim().length < 2} className="w-full btn-vote text-lg py-6 gap-3">
                {isSubmitting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>
                    <span>ابدأ التصويت</span>
                    <ArrowLeft className="w-5 h-5" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-center text-sm text-muted-foreground mt-6">
            التصويت إجباري لجميع الفئات
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default Introduction;
