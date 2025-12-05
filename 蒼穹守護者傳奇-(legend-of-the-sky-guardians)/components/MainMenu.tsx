
import React, { useState, useEffect } from 'react';
import { GameView } from '../types';
import { Sword, BookOpen, Scroll } from 'lucide-react';

interface MainMenuProps {
  onStart: () => void;
  onChangeView: (view: GameView) => void;
}

const STORY_TEXT = `
【艾特拉編年史：虛空之蝕】

在古老的艾特拉大陸，魔法之源「星核」維持著世界的平衡與繁榮。然而，千年前被封印的「虛空」勢力，隨著星核的波動再次甦醒。

虛空領主撕裂了空間的帷幕，無數扭曲的魔物如潮水般湧入現世。它們貪婪地吞噬著一切生命與魔力，所過之處只剩下灰燼與死寂。

王國的防線節節敗退，各大城邦接連淪陷。在絕望之際，皇家大法師們重啟了失落的技術——「英靈之塔」。這是一種能夠召喚古代英雄靈魂，並將其力量實體化為防禦建築的禁忌魔法。

作為王國最後的指揮官，你臨危受命，鎮守在通往王都的最後防線上。你必須指揮工兵建造防禦塔，調度英靈英雄，並利用地形優勢，抵擋虛空大軍的無盡攻勢。

這不僅是一場保衛戰，更是為了艾特拉大陸的存續。
指揮官，願星光指引你的劍刃。
`;

const MainMenu: React.FC<MainMenuProps> = ({ onStart, onChangeView }) => {
  const [showLoreModal, setShowLoreModal] = useState(false);
  const [meteors, setMeteors] = useState<number[]>([]);
  const [stars, setStars] = useState<{id: number, x: number, y: number, size: number, opacity: number}[]>([]);

  // Generate Meteors and Stars on mount
  useEffect(() => {
    // Generate static stars
    const newStars = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60, // Top 60% of screen
      size: Math.random() * 2 + 1,
      opacity: Math.random()
    }));
    setStars(newStars);

    // Generate meteors
    setMeteors(Array.from({ length: 12 }).map((_, i) => i));
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-900 overflow-hidden font-sans">
      {/* Dynamic CSS Styles for Meteor Animation */}
      <style>{`
        @keyframes meteor {
          0% { transform: rotate(215deg) translateX(0); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: rotate(215deg) translateX(-1000px); opacity: 0; }
        }
        .meteor-shower {
          position: absolute;
          top: 0;
          left: 50%;
          width: 1px;
          height: 1px;
          background-color: transparent;
          transform: rotate(215deg);
        }
        .meteor {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 300px;
          height: 1px;
          background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0) 100%);
          animation: meteor 5s linear infinite;
          opacity: 0;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>

      {/* Layer 0: Deep Sky Gradient */}
      <div 
        className="absolute inset-0 z-0"
        style={{ 
            background: 'linear-gradient(to bottom, #020617 0%, #1e1b4b 40%, #312e81 70%, #4f46e5 100%)' 
        }}
      />
      
      {/* Layer 1: Stars */}
      <div className="absolute inset-0 z-0">
          {stars.map(star => (
              <div 
                key={star.id}
                className="absolute rounded-full bg-white animate-pulse"
                style={{
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    opacity: star.opacity,
                    animationDuration: `${Math.random() * 3 + 2}s`
                }}
              />
          ))}
      </div>

      {/* Layer 2: Meteors */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {meteors.map((m, i) => (
              <div 
                key={m}
                className="meteor"
                style={{
                    top: `${Math.random() * 50 - 20}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 10}s`,
                    animationDuration: `${Math.random() * 2 + 4}s`,
                    width: `${Math.random() * 200 + 100}px`,
                    background: `linear-gradient(to right, rgba(255, 255, 255, 0), rgba(${100 + Math.random()*155}, ${200 + Math.random()*55}, 255, 1))`
                }}
              />
          ))}
      </div>

      {/* Layer 3: Mountain Silhouette (SVG) */}
      <div className="absolute bottom-0 left-0 w-full z-0 h-1/3">
           <svg viewBox="0 0 1440 320" className="w-full h-full preserve-3d" preserveAspectRatio="none">
               {/* Back Mountains (Lighter/Faded) */}
               <path fill="#312e81" fillOpacity="0.5" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
               {/* Front Mountains (Darker) */}
               <path fill="#020617" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,213.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
           </svg>
      </div>
      
      {/* Content Layer */}
      <div className="z-10 text-center max-w-4xl px-6 flex flex-col items-center">
        {/* Title Logo Area */}
        <div className="mb-16 relative">
             <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full animate-pulse"></div>
             <h1 className="text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-300 mb-2 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] fantasy-font tracking-widest relative z-10 animate-fade-in-up">
            蒼穹守護者
            </h1>
            <h2 className="text-xl md:text-2xl text-blue-200/80 font-light tracking-[0.8em] uppercase cinzel drop-shadow-lg animate-fade-in-up animation-delay-500">
            Legend of the Sky Guardians
            </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-6 w-full max-w-md animate-fade-in-up animation-delay-700">
          <button 
            onClick={() => onChangeView(GameView.LEVEL_SELECT)}
            className="group relative w-full py-5 bg-gradient-to-r from-amber-600/90 to-amber-700/90 backdrop-blur-sm rounded border border-amber-400 hover:border-white transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(245,158,11,0.4)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <div className="flex items-center justify-center gap-4 relative z-10">
              <Sword className="w-6 h-6 text-white group-hover:rotate-45 transition-transform duration-300" />
              <span className="text-2xl font-bold text-white tracking-[0.2em]">開始戰役</span>
            </div>
          </button>

          <div className="flex gap-4">
            <button 
                onClick={() => onChangeView(GameView.BESTIARY)}
                className="flex-1 py-4 bg-slate-900/60 backdrop-blur rounded border border-slate-600 hover:bg-slate-800 hover:border-blue-400 transition-all flex items-center justify-center gap-2 group"
            >
                <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-blue-300" />
                <span className="text-lg font-bold text-slate-300 group-hover:text-white tracking-widest">圖鑑</span>
            </button>

            <button 
                onClick={() => setShowLoreModal(true)}
                className="flex-1 py-4 bg-slate-900/60 backdrop-blur rounded border border-slate-600 hover:bg-slate-800 hover:border-blue-400 transition-all flex items-center justify-center gap-2 group"
            >
                <Scroll className="w-5 h-5 text-slate-400 group-hover:text-blue-300" />
                <span className="text-lg font-bold text-slate-300 group-hover:text-white tracking-widest">傳說</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-xs text-slate-500/50 font-mono z-10">
        Ver 0.7.0 | Meteor Update
      </div>

      {/* Lore Modal */}
      {showLoreModal && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
              <div className="bg-slate-900/90 border border-blue-500/30 p-8 max-w-2xl w-full rounded-lg shadow-[0_0_50px_rgba(59,130,246,0.2)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                  
                  <h3 className="text-2xl font-bold text-blue-400 mb-6 fantasy-font text-center tracking-widest">艾特拉編年史</h3>
                  
                  <div className="text-lg text-slate-300 leading-relaxed font-serif text-justify max-h-[60vh] overflow-y-auto custom-scrollbar whitespace-pre-line p-6 bg-black/40 rounded border border-slate-800/50">
                    {STORY_TEXT}
                  </div>

                  <button 
                    onClick={() => setShowLoreModal(false)}
                    className="mt-8 w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600 transition-colors"
                  >
                    關閉卷軸
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default MainMenu;
