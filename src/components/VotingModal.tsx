import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Vote, Loader2, Check } from "lucide-react";
import { Category, Nominee } from "@/data/categories";
import { submitVote, saveVoteLocally, hasVotedInCategory, getLocalVotes } from "@/services/voteService";
import { toast } from "@/hooks/use-toast";

interface VotingModalProps {
  category: Category;
  onClose: () => void;
}

const VotingModal = ({ category, onClose }: VotingModalProps) => {
  const [selectedNominee, setSelectedNominee] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(hasVotedInCategory(category.id));
  const localVotes = getLocalVotes();
  const previousVote = localVotes[category.id];

  const IconComponent = category.icon;

  const handleVote = async (nominee: Nominee) => {
    if (isSubmitting || hasVoted) return;

    setSelectedNominee(nominee.id);
    setIsSubmitting(true);

    // Get voter name
    const voterName = localStorage.getItem("vandeland_voter_name") || "مجهول";
    const deviceId = localStorage.getItem("vandeland_device_id") || "unknown";

    const result = await submitVote(category.title, nominee.name, voterName, deviceId);

    if (result.success) {
      saveVoteLocally(category.id, nominee.id);
      setHasVoted(true);
      toast({
        title: "🎉 شكراً لتصويتك!",
        description: `صوّت لـ ${nominee.name} في فئة ${category.title}`,
      });
    } else {
      toast({
        title: "خطأ",
        description: result.message,
        variant: "destructive",
      });
      setSelectedNominee(null);
    }

    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 border-b border-primary/20">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </motion.button>

            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 flex items-center justify-center"
              >
                <IconComponent className="w-10 h-10 text-primary" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold gold-text">
                {category.title}
              </h2>
              <p className="text-muted-foreground mt-2">
                {hasVoted ? "لقد صوّت بالفعل في هذه الفئة" : "اختر المرشح المفضل لديك"}
              </p>
            </div>
          </div>

          {/* Nominees Grid */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {category.nominees.map((nominee, index) => {
                const isSelected = selectedNominee === nominee.id || previousVote === nominee.id;
                const isDisabled = hasVoted && previousVote !== nominee.id;

                return (
                  <motion.div
                    key={nominee.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={!isDisabled ? { scale: 1.05 } : {}}
                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                    onClick={() => !isDisabled && !hasVoted && handleVote(nominee)}
                    className={`nominee-card relative cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? "border-primary glow-gold"
                        : isDisabled
                        ? "opacity-40 cursor-not-allowed"
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

                    {/* Diamond avatar placeholder */}
                    <motion.div
                      className="w-16 h-16 mx-auto mb-4 rotate-45 bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 flex items-center justify-center"
                      animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 1, repeat: isSelected ? Infinity : 0 }}
                    >
                      <span className="-rotate-45 text-xl font-bold text-primary">
                        {nominee.name.charAt(0)}
                      </span>
                    </motion.div>

                    <h4 className="text-lg font-bold text-foreground mb-4">
                      {nominee.name}
                    </h4>

                    {!hasVoted ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isSubmitting}
                        className="btn-vote w-full flex items-center justify-center gap-2"
                      >
                        {isSubmitting && selectedNominee === nominee.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Vote className="w-5 h-5" />
                            <span>صوّت</span>
                          </>
                        )}
                      </motion.button>
                    ) : isSelected ? (
                      <div className="flex items-center justify-center gap-2 text-primary font-bold">
                        <Check className="w-5 h-5" />
                        <span>اختيارك</span>
                      </div>
                    ) : null}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VotingModal;
