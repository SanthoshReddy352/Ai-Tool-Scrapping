import React, { useEffect, useState, useCallback } from 'react';
import { Bird, Trophy, Timer, Star, Gamepad2 } from 'lucide-react';

function App() {
  const [birdPosition, setBirdPosition] = useState(300);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [obstacles, setObstacles] = useState<{ x: number; height: number }[]>([]);
  const [passedObstacles, setPassedObstacles] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('highScore');
    return saved ? parseInt(saved) : 0;
  });
  
  const gravity = 2;
  const jumpForce = -28;
  const obstacleSpeed = 3;
  const gapSize = 200;

  const jump = useCallback(() => {
    if (!gameOver) {
      setBirdPosition(pos => Math.max(0, pos + jumpForce));
    }
  }, [gameOver]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (!gameStarted) {
          setGameStarted(true);
          setGameTime(0);
        }
        jump();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [jump, gameStarted]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setGameTime(time => time + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted) return;

    const gameLoop = setInterval(() => {
      if (gameOver) {
        clearInterval(gameLoop);
        return;
      }

      setBirdPosition(pos => {
        const newPos = pos + gravity;
        if (newPos > 600 || newPos < 0) {
          setGameOver(true);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('highScore', score.toString());
          }
          return pos;
        }
        return newPos;
      });

      setObstacles(obs => {
        if (gameOver) return obs;

        const newObs = obs.map(o => ({ ...o, x: o.x - obstacleSpeed }))
          .filter(o => {
            if (!gameOver && o.x + 60 < 100 && o.x + 60 >= 100 - obstacleSpeed) {
              setPassedObstacles(prev => prev + 1);
              setScore(prev => prev + 1);
            }
            return o.x > -100;
          });

        if (newObs.length < 3) {
          const lastX = newObs.length ? Math.max(...newObs.map(o => o.x)) : 800;
          newObs.push({
            x: lastX + 400,
            height: Math.random() * 300 + 100
          });
        }

        return newObs;
      });

      obstacles.forEach(obs => {
        if (gameOver) return;

        const birdBox = {
          left: 100,
          right: 100 + 32,
          top: birdPosition,
          bottom: birdPosition + 32
        };

        const topPipeBox = {
          left: obs.x,
          right: obs.x + 60,
          top: 0,
          bottom: obs.height
        };

        const bottomPipeBox = {
          left: obs.x,
          right: obs.x + 60,
          top: obs.height + gapSize,
          bottom: 600
        };

        if (
          (birdBox.right > topPipeBox.left && 
           birdBox.left < topPipeBox.right && 
           birdBox.top < topPipeBox.bottom) ||
          (birdBox.right > bottomPipeBox.left && 
           birdBox.left < bottomPipeBox.right && 
           birdBox.bottom > bottomPipeBox.top)
        ) {
          setGameOver(true);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('highScore', score.toString());
          }
        }
      });

    }, 20);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, obstacles, birdPosition, score, highScore]);

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-400 to-blue-600 flex items-center justify-center p-4"
      onClick={jump}
    >
      <div className="relative w-[800px] h-[600px] bg-gradient-to-b from-blue-200 to-blue-300 overflow-hidden rounded-2xl shadow-2xl border-4 border-white/50">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1601134467661-3d775b999c8b')] bg-cover bg-center opacity-20" />
        
        {/* Bird */}
        <div 
          className="absolute left-[100px] transition-transform duration-75 z-10"
          style={{ 
            top: `${birdPosition}px`,
            transform: `rotate(${(birdPosition - 300) * 0.2}deg)`
          }}
        >
          <Bird 
            className="w-8 h-8 text-yellow-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]" 
            strokeWidth={2.5}
          />
        </div>

        {/* Obstacles */}
        {obstacles.map((obs, i) => (
          <React.Fragment key={i}>
            <div
              className="absolute w-[60px] bg-gradient-to-br from-green-500 to-green-600 rounded-b-lg shadow-lg"
              style={{
                left: `${obs.x}px`,
                height: `${obs.height}px`,
                top: 0
              }}
            >
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-green-700 rounded-b-lg" />
            </div>
            <div
              className="absolute w-[60px] bg-gradient-to-br from-green-500 to-green-600 rounded-t-lg shadow-lg"
              style={{
                left: `${obs.x}px`,
                height: `${600 - obs.height - gapSize}px`,
                bottom: 0
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-8 bg-green-700 rounded-t-lg" />
            </div>
          </React.Fragment>
        ))}

        {/* UI Elements */}
        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-white text-center bg-black/40 p-8 rounded-2xl shadow-2xl border border-white/10">
              <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                Flying Bird
              </h1>
              <p className="text-xl mb-6 text-blue-200">按空格键或点击屏幕让小鸟跳跃</p>
              <div className="space-y-4 mb-6 text-left">
                <h2 className="text-lg font-semibold text-blue-300">游戏规则：</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>通过每个障碍物得1分</li>
                  <li>撞到障碍物或飞出边界游戏结束</li>
                </ul>
              </div>
              {highScore > 0 && (
                <div className="text-xl">
                  最高分: <span className="font-bold text-yellow-400">{highScore}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-white text-center bg-black/40 p-8 rounded-2xl shadow-2xl border border-white/10">
              <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                游戏结束!
              </h2>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-center justify-between gap-8 p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                    <span className="text-lg">得分</span>
                  </div>
                  <span className="text-3xl font-bold text-yellow-400">{score}</span>
                </div>
                
                <div className="flex items-center justify-between gap-8 p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Timer className="w-8 h-8 text-blue-400" />
                    <span className="text-lg">坚持时间</span>
                  </div>
                  <span className="text-2xl">{gameTime} 秒</span>
                </div>

                {score === highScore && score > 0 && (
                  <div className="text-yellow-400 font-bold text-xl bg-yellow-400/10 p-4 rounded-xl">
                    🎉 新纪录！
                  </div>
                )}
              </div>

              <button 
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                onClick={(e) => {
                  e.stopPropagation();
                  setGameOver(false);
                  setGameStarted(false);
                  setBirdPosition(300);
                  setScore(0);
                  setPassedObstacles(0);
                  setGameTime(0);
                  setObstacles([]);
                }}
              >
                再玩一次
              </button>
            </div>
          </div>
        )}

        {/* Score */}
        <div className="absolute top-4 right-4 space-y-2">
          <div className="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-xl text-white font-bold shadow-lg">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>得分: {score}</span>
            </div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-xl text-white font-bold shadow-lg">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-blue-300" />
              <span>时间: {gameTime}秒</span>
            </div>
          </div>
          {highScore > 0 && (
            <div className="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-xl text-white font-bold shadow-lg">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>最高分: {highScore}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;