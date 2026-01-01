import { motion } from "framer-motion";
import { Trophy, PartyPopper, Sparkles, Star } from "lucide-react";
import vanderLandeLogo from "@/assets/vanderlande-logo.png";
import { getVoterName } from "@/services/voteService";
import Confetti from "@/components/Confetti";

const Complete = () => {
  const voterName = getVoterName();

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center" dir="rtl">
      <Confetti />
      
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="absolute -top-20 -left-20 w-80 h-80 border-4 border-primary/30 rotate-45"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute -top-20 -right-20 w-80 h-80 border-4 border-primary/30 rotate-45"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute -bottom-20 -left-20 w-80 h-80 border-4 border-primary/30 rotate-45"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute -bottom-20 -right-20 w-80 h-80 border-4 border-primary/30 rotate-45"
        />

        {/* Floating stars */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: `${10 + Math.random() * 80}%`,
              left: `${5 + Math.random() * 90}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            <Star className="w-4 h-4 text-primary fill-primary" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative z-10 text-center px-4 max-w-2xl mx-auto"
      >
        {/* Logo */}
        <motion.img
          src={vanderLandeLogo}
          alt="Logo"
          className="w-40 h-auto mx-auto mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.3 }}
        />

        {/* Trophy icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1, delay: 0.5 }}
          className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border-4 border-primary flex items-center justify-center glow-gold-lg"
        >
          <Trophy className="w-16 h-16 text-primary" />
        </motion.div>

        {/* Success message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <PartyPopper className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold gold-text">
              شكراً لك!
            </h1>
            <PartyPopper className="w-8 h-8 text-primary transform scale-x-[-1]" />
          </div>

          {voterName && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-xl text-primary mb-4"
            >
              {voterName}
            </motion.p>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-lg text-muted-foreground mb-8"
          >
            لقد أتممت التصويت في جميع الفئات بنجاح
          </motion.p>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.2 }}
          className="decorative-line max-w-sm mx-auto mb-8"
        />

        {/* Additional message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="glass-card p-6 inline-block"
        >
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>سيتم الإعلان عن النتائج قريباً</span>
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
        </motion.div>

        {/* Footer decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="mt-12 flex items-center justify-center gap-4"
        >
          <div className="decorative-line flex-1 max-w-[100px]" />
          <motion.div
            className="w-4 h-4 rotate-45 border-2 border-primary"
            animate={{ rotate: [45, 135, 45] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <div className="decorative-line flex-1 max-w-[100px]" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Complete;
