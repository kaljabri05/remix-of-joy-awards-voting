import { motion } from "framer-motion";
import { Category } from "@/data/categories";
import { hasVotedInCategory } from "@/services/voteService";
import { Check } from "lucide-react";

interface CategoryCardProps {
  category: Category;
  index: number;
  onClick: () => void;
}

const CategoryCard = ({ category, index, onClick }: CategoryCardProps) => {
  const hasVoted = hasVotedInCategory(category.id);
  const IconComponent = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ scale: 1.03, y: -8 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="category-card group relative cursor-pointer"
    >
      {/* Diamond accent */}
      <motion.div
        className="absolute -top-2 -right-2 w-6 h-6 rotate-45 bg-gradient-to-br from-primary to-gold-light opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Voted indicator */}
      {hasVoted && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg"
        >
          <Check className="w-5 h-5 text-primary-foreground" />
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <motion.div
          className="w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30"
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <IconComponent className="w-8 h-8 text-primary" />
        </motion.div>

        <h3 className="text-lg md:text-xl font-bold text-foreground text-center group-hover:gold-text transition-all duration-300">
          {category.title}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {category.nominees.length} مرشحين
          </span>
          <motion.div
            className="w-2 h-2 rotate-45 bg-primary"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

export default CategoryCard;
