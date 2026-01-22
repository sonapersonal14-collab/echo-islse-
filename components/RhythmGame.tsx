
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED, SCAN_DURATION, 
  SCAN_COOLDOWN_MAX, ISLANDS, INITIAL_SCANNER_RANGE 
} from '../constants';
import { GameState, Treasure, Enemy, LoreData, Obstacle } from '../types';
import { generateIslandLore } from '../services/geminiService';
import { Music, Search, Shield, Trophy, MapPin, Sparkles, ChevronRight, Volume2, Trees as PalmTreeIcon } from 'lucide-react';

const RhythmGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const lastBeatRef = useRef<number>(-1);
  const walkCycleRef = useRef<number>(0);
  const armCycleRef = useRef<number>(0);

  const [audioStarted, setAudioStarted] = useState(false);

  const initLevel = (index: number): Partial<GameState> => {
    const island = ISLANDS[index];
    const diff = island.difficulty;
    
    return {
      currentIslandIndex: index,
      playerPos: { x: 80, y: 300 },
      scannerActive: false,
      scannerCooldown: 0,
      isHiding: false,
      isLevelCleared: false,
      treasures: [
        { id: `t1-${index}`, x: 620, y: 140, type: 'crystal', name: 'Deep Bass', collected: false, rhythmSpeed: 1000 },
        { id: `t2-${index}`, x: 300, y: 500, type: 'relic', name: 'Echo Charm', collected: false, rhythmSpeed: 800 },
        { id: `t3-${index}`, x: 680, y: 450, type: 'scroll', name: 'Island History', collected: false, rhythmSpeed: 1200 },
      ],
      enemies: Array.from({ length: diff }).map((_, i) => ({
        id: `e${i}-${index}`,
        x: 450 + Math.random() * 250,
        y: 100 + Math.random() * 400,
        type: i % 2 === 0 ? 'parrot' : 'crab',
        range: 100,
        speed: 1.0 + (diff * 0.15),
        angle: Math.random() * Math.PI * 2
      })),
      obstacles: Array.from({ length: diff + 2 }).map((_, i) => ({
        id: `obs${i}`,
        x: 200 + i * 130,
        y: 100 + Math.random() * 350,
        width: 80,
        height: 80,
        beatPhase: i % 2
      }))
    };
  };

  const [gameState, setGameState] = useState<GameState>({
    currentIslandIndex: 0,
    playerPos: { x: 80, y: 300 },
    score: 0,
    scannerActive: false,
    scannerCooldown: 0,
    scannerRange: INITIAL_SCANNER_RANGE,
    isHiding: false,
    treasures: [],
    enemies: [],
    obstacles: [],
    isLevelCleared: false,
    ...initLevel(0)
  });

  const [activeLore, setActiveLore] = useState<LoreData | null>(null);
  const [loadingLore, setLoadingLore] = useState(false);
  const keysPressed = useRef<Set<string>>(new Set());

  // --- AUDIO ENGINE: Relaxing & Funny ---
  const startAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.connect(audioCtxRef.current.destination);
      masterGainRef.current.gain.value = 0.2;
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    setAudioStarted(true);
  };

  const playSound = (freq: number, type: OscillatorType, duration: number, volume: number = 0.5, slide?: number, decay: boolean = true) => {
    if (!audioCtxRef.current || !masterGainRef.current || !audioStarted) return;
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
    if (slide) {
      osc.frequency.exponentialRampToValueAtTime(slide, audioCtxRef.current.currentTime + duration);
    }
    
    gain.gain.setValueAtTime(0.001, audioCtxRef.current.currentTime);
    gain.gain.linearRampToValueAtTime(volume, audioCtxRef.current.currentTime + 0.05); // Soft attack for relaxation
    if (decay) {
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + duration);
    } else {
      gain.gain.linearRampToValueAtTime(0.001, audioCtxRef.current.currentTime + duration);
    }
    
    osc.connect(gain);
    gain.connect(masterGainRef.current);
    
    osc.start();
    osc.stop(audioCtxRef.current.currentTime + duration);
  };

  const playQuirkyMelody = (beat: number, island: any) => {
    const scale = [island.audioFreq, island.audioFreq * 1.125, island.audioFreq * 1.25, island.audioFreq * 1.5, island.audioFreq * 1.66];
    
    // Low Bass Heartbeat (Relaxing)
    playSound(island.audioFreq / 2, 'sine', 0.4, 0.2);

    // Funny quirky accent (e.g. "Boing")
    if (beat % 2 === 0) {
      const f = scale[Math.floor(Math.random() * scale.length)];
      playSound(f, island.accentType, 0.3, 0.08, f * 0.4); // Funny downward slide
    }

    // High quirky "plink"
    if (beat % 4 === 3) {
      playSound(scale[3] * 2.2, 'triangle', 0.15, 0.05, scale[3] * 3); // Funny upward chirp
    }
  };

  const playWinFanfare = () => {
    if (!audioCtxRef.current) return;
    const melody = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    melody.forEach((f, i) => {
      setTimeout(() => playSound(f, 'sine', 0.6, 0.15), i * 80);
    });
    // Funny base "wow"
    playSound(100, 'sawtooth', 1.2, 0.1, 400);
  };

  // --- HANDLERS declared before useEffect to avoid TDZ errors ---
  const handleScan = useCallback(async () => {
    if (gameState.scannerCooldown > 0) return;
    setGameState(prev => ({ ...prev, scannerActive: true, scannerCooldown: SCAN_COOLDOWN_MAX }));
    playSound(200, 'sine', 0.8, 0.1, 800);
    setTimeout(() => setGameState(prev => ({ ...prev, scannerActive: false })), SCAN_DURATION);
  }, [gameState.scannerCooldown, audioStarted]);

  const collectTreasure = useCallback(async (treasure: Treasure) => {
    setLoadingLore(true);
    playWinFanfare();
    const lore = await generateIslandLore(ISLANDS[gameState.currentIslandIndex].name, treasure.type);
    setActiveLore(lore);
    setLoadingLore(false);
    setGameState(prev => {
      const newTreasures = prev.treasures.map(t => t.id === treasure.id ? { ...t, collected: true } : t);
      const allCollected = newTreasures.every(t => t.collected);
      return { ...prev, score: prev.score + 500, treasures: newTreasures, isLevelCleared: allCollected };
    });
  }, [gameState.currentIslandIndex, audioStarted]);

  // --- DRAWING HELPERS for Realistic Feel ---
  const drawCliff = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + 10, y + 20);
    ctx.quadraticCurveTo(x + w / 2, y - 10, x + w - 10, y + 20);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Rock detail
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 20, y + 40);
    ctx.lineTo(x + w - 20, y + 50);
    ctx.stroke();
  };

  const drawPalm = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    const wind = Math.sin(Date.now() / 800) * 0.05;
    
    // Trunk with texture
    const trunk = ctx.createLinearGradient(-5, 0, 5, 0);
    trunk.addColorStop(0, '#78350f');
    trunk.addColorStop(0.5, '#92400e');
    trunk.addColorStop(1, '#78350f');
    ctx.fillStyle = trunk;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.quadraticCurveTo(-10 - (wind * 50), -40, -4, -100);
    ctx.lineTo(4, -100);
    ctx.quadraticCurveTo(10 + (wind * 50), -40, 6, 0);
    ctx.fill();

    // Fronds (Detailed Leaves)
    ctx.fillStyle = '#166534';
    for (let i = 0; i < 7; i++) {
      ctx.save();
      ctx.translate(0, -100);
      ctx.rotate((i * 51 + wind * 200) * Math.PI / 180);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(20, -15, 60, 5);
      ctx.quadraticCurveTo(30, 15, 0, 0);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  };

  const drawHuman = (ctx: CanvasRenderingContext2D, x: number, y: number, isMoving: boolean, isHiding: boolean) => {
    ctx.save();
    ctx.translate(x, y);
    if (isHiding) ctx.scale(0.8, 0.7);

    const legA = isMoving ? Math.sin(walkCycleRef.current) * 12 : 0;
    const legB = isMoving ? Math.sin(walkCycleRef.current + Math.PI) * 12 : 0;
    const arm = isMoving ? Math.sin(armCycleRef.current) * 8 : 0;

    // Shoes
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-12, 12 + legA, 8, 4); // L
    ctx.fillRect(4, 12 + legB, 8, 4);  // R

    // Legs
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-8, 12 + legA); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(8, 12 + legB); ctx.stroke();

    // Body (Poncho)
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.moveTo(-15, 0); ctx.lineTo(15, 0);
    ctx.lineTo(0, -25); ctx.closePath();
    ctx.fill();

    // Arms
    ctx.strokeStyle = '#fecaca';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(-18 + arm, -5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, -10); ctx.lineTo(18 - arm, -5); ctx.stroke();

    // Head
    ctx.fillStyle = '#fecaca';
    ctx.beginPath(); ctx.arc(0, -32, 10, 0, Math.PI * 2); ctx.fill();

    // Face Detail
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(-3, -34, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(3, -34, 1.5, 0, Math.PI * 2); ctx.fill();

    // Headphones (The signature look)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, -32, 13, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.arc(-13, -32, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(13, -32, 5, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  };

  // --- GAME LOOP ---
  useEffect(() => {
    const loop = setInterval(() => {
      let triggeredTreasure: Treasure | null = null;

      setGameState(prev => {
        let { x, y } = prev.playerPos;
        const hiding = keysPressed.current.has('e');
        const now = Date.now();
        const beatCycle = Math.floor(now / 600) % 8;

        if (beatCycle !== lastBeatRef.current) {
          lastBeatRef.current = beatCycle;
          if (audioStarted) playQuirkyMelody(beatCycle, ISLANDS[prev.currentIslandIndex]);
        }

        let isMoving = false;
        if (!hiding) {
          let dx = 0, dy = 0;
          if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) dy -= PLAYER_SPEED;
          if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) dy += PLAYER_SPEED;
          if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) dx -= PLAYER_SPEED;
          if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) dx += PLAYER_SPEED;

          if (dx !== 0 || dy !== 0) {
            isMoving = true;
            walkCycleRef.current += 0.15;
            armCycleRef.current += 0.1;
          }

          const nextX = x + dx;
          const nextY = y + dy;
          const isBlocked = prev.obstacles.some(obs => {
            if (obs.beatPhase !== (Math.floor(now / 600) % 2)) return false;
            return (nextX + 15 > obs.x && nextX - 15 < obs.x + obs.width && nextY + 15 > obs.y && nextY - 15 < obs.y + obs.height);
          });
          if (!isBlocked) { x = nextX; y = nextY; }
        }

        x = Math.max(30, Math.min(GAME_WIDTH - 30, x));
        y = Math.max(30, Math.min(GAME_HEIGHT - 30, y));

        // Interaction Check
        if (keysPressed.current.has(' ')) {
          const target = prev.treasures.find(t => !t.collected && Math.sqrt((t.x - x)**2 + (t.y - y)**2) < 50);
          if (target) {
            triggeredTreasure = target;
            keysPressed.current.delete(' ');
          }
        }

        return { 
          ...prev, 
          playerPos: { x, y }, 
          isHiding: hiding,
          scannerCooldown: Math.max(0, prev.scannerCooldown - 1),
          enemies: prev.enemies.map(e => {
            let nx = e.x, ny = e.y, na = e.angle;
            if (e.type === 'parrot') { na += 0.03; nx += Math.cos(na) * e.speed; ny += Math.sin(na) * e.speed; }
            else { nx += Math.sin(now / 1000) * e.speed * 2; }
            return { ...e, x: nx, y: ny, angle: na };
          })
        };
      });

      // Side effects triggered outside of setGameState for purity
      if (triggeredTreasure) collectTreasure(triggeredTreasure);
      if (keysPressed.current.has('q')) handleScan();
    }, 1000 / 60);
    return () => clearInterval(loop);
  }, [handleScan, collectTreasure, audioStarted]);

  // --- RENDER ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const island = ISLANDS[gameState.currentIslandIndex];
    const now = Date.now();
    const beatPhase = (Math.floor(now / 600) % 2);

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Realistic Gradient Sky
    const sky = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    sky.addColorStop(0, island.bg);
    sky.addColorStop(0.6, '#ffffff');
    sky.addColorStop(1, '#dcfce7');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Distant Hills (Realism)
    ctx.fillStyle = island.color + '22';
    ctx.beginPath();
    ctx.moveTo(0, 400);
    ctx.quadraticCurveTo(200, 300, 400, 400);
    ctx.quadraticCurveTo(600, 500, 800, 350);
    ctx.lineTo(800, 600); ctx.lineTo(0, 600); ctx.fill();

    // Island Ground (Slightly textured sand)
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.roundRect(40, 80, GAME_WIDTH - 80, GAME_HEIGHT - 160, 60);
    ctx.fill();

    // Decorative Rocks & Trees
    drawCliff(ctx, 150, 120, 120, 80, '#94a3b8');
    drawPalm(ctx, 120, 240);
    drawPalm(ctx, 700, 180);
    drawPalm(ctx, 380, 520);

    // Beat Platforms
    gameState.obstacles.forEach(obs => {
      const active = obs.beatPhase === beatPhase;
      ctx.save();
      ctx.shadowBlur = active ? 20 : 0;
      ctx.shadowColor = island.color;
      ctx.fillStyle = active ? island.color : 'rgba(0,0,0,0.08)';
      ctx.beginPath();
      ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 20);
      ctx.fill();
      if (active) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
      }
      ctx.restore();
    });

    // Scanner Ring
    if (gameState.scannerActive) {
      ctx.strokeStyle = island.color + '66';
      ctx.lineWidth = 4;
      const radius = ((now / 3) % gameState.scannerRange);
      ctx.beginPath();
      ctx.arc(gameState.playerPos.x, gameState.playerPos.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Treasures
    gameState.treasures.forEach(t => {
      if (t.collected) return;
      const dist = Math.sqrt((t.x - gameState.playerPos.x)**2 + (t.y - gameState.playerPos.y)**2);
      if (gameState.scannerActive || dist < 120) {
        ctx.save();
        const pulse = Math.sin(now / 300) * 10;
        ctx.shadowBlur = 15; ctx.shadowColor = 'white';
        ctx.font = '36px Arial';
        ctx.fillText(t.type === 'crystal' ? '💎' : t.type === 'relic' ? '🏺' : '📜', t.x - 18, t.y + 10 + pulse);
        ctx.restore();
      }
    });

    // Enemies
    gameState.enemies.forEach(e => {
      ctx.font = '32px Arial';
      ctx.fillText(e.type === 'parrot' ? '🦜' : '🦀', e.x - 16, e.y + 10);
    });

    // Player
    const isMoving = keysPressed.current.has('w') || keysPressed.current.has('s') || keysPressed.current.has('a') || keysPressed.current.has('d');
    drawHuman(ctx, gameState.playerPos.x, gameState.playerPos.y, isMoving, gameState.isHiding);

    // Next Isle Portal
    if (gameState.isLevelCleared) {
      const portalX = GAME_WIDTH - 80, portalY = 300;
      ctx.save();
      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 10;
      ctx.shadowBlur = 20; ctx.shadowColor = '#facc15';
      ctx.beginPath();
      ctx.ellipse(portalX, portalY, 40, 70, now / 500, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      
      const dist = Math.sqrt((portalX - gameState.playerPos.x)**2 + (portalY - gameState.playerPos.y)**2);
      if (dist < 60) {
        const nextIdx = (gameState.currentIslandIndex + 1) % ISLANDS.length;
        setGameState(prev => ({ ...prev, ...initLevel(nextIdx), scannerRange: prev.scannerRange + 30 }));
        playWinFanfare();
      }
    }
  }, [gameState]);

  return (
    <div className="flex flex-col items-center bg-slate-900 p-8 rounded-[50px] shadow-2xl border-b-[12px] border-slate-950 w-full max-w-5xl relative">
      {!audioStarted && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-slate-900/98 backdrop-blur-2xl rounded-[50px]">
          <div className="text-center p-16 bg-white/5 border border-white/10 rounded-[60px] shadow-2xl max-w-lg">
            <div className="w-36 h-36 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-[40px] mx-auto mb-10 flex items-center justify-center shadow-[0_0_60px_rgba(59,130,246,0.5)] animate-bounce">
               <Music size={70} className="text-white" />
            </div>
            <h2 className="text-5xl font-black text-white mb-6 tracking-tight">Echo Isles</h2>
            <p className="text-slate-400 mb-10 text-xl font-medium">Relax, listen, and find the missing melodies hidden in the sand.</p>
            <button 
              onClick={startAudio} 
              className="w-full py-6 bg-orange-400 hover:bg-orange-500 text-white font-black text-2xl rounded-3xl transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-4 group"
            >
              <Volume2 size={32} className="group-hover:rotate-12 transition-transform" /> START EXPLORATION
            </button>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="w-full flex justify-between items-end mb-8 text-white px-4">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-xl rotate-3" style={{ backgroundColor: ISLANDS[gameState.currentIslandIndex].color }}>
            <MapPin size={32} />
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">REGION</h4>
            <p className="text-3xl font-black tracking-tight">{ISLANDS[gameState.currentIslandIndex].name}</p>
          </div>
        </div>
        <div className="flex items-end gap-12">
          <div className="text-right">
            <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">RESTORATION SCORE</h4>
            <p className="text-5xl font-black text-blue-400 tabular-nums leading-none">{gameState.score.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* GAME CANVAS */}
      <div className="relative rounded-[40px] overflow-hidden border-[10px] border-slate-800 shadow-inner group">
        <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="cursor-crosshair bg-white" />
        
        {gameState.isLevelCleared && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="bg-white/10 backdrop-blur-md p-10 rounded-full border border-white/20 animate-pulse">
               <Trophy size={80} className="text-yellow-400 drop-shadow-lg" />
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM TOOLS */}
      <div className="w-full mt-10 grid grid-cols-3 gap-8">
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 flex items-center gap-6 hover:bg-white/10 transition-all cursor-help group">
          <div className="relative w-16 h-16 flex items-center justify-center bg-slate-800 rounded-2xl group-hover:scale-105 transition-transform">
             <Search size={32} className={gameState.scannerActive ? 'text-blue-400 animate-pulse' : 'text-slate-600'} />
             <div className="absolute inset-0 bg-blue-500/20 rounded-2xl" style={{ height: `${gameState.scannerCooldown}%`, top: 'auto', bottom: 0, transition: 'height 0.1s linear' }} />
          </div>
          <div><p className="text-[10px] text-slate-500 uppercase font-black">Scanner [Q]</p><p className="text-xl text-white font-black">PULSE</p></div>
        </div>
        
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 flex items-center gap-6 hover:bg-white/10 transition-all cursor-help group">
          <div className={`w-16 h-16 flex items-center justify-center rounded-2xl transition-all group-hover:scale-105 ${gameState.isHiding ? 'bg-indigo-600 shadow-xl' : 'bg-slate-800'}`}>
             <Shield size={32} className={gameState.isHiding ? 'text-white' : 'text-slate-600'} />
          </div>
          <div><p className="text-[10px] text-slate-500 uppercase font-black">Calm [E]</p><p className="text-xl text-white font-black">{gameState.isHiding ? 'INVIS' : 'READY'}</p></div>
        </div>

        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 flex flex-col justify-center px-8">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">WORLD MELODY</p>
            <p className="text-xs text-orange-400 font-black">RESTORED: {Math.round(((gameState.currentIslandIndex + (gameState.isLevelCleared ? 1 : 0)) / ISLANDS.length) * 100)}%</p>
          </div>
          <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-1">
             <div 
               className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(249,115,22,0.4)]" 
               style={{ width: `${(gameState.currentIslandIndex + (gameState.isLevelCleared ? 1 : 0)) / ISLANDS.length * 100}%` }} 
             />
          </div>
        </div>
      </div>

      {/* LORE MODAL */}
      {activeLore && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-6 animate-fadeIn">
          <div className="bg-white border-[12px] border-orange-100 p-16 rounded-[80px] max-w-2xl relative animate-scaleIn shadow-2xl text-center">
            <button onClick={() => setActiveLore(null)} className="absolute -top-8 -right-8 w-20 h-20 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-orange-500 transition-all shadow-2xl font-black text-4xl">✕</button>
            <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-[40px] mx-auto mb-10 flex items-center justify-center text-white shadow-2xl rotate-3 animate-bounce">
              <Sparkles size={60} />
            </div>
            <h3 className="text-slate-900 font-black text-5xl mb-6 tracking-tight leading-tight">{activeLore.title}</h3>
            <div className="h-1 bg-gradient-to-r from-transparent via-orange-200 to-transparent w-full mb-10" />
            <p className="text-slate-600 text-2xl italic leading-relaxed font-serif px-6 mb-12">"{activeLore.content}"</p>
            <div className="inline-flex items-center gap-4 px-10 py-5 bg-orange-50 text-orange-600 text-sm font-black rounded-3xl border-2 border-orange-100">
              <PalmTreeIcon size={24} /> ECHO RESTORED TO {ISLANDS[gameState.currentIslandIndex].name.toUpperCase()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RhythmGame;
