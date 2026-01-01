import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, ArrowLeft, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import vanderLandeLogo from "@/assets/vanderlande-logo.png";

const STORAGE_KEY = "vandeland_voter_name";

// Generate a unique device ID
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem("vandeland_device_id");
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("vandeland_device_id", deviceId);
  }
  return deviceId;
};

const Introduction = () => {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user already registered
    const savedName = localStorage.getItem(STORAGE_KEY);
    if (savedName) {
      navigate("/categories");
    }
    // Initialize device ID
    getDeviceId();
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
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
    
    // Save name and device ID
    localStorage.setItem(STORAGE_KEY, name.trim());
    
    toast({
      title: "أهلاً بك!",
      description: `مرحباً ${name.trim()}، يمكنك الآن التصويت`,
    });

    setTimeout(() => {
      navigate("/categories");
    }, 500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center" dir="rtl">
      {/* Diamond Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Corner Diamonds */}
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
          className="absolute -top-10 -left-10 w-60 h-60 border-2 border-primary/20 rotate-45"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="absolute -top-20 -right-20 w-80 h-80 border-4 border-primary/30 rotate-45"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute -top-10 -right-10 w-60 h-60 border-2 border-primary/20 rotate-45"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="absolute -bottom-20 -left-20 w-80 h-80 border-4 border-primary/30 rotate-45"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="absolute -bottom-20 -right-20 w-80 h-80 border-4 border-primary/30 rotate-45"
        />

        {/* Floating sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/60 rotate-45"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-lg mx-4"
      >
        <div className="glass-card p-8 md:p-12">
          {/* Logo */}
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

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold gold-text mb-2">
              ترشيحات فاندلاند 2025
            </h1>
            <p className="text-muted-foreground">
              أدخل اسمك للمشاركة في التصويت
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <Input
                type="text"
                placeholder="أدخل اسمك..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pr-12 py-6 text-lg bg-muted/50 border-primary/30 focus:border-primary placeholder:text-muted-foreground/50"
                maxLength={30}
                autoFocus
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                type="submit"
                disabled={isSubmitting || name.trim().length < 2}
                className="w-full btn-vote text-lg py-6 gap-3"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
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

          {/* Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-sm text-muted-foreground mt-6"
          >
            يمكنك التصويت مرة واحدة فقط لكل فئة من هذا الجهاز
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default Introduction;
