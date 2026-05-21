/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, AlertTriangle, Timer, Hash } from 'lucide-react';
import { CardItem, GameStatus } from './types';
import Card from './components/Card';

const INITIAL_TIME = 45;
const INITIAL_CHANCES = 15;
const BONUS_TIME = 15;

const CARD_DATA = [
  "游泳競賽",
  "高爾夫球賽",
  "電影票",
  "娃娃機",
  "卡拉OK",
  "電動彈珠台",
  "電影院",
  "納保官"
];

function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function App() {
  const [status, setStatus] = useState<GameStatus>('HOME');
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [chancesLeft, setChancesLeft] = useState(INITIAL_CHANCES);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Orientation Check
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerHeight < window.innerWidth && window.innerWidth < 1024);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const initGame = useCallback(() => {
    const duplicatedCards = [...CARD_DATA, ...CARD_DATA].map((content, index) => ({
      id: index,
      content,
      isFlipped: false,
      isMatched: false,
    }));
    setCards(shuffle(duplicatedCards));
    setFlippedCards([]);
    setTimeLeft(INITIAL_TIME);
    setChancesLeft(INITIAL_CHANCES);
    setStatus('PLAYING');
  }, []);

  // Timer Effect
  useEffect(() => {
    if (status === 'PLAYING' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setStatus('LOST');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const handleCardClick = (id: number) => {
    if (status !== 'PLAYING' || isProcessing || flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
    setCards(newCards);
    
    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      checkMatch(newFlipped, newCards);
    }
  };

  const checkMatch = (indices: number[], currentCards: CardItem[]) => {
    setIsProcessing(true);
    setChancesLeft(prev => prev - 1);

    const [id1, id2] = indices;
    const card1 = currentCards.find(c => c.id === id1)!;
    const card2 = currentCards.find(c => c.id === id2)!;

    if (card1.content === card2.content) {
      // Match success
      setTimeout(() => {
        const matchedCards = currentCards.map(c => 
          (c.id === id1 || c.id === id2) ? { ...c, isMatched: true, isFlipped: true } : c
        );
        setCards(matchedCards);
        setFlippedCards([]);
        setIsProcessing(false);
        setTimeLeft(prev => prev + BONUS_TIME);

        // Check for victory
        if (matchedCards.every(c => c.isMatched)) {
          setStatus('WON');
        }
      }, 600);
    } else {
      // Match failed
      setTimeout(() => {
        const unflippedCards = currentCards.map(c => 
          (c.id === id1 || c.id === id2) ? { ...c, isFlipped: false } : c
        );
        setCards(unflippedCards);
        setFlippedCards([]);
        setIsProcessing(false);

        if (chancesLeft <= 1) {
          setStatus('LOST');
        }
      }, 1000);
    }
  };

  if (isLandscape) {
    return (
      <div id="landscape-warning" className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-green-900 p-6 text-center text-white">
        <AlertTriangle size={64} className="mb-4 text-orange-400" />
        <h2 className="mb-2 text-2xl font-bold">請將裝置轉為直式</h2>
        <p>此遊戲僅支援直式模式，以獲得最佳體驗。</p>
      </div>
    );
  }

  return (
    <div id="app-container" className="min-h-screen bg-green-900 flex flex-col font-sans">
      <AnimatePresence mode="wait">
        {status === 'HOME' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            id="home-screen"
            className="flex-1 flex flex-col items-center justify-center p-6 text-white max-w-lg mx-auto"
          >
            <h1 id="game-title" className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-yellow-200 mb-6 text-center">
              娛樂稅 VS 納保法<br />記憶翻牌
            </h1>
            
            <div id="game-description" className="bg-green-800/50 p-6 rounded-2xl border border-green-700 mb-8 w-full backdrop-blur-xs">
              <p className="text-lg mb-4 text-green-50">
                卡片圖案代表娛樂稅課稅項目與納保法，當第一次點擊到兩張相同的圖卡，可以增加 15 秒的時間喔！
              </p>
              <div className="space-y-2">
                <p className="font-semibold text-orange-300">卡牌類型：</p>
                <div className="flex flex-wrap gap-2">
                  {CARD_DATA.map((item, i) => (
                    <span key={i} className="bg-green-700 px-3 py-1 rounded-full text-xs border border-green-600">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              id="btn-start"
              onClick={initGame}
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white font-bold py-4 rounded-xl text-xl shadow-xl shadow-orange-900/40"
            >
              開始遊戲
            </button>
          </motion.div>
        )}

        {status === 'PLAYING' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            id="playing-screen"
            className="flex-1 flex flex-col p-4 max-w-2xl mx-auto w-full"
          >
            {/* HUD */}
            <div id="game-hud" className="flex justify-between items-center bg-green-800 p-4 rounded-xl mb-6 border border-green-700 shadow-lg">
              <div className="flex items-center gap-2">
                <Hash className="text-orange-400" size={20} />
                <div className="flex flex-col">
                  <span className="text-[10px] text-green-300 uppercase font-bold tracking-wider">機會</span>
                  <span className={`text-2xl font-black ${chancesLeft <= 3 ? 'text-red-400' : 'text-white'}`}>
                    {chancesLeft}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="text-orange-400" size={20} />
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-green-300 uppercase font-bold tracking-wider">時間</span>
                  <span className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                    {timeLeft}s
                  </span>
                </div>
              </div>
            </div>

            {/* GRID */}
            <div id="card-grid" className="grid grid-cols-4 gap-3 flex-1 auto-rows-min">
              {cards.map((card) => (
                <Card
                  key={card.id}
                  id={`card-${card.id}`}
                  content={card.content}
                  isFlipped={card.isFlipped}
                  isMatched={card.isMatched}
                  onClick={() => handleCardClick(card.id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {(status === 'WON' || status === 'LOST') && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            id="result-screen"
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-green-950/80 backdrop-blur-md"
          >
            <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl overflow-hidden relative">
              <div className={`absolute top-0 left-0 w-full h-2 ${status === 'WON' ? 'bg-orange-400' : 'bg-red-400'}`} />
              
              <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${status === 'WON' ? 'bg-orange-100 text-orange-500' : 'bg-red-100 text-red-500'}`}>
                {status === 'WON' ? <Trophy size={48} /> : <AlertTriangle size={48} />}
              </div>

              <h2 className="text-3xl font-black mb-2 text-slate-800">
                {status === 'WON' ? '過關成功！' : '遊戲結束'}
              </h2>
              
              <p className="text-slate-600 mb-8 text-lg font-medium">
                {status === 'WON' 
                  ? `太厲害了！你還有 ${timeLeft} 秒！` 
                  : chancesLeft <= 0 ? '機會已經用完了...' : '時間到！再接再厲！'}
              </p>

              <button
                id="btn-retry"
                onClick={initGame}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-xl shadow-lg transition-all active:scale-95"
              >
                <RotateCcw size={24} />
                再玩一次
              </button>
              
              <button
                id="btn-back-home"
                onClick={() => setStatus('HOME')}
                className="mt-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
              >
                回首頁
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
