import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  enableTilt?: boolean;
  enableScale?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  enableTilt = true,
  enableScale = true,
}) => {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale: enableScale ? 1.02 : 1,
        rotateX: enableTilt ? 2 : 0,
        rotateY: enableTilt ? 2 : 0,
        transition: { duration: 0.3 },
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
};
