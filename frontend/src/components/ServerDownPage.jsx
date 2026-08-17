import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, Sparkles, Heart } from 'lucide-react';

const ServerDownPage = ({ onRetry }) => {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const highScoreRef = useRef(parseInt(localStorage.getItem('realKawaiiScore')) || 0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(highScoreRef.current);

  const playSound = (type) => {
    try {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      
      if (type === 'jump') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'score') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(1200, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) {
      // Ignore audio errors
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await onRetry();
    setIsRetrying(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Game variables
    let animationId;
    let isPlaying = false;
    let isGameOver = false;
    let frameCount = 0;
    let itemsCrossed = 0;
    
    // Player
    const player = {
      x: 50,
      y: 140,
      width: 30,
      height: 30,
      dy: 0,
      jumpForce: -11.5,
      originalY: 140,
      grounded: true
    };
    
    // Physics
    const gravity = 0.65;
    let gameSpeed = 4.5;
    let obstacles = [];
    let clouds = [
      { x: 100, y: 40, speed: 0.5, emoji: '☁️' },
      { x: 350, y: 60, speed: 0.3, emoji: '✨' },
      { x: 600, y: 30, speed: 0.6, emoji: '☁️' },
    ];

    // Anime Pookie style emojis!
    const playerEmoji = '🐸';
    const obstacleEmojis = ['🍡', '🍰', '🌸', '🎀'];

    const drawPlayer = () => {
      ctx.font = '36px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(playerEmoji, player.x, player.y + 28);
    };

    const drawObstacles = () => {
      ctx.font = '32px Arial';
      ctx.textAlign = 'left';
      obstacles.forEach(obs => {
        ctx.fillText(obs.emoji, obs.x, obs.y + 28);
      });
    };

    const drawClouds = () => {
      ctx.font = '30px Arial';
      ctx.textAlign = 'left';
      clouds.forEach(cloud => {
        ctx.fillText(cloud.emoji, cloud.x, cloud.y);
      });
    };

    const handleInput = (e) => {
      // Init audio on first interaction
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      if ((e.type === 'keydown' && e.code === 'Space') || e.type === 'touchstart' || e.type === 'mousedown') {
        if (!isPlaying) {
          isPlaying = true;
          isGameOver = false;
          obstacles = [];
          itemsCrossed = 0;
          setScore(0);
          gameSpeed = 4.5;
          player.y = player.originalY;
          player.dy = 0;
          playSound('jump');
          gameLoop();
        } else if (player.grounded && !isGameOver) {
          player.dy = player.jumpForce;
          player.grounded = false;
          playSound('jump');
        } else if (isGameOver) {
          // Restart logic fixed!
          isGameOver = false;
          obstacles = [];
          itemsCrossed = 0;
          setScore(0);
          gameSpeed = 4.5;
          player.y = player.originalY;
          player.dy = 0;
          playSound('jump');
          gameLoop();
        }
      }
    };

    window.addEventListener('keydown', handleInput);
    canvas.addEventListener('touchstart', handleInput, { passive: true });
    canvas.addEventListener('mousedown', handleInput);

    const gameLoop = () => {
      if (!isPlaying || isGameOver) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw clouds/sparkles
      clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x < -50) cloud.x = canvas.width + 50;
      });
      drawClouds();
      
      // Draw kawaii ground line
      ctx.beginPath();
      ctx.moveTo(0, player.originalY + player.height + 4);
      ctx.lineTo(canvas.width, player.originalY + player.height + 4);
      ctx.strokeStyle = '#f472b6'; // pink-400
      ctx.lineWidth = 4;
      ctx.stroke();

      // Player physics
      player.dy += gravity;
      player.y += player.dy;

      if (player.y >= player.originalY) {
        player.y = player.originalY;
        player.grounded = true;
        player.dy = 0;
      }

      drawPlayer();

      // Manage obstacles
      frameCount++;
      if (frameCount % Math.floor(Math.random() * 50 + 60) === 0) {
        obstacles.push({
          x: canvas.width,
          y: player.originalY,
          width: 25,
          height: 25,
          emoji: obstacleEmojis[Math.floor(Math.random() * obstacleEmojis.length)]
        });
      }

      obstacles.forEach((obs) => {
        obs.x -= gameSpeed;
        
        // Circular Collision detection (perfect for emojis)
        const playerCenterX = player.x + 15; // 30 / 2
        const playerCenterY = player.y + 15;
        const obsCenterX = obs.x + 12.5; // 25 / 2
        const obsCenterY = obs.y + 12.5;

        const dx = playerCenterX - obsCenterX;
        const dy = playerCenterY - obsCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Player radius = 12, Obstacle radius = 10
        if (distance < 22) {
          isGameOver = true;
          playSound('gameover');
          // Final high score check is now handled live!
        }

        // Score logic
        if (!obs.passed && player.x > obs.x + obs.width) {
          obs.passed = true;
          itemsCrossed++;
          setScore(itemsCrossed);
          playSound('score');
          
          // Live High Score Update!
          if (itemsCrossed > highScoreRef.current) {
            highScoreRef.current = itemsCrossed;
            setHighScore(itemsCrossed);
            localStorage.setItem('realKawaiiScore', itemsCrossed.toString());
          }
        }
      });

      // Remove off-screen obstacles
      if (obstacles.length > 0 && obstacles[0].x < -30) {
        obstacles.shift();
      }
      
      drawObstacles();

      if (!isGameOver) {
        // Speed up gradually as you cross more items
        gameSpeed = 4.5 + (itemsCrossed * 0.1); 
        animationId = requestAnimationFrame(gameLoop);
      } else {
        // Game Over screen
        // Use a slightly darker overlay if document is in dark mode
        const isDark = document.documentElement.classList.contains('dark');
        ctx.fillStyle = isDark ? 'rgba(45, 27, 78, 0.8)' : 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = isDark ? '#f472b6' : '#db2777'; // pink-400 or pink-600
        ctx.font = 'bold 24px Quicksand, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over! 💔', canvas.width / 2, 80);
        
        ctx.fillStyle = isDark ? '#fbcfe8' : '#db2777';
        ctx.font = '16px Quicksand, sans-serif';
        ctx.fillText('Tap or Space to try again!', canvas.width / 2, 110);
      }
    };

    // Initial draw (Kawaii Idle State)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawClouds();
    
    const isDark = document.documentElement.classList.contains('dark');
    ctx.fillStyle = isDark ? '#f472b6' : '#db2777'; // pink-600 or pink-400
    ctx.font = 'bold 20px Quicksand, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Ready for a Snack Run? 🐸💖', canvas.width / 2, 90);
    
    ctx.fillStyle = isDark ? '#fbcfe8' : '#db2777';
    ctx.font = '14px Quicksand, sans-serif';
    ctx.fillText('Press Space or Tap to Jump!', canvas.width / 2, 120);
    
    // Draw initial ground
    ctx.beginPath();
    ctx.moveTo(0, player.originalY + player.height + 4);
    ctx.lineTo(canvas.width, player.originalY + player.height + 4);
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    drawPlayer();

    return () => {
      window.removeEventListener('keydown', handleInput);
      canvas.removeEventListener('touchstart', handleInput);
      canvas.removeEventListener('mousedown', handleInput);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-100 via-pink-100 to-rose-100 dark:from-slate-900 dark:via-fuchsia-900/20 dark:to-slate-900 flex flex-col items-center justify-center p-4 transition-colors font-sans overflow-hidden relative">
      
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 text-pink-300 opacity-50 animate-bounce"><Heart className="w-12 h-12" /></div>
      <div className="absolute top-20 right-20 text-fuchsia-300 opacity-50 animate-pulse"><Sparkles className="w-10 h-10" /></div>
      <div className="absolute bottom-20 left-20 text-rose-300 opacity-50 animate-pulse"><Sparkles className="w-8 h-8" /></div>
      <div className="absolute bottom-10 right-10 text-pink-300 opacity-50 animate-bounce" style={{animationDelay: '1s'}}><Heart className="w-14 h-14" /></div>

      <div className="text-center max-w-lg mx-auto mb-8 relative z-10">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-4 rounded-full inline-flex items-center justify-center mb-6 shadow-xl shadow-pink-200/50 dark:shadow-none border border-pink-100 dark:border-slate-700">
           <span className="text-4xl">🥺</span>
        </div>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-fuchsia-500 dark:from-pink-400 dark:to-fuchsia-400 mb-3 drop-shadow-sm">
          Oh no! Server is sleeping...
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mb-8 font-medium">
          Our servers are taking a little kawaii nap right now! While we try to wake them up, why don't you play a cute game?
        </p>
        <button 
          onClick={handleRetry} 
          disabled={isRetrying}
          className="bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white px-8 py-3.5 rounded-full font-bold transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50 active:scale-95 shadow-lg shadow-pink-500/30"
        >
          <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Waking server up...' : 'Retry Connection ✨'}
        </button>
      </div>

      {/* Mini Game Section */}
      <div className="bg-white/70 dark:bg-[#2d1b4e]/70 backdrop-blur-xl p-6 rounded-[2rem] shadow-[0_0_40px_-10px_rgba(236,72,153,0.3)] dark:shadow-[0_0_40px_-10px_rgba(217,70,239,0.2)] border-2 border-pink-200 dark:border-fuchsia-500/30 w-full max-w-2xl relative z-10 transform hover:scale-[1.02] transition-all duration-300">
        <div className="flex justify-between items-center mb-5 px-4">
          <span className="font-extrabold text-pink-500 dark:text-pink-300 text-xl drop-shadow-sm">Score: {score}</span>
          <span className="font-extrabold text-fuchsia-500 dark:text-fuchsia-300 text-xl drop-shadow-sm">High Score: {highScore}</span>
        </div>
        <div className="overflow-hidden rounded-[1.5rem] border-[6px] border-pink-100 dark:border-[#4a2b7a] bg-gradient-to-b from-fuchsia-50 to-pink-50 dark:from-[#1e103c] dark:to-[#381f62] relative shadow-inner">
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={200}
            className="w-full h-[200px] cursor-pointer touch-none block"
          />
        </div>
        <p className="text-center text-sm text-pink-500 dark:text-pink-300 mt-6 font-bold tracking-wide">
          Press <kbd className="px-2.5 py-1.5 bg-pink-100 text-pink-600 dark:bg-[#4a2b7a] dark:text-pink-200 rounded-lg shadow-sm border border-pink-200 dark:border-[#5b3696] mx-1">Spacebar</kbd> or <strong className="text-fuchsia-500 dark:text-fuchsia-300 mx-1">Tap</strong> the screen to jump!
        </p>
      </div>
    </div>
  );
};

export default ServerDownPage;
