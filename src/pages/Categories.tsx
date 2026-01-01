import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { categories, Category } from "@/data/categories";
import CategoryCard from "@/components/CategoryCard";
import VotingModal from "@/components/VotingModal";
import { isUserRegistered, getVoterName } from "@/services/voteService";
import vanderLandeLogo from "@/assets/vanderlande-logo.png";

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const navigate = useNavigate();
  const voterName = getVoterName();

  useEffect(() => {
    // Redirect to intro if not registered
    if (!isUserRegistered()) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden" dir="rtl">
      {/* Diamond Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Corner decorations */}
        <div className="absolute -top-20 -left-20 w-80 h-80 border-4 border-primary/20 rotate-45" />
        <div className="absolute -top-10 -left-10 w-60 h-60 border-2 border-primary/10 rotate-45" />
        <div className="absolute -top-20 -right-20 w-80 h-80 border-4 border-primary/20 rotate-45" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 border-4 border-primary/20 rotate-45" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 border-4 border-primary/20 rotate-45" />
        
        {/* Floating sparkles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/40 rotate-45"
            style={{
              top: `${10 + Math.random() * 80}%`,
              left: `${5 + Math.random() * 90}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {/* Logo */}
          <motion.img
            src={vanderLandeLogo}
            alt="Vanderlande Logo"
            className="w-40 md:w-56 h-auto mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
          />
          
          {/* Welcome message */}
          {voterName && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-primary text-lg mb-4"
            >
              أهلاً بك، <span className="font-bold">{voterName}</span>
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="decorative-line flex-1 max-w-[100px]" />
              <div className="decorative-diamond" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                الفئات
              </h2>
              <div className="decorative-diamond" />
              <div className="decorative-line flex-1 max-w-[100px]" />
            </div>
            <p className="text-muted-foreground max-w-md mx-auto">
              اختر فئة للتصويت للمرشحين المفضلين لديك
            </p>
          </motion.div>
        </motion.header>

        {/* Categories Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto"
        >
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
              onClick={() => setSelectedCategory(category)}
            />
          ))}
        </motion.div>

        {/* Footer decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-16 flex items-center justify-center gap-4"
        >
          <div className="decorative-line flex-1 max-w-[150px]" />
          <motion.div
            className="w-4 h-4 rotate-45 border-2 border-primary"
            animate={{ rotate: [45, 135, 45] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <div className="decorative-line flex-1 max-w-[150px]" />
        </motion.div>
      </div>

      {/* Voting Modal */}
      {selectedCategory && (
        <VotingModal
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
};

export default Categories;
