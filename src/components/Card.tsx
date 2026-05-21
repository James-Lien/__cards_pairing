/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

interface CardProps {
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
  id: string;
}

export default function Card({ content, isFlipped, isMatched, onClick, id }: CardProps) {
  return (
    <div
      id={id}
      className="relative h-24 w-full cursor-pointer perspective-1000 md:h-32"
      onClick={onClick}
    >
      <motion.div
        className="h-full w-full transition-all duration-500 preserve-3d"
        animate={{ rotateY: isFlipped || isMatched ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Back of the card */}
        <div 
          className="absolute inset-0 flex items-center justify-center rounded-xl bg-green-700 border-4 border-green-900 shadow-lg backface-hidden"
        >
          <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold opacity-30">
            ?
          </div>
        </div>

        {/* Front of the card */}
        <div 
          className="absolute inset-0 flex items-center justify-center rounded-xl bg-white border-4 border-orange-400 shadow-lg backface-hidden rotate-y-180"
        >
          <span className="text-center text-sm font-bold text-green-900 md:text-base px-1">
            {content}
          </span>
          {isMatched && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-yellow-400 h-6 w-6 rounded-full flex items-center justify-center text-xs border border-white"
            >
              ✓
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
