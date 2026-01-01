import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Vote, Loader2, Check, ChevronLeft, Trophy } from "lucide-react";
import { categories, Category, Nominee } from "@/data/categories";
import { 
  getCurrentVoter, 
  submitVote, 
  updateVoterProgress,
  Voter 
} from "@/services/voteService";
import { toast } from "@/hooks/use-toast";
import vanderLandeLogo from "@/assets/vanderlande-logo.png";
import { Button } from "@/components/ui/button";

const VotingFlow = () => {
  const [voter, setVoter] = useState<Voter | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [selectedNominee, setSelectedNominee] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const currentCategory: Category | undefined = categories[currentIndex];

  useEffect(() => {
    const loadVoter = async () => {
      const voterData = await getCurrentVoter();
      if (!voterData) {
        navigate("/");
        return;
      }
      setVoter(voterData);
      setCurrentIndex(voterData.current_category_index);
      
      // If already completed, go to completion page
      if (voterData.completed_at) {
        navigate("/complete");
        return;
      }
      
      setIsLoading(false);
    };
    loadVoter();
  }, [navigate]);

  const handleVote = async (nominee: Nominee) => {
    if (!voter || isSubmitting) return;

    setSelectedNominee(nominee.id);
    setIsSubmitting(true);

    const result = await submitVote(voter.id, currentCategory.id, nominee.id);

    if (result.success) {
      toast({
        title: "🎉 تم التصويت!",
        description: `صوّت لـ ${nominee.name}`,
      });

      // Wait a moment then proceed to next category
      setTimeout(async () => {
        const nextIndex = currentIndex + 1;
        const isCompleted = nextIndex >= categories.length;
        
        await updateVoterProgress(voter.id, nextIndex, isCompleted);
        
        if (isCompleted) {
          navigate("/complete");
        } else {
          setCurrentIndex(nextIndex);
          setSelectedNominee(null);
          setShowIntro(true);
          setIsSubmitting(false);
        }
      }, 1500);
    } else {
      toast({
        title: "خطأ",
        description: result.message,
        variant: "destructive",
      });
      setSelectedNominee(null);
      setIsSubmitting(false);
    }
  };

  const handleStartVoting = () => {
    setShowIntro(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!currentCategory) {
    navigate("/complete");
    return null;
  }

  const IconComponent = currentCategory.icon;
  const progress = ((currentIndex) / categories.length) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden" dir="rtl">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 border-4 border-primary/20 rotate-45" />
        <div className="absolute -top-20 -right-20 w-80 h-80 border-4 border-primary/20 rotate-45" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 border-4 border-primary/20 rotate-45" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 border-4 border-primary/20 rotate-45" />
      </div>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-2 bg-muted">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-gold-light"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Progress indicator */}
      <div className="fixed top-4 left-4 z-50 glass-card px-4 py-2">
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {categories.length}
        </span>
      </div>

      <div className="container mx-auto px-4 py-8 pt-16 relative z-10">
        <AnimatePresence mode="wait">
          {showIntro ? (
            <motion.div
              key={`intro-${currentCategory.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="min-h-[80vh] flex items-center justify-center"
            >
              <div className="text-center max-w-lg mx-auto">
                {/* Logo */}
                <motion.img
                  src={vanderLandeLogo}
                  alt="Logo"
                  className="w-32 h-auto mx-auto mb-8 opacity-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                />

                {/* Category icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 1, delay: 0.2 }}
                  className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/50 flex items-center justify-center glow-gold-lg"
                >
                  <IconComponent className="w-16 h-16 text-primary" />
                </motion.div>

                {/* Category number */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground mb-2"
                >
                  الفئة {currentIndex + 1} من {categories.length}
                </motion.div>

                {/* Category title */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-4xl md:text-5xl font-bold gold-text mb-4"
                >
                  {currentCategory.title}
                </motion.h1>

                {/* Nominees count */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-muted-foreground mb-8"
                >
                  {currentCategory.nominees.length} مرشحين في هذه الفئة
                </motion.p>

                {/* Decorative line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6 }}
                  className="decorative-line max-w-xs mx-auto mb-8"
                />

                {/* Start voting button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    onClick={handleStartVoting}
                    className="btn-vote text-lg px-12 py-6 gap-3"
                  >
                    <span>ابدأ التصويت</span>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`voting-${currentCategory.id}`}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 flex items-center justify-center"
                >
                  <IconComponent className="w-10 h-10 text-primary" />
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-bold gold-text mb-2">
                  {currentCategory.title}
                </h2>
                <p className="text-muted-foreground">اختر المرشح المفضل لديك</p>
              </div>

              {/* Nominees Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                {currentCategory.nominees.map((nominee, index) => {
                  const isSelected = selectedNominee === nominee.id;

                  return (
                    <motion.div
                      key={nominee.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                      whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                      onClick={() => !isSubmitting && handleVote(nominee)}
                      className={`nominee-card relative cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? "border-primary glow-gold"
                          : isSubmitting
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:border-primary/50"
                      }`}
                    >
                      {/* Selection indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
                        >
                          <Check className="w-5 h-5 text-primary-foreground" />
                        </motion.div>
                      )}

                      {/* Avatar circle */}
                      <motion.div
                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/40 flex items-center justify-center"
                        animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 1, repeat: isSelected ? Infinity : 0 }}
                      >
                        <span className="text-xl font-bold text-primary">
                          {nominee.name.charAt(0)}
                        </span>
                      </motion.div>

                      <h4 className="text-base font-bold text-foreground mb-4 leading-tight break-words px-2">
                        {nominee.name}
                      </h4>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-vote w-full flex items-center justify-center gap-2"
                      >
                        {isSubmitting && isSelected ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Vote className="w-5 h-5" />
                            <span>صوّت</span>
                          </>
                        )}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VotingFlow;
