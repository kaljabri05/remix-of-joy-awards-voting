import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
}

const colors = [
  "hsl(43, 74%, 49%)",  // Gold
  "hsl(43, 87%, 65%)",  // Light gold
  "hsl(0, 60%, 25%)",   // Burgundy
  "hsl(0, 50%, 35%)",   // Light burgundy
  "hsl(43, 60%, 35%)",  // Dark gold
];

const Confetti = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 50; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
        rotation: Math.random() * 360,
      });
    }
    setPieces(newPieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-3 h-3"
          style={{
            left: `${piece.x}%`,
            top: -20,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
          }}
          initial={{ y: -20, opacity: 1 }}
          animate={{
            y: window.innerHeight + 20,
            opacity: [1, 1, 0],
            rotate: [piece.rotation, piece.rotation + 360, piece.rotation + 720],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
