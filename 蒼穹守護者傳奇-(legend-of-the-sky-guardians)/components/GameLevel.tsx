
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, Hero, ActiveTower, Enemy, TowerType, ProjectileType, GameView, Soldier, EnemyType, Projectile, SelectedTalents } from '../types';
import { LEVELS, TOWER_DEFS, ENEMIES } from '../constants';
import { Play, Pause, Skull, RotateCcw, Crosshair, Zap, BookOpen, ArrowUp } from 'lucide-react';
import Bestiary from './Bestiary';
import { HeroPortrait } from './HeroSelect';

interface GameLevelProps {
  levelId: number;
  hero: Hero;
  selectedTalents: SelectedTalents;
  onExit: () => void;
  onRetry: () => void;
}

const FRAME_RATE = 60;
const PROJECTILE_SPEED = 8;
const AGGRO_RANGE = 90;
const ENGAGE_RANGE = 20;
const CHASE_SPEED = 3.0;
const RETURN_SPEED = 1.5;

const GameLevel: React.FC<GameLevelProps> = ({ levelId, hero, selectedTalents, onExit, onRetry }) => {
  const levelConfig = LEVELS.find(l => l.id === levelId) || LEVELS[0];
  const pathEnd = levelConfig.paths[0][levelConfig.paths[0].length - 1]; 
  
  const getInitialHeroStats = () => {
      let stats = { ...hero.baseStats };
      if (selectedTalents.t1 === 'rin_t1_hp') stats.hp += 300;
      if (selectedTalents.t1 === 'rin_t1_atk') stats.atk += 20;
      if (selectedTalents.t1 === 'sakura_t1_dmg') stats.atk += 25;
      if (selectedTalents.t1 === 'sakura_t1_reload') stats.skillCooldown *= 0.8;
      if (selectedTalents.t1 === 'tamamo_t1_ap') stats.atk += 30;
      if (selectedTalents.t1 === 'tamamo_t1_mp') stats.skillCooldown *= 0.75;
      if (selectedTalents.t1 === 'ibaraki_t1_hp') stats.hp += 400;
      if (selectedTalents.t1 === 'ibaraki_t1_armor') stats.armor += 0.3;
      return { ...stats, maxHp: stats.hp };
  };

  const initialStats = getInitialHeroStats();

  const [gameState, setGameState] = useState<GameState>({
    money: levelConfig.startMoney,
    lives: 20,
    wave: 1,
    activeTowers: [],
    enemies: [],
    projectiles: [],
    particles: [],
    selectedHeroDef: hero,
    heroEntity: {
      x: pathEnd.x, 
      y: pathEnd.y, 
      hp: initialStats.hp,
      maxHp: initialStats.maxHp,
      isDead: false,
      respawnTimer: 0,
      state: 'IDLE',
      skillCooldownTimer: 0,
      isSkillActive: false,
      lastAttackTime: 0,
      talents: selectedTalents
    },
    skillEffect: null,
    gameSpeed: 1,
    isPaused: false,
    selectedTowerId: null,
    score: 0,
    view: GameView.PLAYING
  });

  const [buildMenuOpen, setBuildMenuOpen] = useState<{x: number, y: number} | null>(null);
  const [isSettingRally, setIsSettingRally] = useState(false); 
  const [nextWaveCooldown, setNextWaveCooldown] = useState(0); 
  const [showBestiary, setShowBestiary] = useState(false);
  const [hoveredUpgradeTier, setHoveredUpgradeTier] = useState<number | null>(null);

  const waveStateRef = useRef({
      enemiesSpawned: 0,
      enemiesToSpawn: 10,
      spawnTimer: 0,
      waveCooldown: 0
  });

  const lastTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);
  const lastWaveCallTime = useRef<number>(0);

  const isRangedHero = hero.visualTheme.weaponType === 'BOW' || hero.visualTheme.weaponType === 'GUN' || hero.visualTheme.weaponType === 'MAGIC';
  let heroAttackRange = isRangedHero ? 180 : 30;
  if (selectedTalents.t1 === 'yuki_t1_range') heroAttackRange += 50;

  const getTowerStats = (tower: ActiveTower) => {
    const def = TOWER_DEFS[Object.values(TOWER_DEFS).find(d => d.id === tower.defId)!.type];
    if (tower.tier === 2) return def.t2;
    if (tower.tier === 3 && tower.t3Index !== undefined) return def.t3Options[tower.t3Index];
    return def.t1;
  };

  const getRallyPoint = (tower: ActiveTower, index: number) => {
      if (tower.rallyPoint) {
          const offsetX = index === 0 ? 0 : (index === 1 ? -15 : 15);
          const offsetY = index === 0 ? -10 : 5;
          return { x: tower.rallyPoint.x + offsetX, y: tower.rallyPoint.y + offsetY };
      }
      const offsetX = (index - 1) * 20;
      const offsetY = 30 + (index % 2) * 10;
      return { x: tower.x + offsetX, y: tower.y + offsetY };
  };

  const renderMapDecorations = () => {
    const type = levelConfig.theme.decorationType;
    const decorations = [];
    const seed = levelConfig.id * 100;

    for (let i = 0; i < 40; i++) {
        const x = (Math.sin(seed + i * 1.3) * 400) + 400; 
        const y = (Math.cos(seed + i * 1.7) * 200) + 200; 
        let tooClose = false;
        levelConfig.paths.forEach(path => {
            path.forEach(p => {
                if (Math.sqrt((p.x - x)**2 + (p.y - y)**2) < 40) tooClose = true;
            });
        });
        if (tooClose) continue;

        if (type === 'FOREST') {
            decorations.push(
                <g key={`d-${i}`} transform={`translate(${x},${y})`}>
                    <circle r={14 + (i%5)} fill="#0f3923" opacity="0.4" />
                    <circle r={10 + (i%3)} fill="#14532d" opacity="0.6" />
                </g>
            );
        } else if (type === 'DESERT') {
            decorations.push(
                <g key={`d-${i}`} transform={`translate(${x},${y})`}>
                     <path d="M-5,10 L0,-10 L5,10 Z" fill="#78350f" opacity="0.4"/>
                </g>
            );
        } else if (type === 'SNOW') {
            decorations.push(
                <g key={`d-${i}`} transform={`translate(${x},${y})`}>
                    <circle r={5} fill="white" opacity="0.15" />
                </g>
            );
        } else if (type === 'LAVA') {
             decorations.push(
                <g key={`d-${i}`} transform={`translate(${x},${y})`}>
                    <circle r={8 + (i%6)} fill="#dc2626" opacity="0.15" className="animate-pulse" />
                </g>
            );
        } else if (type === 'VOID') {
             decorations.push(
                <g key={`d-${i}`} transform={`translate(${x},${y})`}>
                    <rect width="10" height="10" fill="#4c1d95" opacity="0.15" transform={`rotate(${i*25})`} />
                </g>
            );
        }
    }
    return decorations;
  };

  const activateHeroSkill = () => {
    if (!gameState.heroEntity || gameState.heroEntity.isDead || gameState.heroEntity.skillCooldownTimer > 0) return;
    
    setGameState(prev => {
        const heroEnt = prev.heroEntity!;
        const enemies = [...prev.enemies];
        const particles = [...prev.particles];
        const newHero = { ...heroEnt, skillCooldownTimer: initialStats.skillCooldown * 60, isSkillActive: true };
        const t3 = heroEnt.talents.t3;
        
        let skillEffect = null;

        switch (hero.id) {
            case 'h_rin': // Rin: Fire Stun AOE
                skillEffect = { type: 'RIN_BLAST', timer: 60, x: heroEnt.x, y: heroEnt.y };
                enemies.forEach(e => {
                     const dist = Math.sqrt((e.x - heroEnt.x)**2 + (e.y - heroEnt.y)**2);
                     let range = 250;
                     if (t3 === 'rin_t3_ult') range = 400; 
                     if (dist < range) { 
                         e.hp -= initialStats.atk * 5;
                         e.stunTime += t3 === 'rin_t3_ult' ? 300 : 180; 
                         particles.push({ id: Math.random().toString(), x: e.x, y: e.y, life: 30, maxLife: 30, color: '#ef4444', radius: 10 });
                     }
                });
                break;
            case 'h_yuki': // Yuki: Global Arrow Rain
                const duration = t3 === 'yuki_t3_ult' ? 240 : 120; 
                skillEffect = { type: 'YUKI_RAIN', timer: duration, x: 400, y: 0 };
                enemies.forEach(e => {
                    if (e.hp > 0) {
                        e.hp -= initialStats.atk * 3;
                        e.freezeTime += 60;
                        particles.push({ id: Math.random().toString(), x: e.x, y: e.y - 20, life: 20, maxLife: 20, color: '#60a5fa', radius: 8 });
                    }
                });
                break;
            case 'h_sakura': // Sakura: Nuke Target
                const target = enemies.reduce((prev, current) => (prev.hp > current.hp) ? prev : current, enemies[0]);
                if (target) {
                    skillEffect = { type: 'SAKURA_LASER', timer: 40, x: heroEnt.x, y: heroEnt.y };
                    const range = t3 === 'sakura_t3_ult' ? 240 : 120; 
                    const dmgMult = t3 === 'sakura_t3_ult' ? 15 : 10; 
                    enemies.forEach(e => {
                         const dist = Math.sqrt((e.x - target.x)**2 + (e.y - target.y)**2);
                         if (dist < range) { e.hp -= initialStats.atk * dmgMult; }
                    });
                     particles.push({ id: Math.random().toString(), x: target.x, y: target.y, life: 60, maxLife: 60, color: '#db2777', radius: range });
                }
                break;
            case 'h_tamamo': // Tamamo: Poison Fog
                const fogTime = t3 === 'tamamo_t3_ult' ? 1200 : 180; 
                skillEffect = { type: 'TAMAMO_FOG', timer: fogTime, x: 400, y: 200 };
                enemies.forEach(e => {
                     e.burnTime += 300;
                     e.freezeTime += 300;
                     e.hp -= initialStats.atk * 2;
                });
                break;
            case 'h_ibaraki': // Ibaraki: Giant Hand
                skillEffect = { type: 'IBARAKI_HAND', timer: 50, x: heroEnt.x, y: heroEnt.y };
                newHero.hp = Math.min(newHero.maxHp, newHero.hp + 500);
                enemies.forEach(e => {
                    const dist = Math.sqrt((e.x - heroEnt.x)**2 + (e.y - heroEnt.y)**2);
                    let range = 300;
                    if (t3 === 'ibaraki_t3_ult') range = 450;
                    if (dist < range) { 
                        e.hp -= initialStats.atk * 4; 
                        if (t3 === 'ibaraki_t3_ult' && e.hp < e.maxHp * 0.2) e.hp = 0;
                    }
                });
                break;
        }

        return { ...prev, heroEntity: newHero, enemies: enemies, particles: particles, skillEffect: skillEffect as any };
    });

    setTimeout(() => {
        setGameState(p => ({...p, heroEntity: {...p.heroEntity!, isSkillActive: false}}));
    }, 1000);
  };

  const renderSkillEffect = () => {
      const effect = gameState.skillEffect;
      if (!effect) return null;

      switch(effect.type) {
          case 'RIN_BLAST':
              return (
                  <g>
                      <circle cx={effect.x} cy={effect.y} r={200 - effect.timer * 2} fill="#ef4444" opacity={effect.timer/60 * 0.5} />
                      <circle cx={effect.x} cy={effect.y} r={150 - effect.timer} stroke="#fbbf24" strokeWidth="4" fill="none" opacity={effect.timer/60} />
                  </g>
              );
          case 'YUKI_RAIN':
               return (
                   <g>
                       {Array.from({length: 20}).map((_, i) => (
                           <line 
                             key={i} 
                             x1={i * 40 + (Math.sin(effect.timer)*20)} 
                             y1={0 + (120 - effect.timer)*10} 
                             x2={i * 40 + (Math.sin(effect.timer)*20)} 
                             y2={50 + (120 - effect.timer)*10} 
                             stroke="#60a5fa" 
                             strokeWidth="2" 
                             opacity={effect.timer/120} 
                           />
                       ))}
                       <rect width="800" height="400" fill="#3b82f6" opacity={0.1} />
                   </g>
               );
           case 'SAKURA_LASER':
               return (
                   <g>
                       <line x1={effect.x} y1={effect.y} x2={effect.x + 800} y2={effect.y} stroke="#db2777" strokeWidth={effect.timer} opacity={effect.timer/40} strokeLinecap="round" />
                   </g>
               );
           case 'TAMAMO_FOG':
                return (
                    <g>
                        <rect width="800" height="400" fill="#581c87" opacity={0.3 + Math.sin(effect.timer/10)*0.1} />
                    </g>
                );
           case 'IBARAKI_HAND':
                const s = 1 - (effect.timer/50);
                return (
                    <g transform={`translate(${effect.x}, ${effect.y}) scale(${s*2})`}>
                        <circle r="40" fill="#dc2626" opacity="0.4" />
                    </g>
                );
      }
      return null;
  };

  const upgradeTower = (towerId: string, t3Index?: number) => {
      setGameState(prev => {
          const towerIndex = prev.activeTowers.findIndex(t => t.id === towerId);
          if (towerIndex === -1) return prev;
          
          const tower = prev.activeTowers[towerIndex];
          const def = TOWER_DEFS[Object.values(TOWER_DEFS).find(d => d.id === tower.defId)!.type];
          
          let cost = 0;
          let newTier: 1 | 2 | 3 = tower.tier;
          
          if (tower.tier === 1) {
              cost = def.t2.cost;
              newTier = 2;
          } else if (tower.tier === 2 && t3Index !== undefined) {
              cost = def.t3Options[t3Index].cost;
              newTier = 3;
          }
          
          if (prev.money < cost) return prev;

          const updatedTowers = [...prev.activeTowers];
          updatedTowers[towerIndex] = {
              ...tower,
              tier: newTier,
              t3Index: t3Index,
              level: tower.level + 1
          };

          return {
              ...prev,
              money: prev.money - cost,
              activeTowers: updatedTowers
          };
      });
  };

  const updateGame = useCallback((time: number) => {
    if (gameState.isPaused || gameState.view === GameView.GAME_OVER || showBestiary) {
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(updateGame);
      return;
    }

    const deltaTime = time - lastTimeRef.current;
    
    if (deltaTime > 1000 / FRAME_RATE) {
      if (lastWaveCallTime.current > 0) {
          const diff = Date.now() - lastWaveCallTime.current;
          setNextWaveCooldown(Math.max(0, 5000 - diff));
      }

      setGameState(prev => {
        let newMoney = prev.money;
        let newLives = prev.lives;
        let newWave = prev.wave;
        let newProjectiles = [...prev.projectiles];
        let newParticles = prev.particles.map(p => ({...p, life: p.life - 1})).filter(p => p.life > 0);
        let newTowers = [...prev.activeTowers];
        let currentEnemies = [...prev.enemies];
        let skillEffect = prev.skillEffect;

        if (skillEffect) {
            skillEffect = { ...skillEffect, timer: skillEffect.timer - 1 };
            if (skillEffect.timer <= 0) skillEffect = null;
        }

        if (currentEnemies.length === 0 && waveStateRef.current.enemiesSpawned >= waveStateRef.current.enemiesToSpawn) {
            waveStateRef.current.waveCooldown++;
            if (waveStateRef.current.waveCooldown > 120) { 
                // 波次完成獎勵計算
                newMoney += 100 + (newWave * 10); // 基於當前波次計算獎勵
                newWave++;
                // 重置波次狀態
                waveStateRef.current.enemiesSpawned = 0;
                waveStateRef.current.enemiesToSpawn = 10 + Math.floor(newWave * 1.5); // 使用新波次計算敵人數
                waveStateRef.current.spawnTimer = 0; // 重置生成計時器
                waveStateRef.current.waveCooldown = 0;
            }
        }

        let newHero = { ...prev.heroEntity! };
        if (newHero.skillCooldownTimer > 0) newHero.skillCooldownTimer--;
        
            if (newHero.isDead) {
            newHero.respawnTimer--;
            if (newHero.respawnTimer <= 0) {
                newHero.isDead = false;
                newHero.hp = newHero.maxHp;
                newHero.state = 'IDLE';
                newHero.x = pathEnd.x;
                newHero.y = pathEnd.y;
                newHero.fightingEnemyId = null;
            }
        } else {
             if (newHero.state === 'MOVING' && newHero.targetX !== undefined) {
                const dx = newHero.targetX - newHero.x;
                const dy = newHero.targetY! - newHero.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist <= CHASE_SPEED) {
                    newHero.x = newHero.targetX;
                    newHero.y = newHero.targetY!;
                    newHero.state = 'IDLE';
                } else {
                    newHero.x += (dx/dist) * CHASE_SPEED;
                    newHero.y += (dy/dist) * CHASE_SPEED;
                }
                newHero.fightingEnemyId = null; 
            }
            if (newHero.state !== 'FIGHTING' && newHero.hp < newHero.maxHp) newHero.hp += 0.1; // 每秒回復 ~6 點血量

            if (isRangedHero && newHero.state !== 'MOVING' && newHero.state !== 'FIGHTING') {
                 const now = Date.now();
                 // 基於武器類型設定攻擊速率：槍手 600ms，弓手 800ms，魔法 1000ms
                 let attackRate = 800;
                 if (hero.visualTheme.weaponType === 'GUN') attackRate = 600;
                 if (hero.visualTheme.weaponType === 'MAGIC') attackRate = 1000;
                 
                 if (now - newHero.lastAttackTime > attackRate) {
                     const target = currentEnemies.find(e => {
                         const d = Math.sqrt((e.x - newHero.x)**2 + (e.y - newHero.y)**2);
                         return d < heroAttackRange && e.hp > 0;
                     });

                     if (target) {
                         newHero.lastAttackTime = now;
                         let projType = ProjectileType.ARROW;
                         if (hero.visualTheme.weaponType === 'GUN') projType = ProjectileType.BOMB;
                         if (hero.visualTheme.weaponType === 'MAGIC') projType = ProjectileType.MAGIC;
                         
                         let damage = initialStats.atk;
                         if (selectedTalents.t2 === 'yuki_t2_crit' && Math.random() < 0.2) damage *= 2.5; 
                         if (selectedTalents.t2 === 'sakura_t2_headshot' && target.hp < target.maxHp * 0.3) damage *= 2;

                         newProjectiles.push({
                            id: `hp_${Math.random()}`,
                            x: newHero.x,
                            y: newHero.y - 15,
                            targetId: target.id,
                            speed: 10,
                            damage: damage,
                            type: projType,
                            hit: false,
                            isHeroProjectile: true
                         });
                     }
                 }
            }
        }

        newTowers = newTowers.map((tower, tIdx) => {
            const stats = getTowerStats(tower);
            const now = Date.now();

            // 圖騰效果計算
            if (tower.defId === 'support') {
                const range = stats.range;
                const t3Idx = tower.t3Index ?? 0;
                
                // 對附近所有防禦塔施加增益效果
                newTowers.forEach(otherTower => {
                    if (otherTower.id === tower.id) return; // 不作用於自己
                    const dist = Math.sqrt((otherTower.x - tower.x)**2 + (otherTower.y - tower.y)**2);
                    if (dist > range) return; // 超出範圍
                    
                    // 嗜血圖騰（T3-0）：提升周圍塔的攻擊速度 40%
                    if (t3Idx === 0) {
                        const buff = 0.4;
                        // 記錄到塔上（用於射擊邏輯）
                        if (!otherTower.supportBuff) otherTower.supportBuff = {};
                        otherTower.supportBuff.speedBoost = buff;
                    }
                    
                    // 恐懼圖騰（T3-1）：使周圍敵人減速 30%
                    if (t3Idx === 1) {
                        // 對範圍內敵人應用減速
                        currentEnemies.forEach(e => {
                            const eDist = Math.sqrt((e.x - tower.x)**2 + (e.y - tower.y)**2);
                            if (eDist < range && e.freezeTime < 60) {
                                e.freezeTime = 60; // 保持最少 60 幀減速
                            }
                        });
                    }
                    
                    // 靈魂連結（T3-2）：均攤傷害並治療士兵
                    if (t3Idx === 2) {
                        if (otherTower.defId === 'barracks' && otherTower.soldiers) {
                            otherTower.soldiers.forEach(s => {
                                if (!s.isDead && s.hp < (stats.soldierHp || 100)) {
                                    s.hp = Math.min((stats.soldierHp || 100), s.hp + 1); // 每幀治療 1 點
                                }
                            });
                        }
                    }
                });
                return tower;
            }

            if (tower.defId === 'barracks') {
                const updatedSoldiers = tower.soldiers.map((soldier, sIdx) => {
                    if (soldier.isDead) {
                        soldier.respawnTime--;
                        // 根據塔的層級調整重生時間：T1=300幀, T2=200幀, T3=150幀
                        if (soldier.respawnTime <= 0) return { ...soldier, isDead: false, hp: stats.soldierHp || 100, targetEnemyId: null };
                        return soldier;
                    }
                    let target = null;
                    if (soldier.targetEnemyId) {
                        target = currentEnemies.find(e => e.id === soldier.targetEnemyId && e.hp > 0 && !e.isFlying);
                        if (target) {
                             const d = Math.sqrt((target.x - soldier.x)**2 + (target.y - soldier.y)**2);
                             if (d > 150) target = null;
                        }
                        if (!target) soldier.targetEnemyId = null;
                    }
                    
                    if (!target) {
                        let closest = null;
                        let minDst = Infinity;
                        for (const e of currentEnemies) {
                            if (e.hp <= 0 || e.isFlying) continue;
                            if (e.isBlocked && e.blockedBy !== soldier.id) continue;
                            const d = Math.sqrt((e.x - soldier.x)**2 + (e.y - soldier.y)**2);
                            if (d < AGGRO_RANGE && d < minDst) {
                                minDst = d;
                                closest = e;
                            }
                        }
                        if (closest) {
                            soldier.targetEnemyId = closest.id;
                            target = closest;
                        }
                    }

                    const rally = getRallyPoint(tower, parseInt(soldier.id.split('_')[2]));
                    
                    if (target) {
                         const dx = target.x - soldier.x;
                         const dy = target.y - soldier.y;
                         const dist = Math.sqrt(dx*dx + dy*dy);
                         
                         if (dist <= ENGAGE_RANGE) {
                             target.isBlocked = true;
                             target.blockedBy = soldier.id;
                             const angle = Math.atan2(dy, dx);
                             target.x = soldier.x + Math.cos(angle) * 12; 
                             target.y = soldier.y + Math.sin(angle) * 12;
                             
                             if (Math.random() < 0.05) { 
                                 target.hp -= soldier.damage;
                                 newParticles.push({ id: Math.random().toString(), x: target.x, y: target.y, life: 5, maxLife: 5, color: '#fff', radius: 4 });
                             }
                             if (Math.random() < 0.03 && target.stunTime <= 0) {
                                 let dmg = 5;
                                 if(stats.soldierArmor) dmg = Math.max(1, 5 * (1 - stats.soldierArmor));
                                 soldier.hp -= dmg; 
                             }
                         } else {
                             soldier.x += (dx/dist) * CHASE_SPEED;
                             soldier.y += (dy/dist) * CHASE_SPEED;
                         }
                    } else {
                        const dx = rally.x - soldier.x;
                        const dy = rally.y - soldier.y;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        if (dist > 2) {
                            soldier.x += (dx/dist) * RETURN_SPEED;
                            soldier.y += (dy/dist) * RETURN_SPEED;
                        } else {
                            soldier.x = rally.x;
                            soldier.y = rally.y;
                        }
                    }
                    
                    if (soldier.hp <= 0) {
                        soldier.isDead = true;
                        soldier.respawnTime = 300;
                        if (soldier.targetEnemyId) {
                             const e = currentEnemies.find(en => en.id === soldier.targetEnemyId);
                             if (e && e.blockedBy === soldier.id) { 
                                 e.isBlocked = false; 
                                 e.blockedBy = null; 
                             }
                        }
                        soldier.targetEnemyId = null;
                    } else if (soldier.hp < (stats.soldierHp || 100) && !soldier.targetEnemyId) {
                        soldier.hp += 0.5;
                    }
                    return soldier;
                });
                tower.soldiers = updatedSoldiers;
                return tower;
            }
            if (stats.damage > 0 && now - tower.lastAttackTime > stats.rate) {
                const target = currentEnemies.find(e => {
                    const dx = e.x - tower.x;
                    const dy = e.y - tower.y;
                    return Math.sqrt(dx*dx + dy*dy) <= stats.range && e.hp > 0;
                });
                if (target) {
                    if (stats.projectileType) {
                        newProjectiles.push({
                            id: Math.random().toString(),
                            x: tower.x,
                            y: tower.y - 20,
                            targetId: target.id,
                            speed: PROJECTILE_SPEED,
                            damage: stats.damage,
                            type: stats.projectileType,
                            splashRadius: stats.splashRadius,
                            hit: false
                        });
                    }
                    return { ...tower, lastAttackTime: now };
                }
            }
             if (tower.defId === 'gold_mine' && now - tower.lastAttackTime > stats.rate) {
                newMoney += (tower.tier === 1 ? 15 : tower.tier === 2 ? 35 : 50);
                newParticles.push({ id: Math.random().toString(), x: tower.x, y: tower.y - 10, life: 30, maxLife: 30, color: '#fcd34d', radius: 15 });
                return { ...tower, lastAttackTime: now };
            }
            return tower;
        });

        const activeEnemies = currentEnemies.map(e => {
            if (e.hp <= 0) return { ...e, dead: true };
            let moveSpeed = e.speed;
            if (e.freezeTime > 0) { moveSpeed *= 0.5; e.freezeTime--; }
            if (e.burnTime > 0) { e.hp -= 0.5; e.burnTime--; }
            if (e.stunTime > 0) { moveSpeed = 0; e.stunTime--; }
            if (e.isBlocked && e.stunTime <= 0) moveSpeed = 0;

            if (selectedTalents.t2 === 'rin_t2_burn' && !newHero.isDead) {
                const dist = Math.sqrt((e.x - newHero.x)**2 + (e.y - newHero.y)**2);
                if (dist < 100) e.hp -= 0.25; 
            }

            if (!isRangedHero && !e.isFlying && !e.isBlocked && !newHero.isDead && newHero.state !== 'MOVING') {
                 const dist = Math.sqrt((e.x - newHero.x)**2 + (e.y - newHero.y)**2);
                 if (dist < 30) {
                     e.isBlocked = true;
                     e.blockedBy = 'hero';
                     newHero.state = 'FIGHTING';
                     newHero.fightingEnemyId = e.id;
                     moveSpeed = 0;
                 }
            }
            
            if (isRangedHero && !e.isBlocked && !newHero.isDead && newHero.state !== 'MOVING') {
                const dist = Math.sqrt((e.x - newHero.x)**2 + (e.y - newHero.y)**2);
                if (dist < 10) {
                     e.isBlocked = true;
                     e.blockedBy = 'hero';
                     newHero.state = 'FIGHTING';
                     newHero.fightingEnemyId = e.id;
                     moveSpeed = 0;
                }
            }

            if (e.blockedBy === 'hero' && newHero.fightingEnemyId === e.id) {
                 if (Math.random() < 0.1 && e.stunTime <= 0) {
                     if (selectedTalents.t2 === 'rin_t2_thorns') e.hp -= 5 * 0.3;
                     newHero.hp -= 5;
                 }
                 if (Math.random() < 0.1) {
                     let dmg = initialStats.atk;
                     if (selectedTalents.t2 === 'ibaraki_t2_lifesteal') newHero.hp += dmg * 0.2;
                     e.hp -= dmg;
                     newParticles.push({ id: Math.random().toString(), x: e.x, y: e.y, life: 8, maxLife: 8, color: '#fbbf24', radius: 8 });
                 }
                 if (newHero.hp <= 0) {
                     newHero.isDead = true;
                     newHero.respawnTimer = hero.baseStats.respawnTime * 60;
                     e.isBlocked = false;
                     e.blockedBy = null;
                 }
            }

            if (!e.isBlocked && moveSpeed > 0) {
                const path = levelConfig.paths[e.pathId];
                if (!path || e.pathIndex >= path.length - 1) return { ...e, finished: true };
                const target = path[e.pathIndex + 1];
                const dx = target.x - e.x;
                const dy = target.y - e.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist <= moveSpeed) return { ...e, x: target.x, y: target.y, pathIndex: e.pathIndex + 1 };
                else return { ...e, x: e.x + (dx/dist)*moveSpeed, y: e.y + (dy/dist)*moveSpeed };
            }
            return e;
        });

        const survivingEnemies: Enemy[] = [];
        activeEnemies.forEach(e => {
            if ((e as any).dead) {
              const def = ENEMIES[e.defId];
              newMoney += def.reward;
              newParticles.push({ id: Math.random().toString(), x: e.x, y: e.y, life: 20, maxLife: 20, color: def.visualColor, radius: 10 });
              if (newHero.fightingEnemyId === e.id) { newHero.state = 'IDLE'; newHero.fightingEnemyId = null; }
            } else if ((e as any).finished) {
              newLives -= 1;
              if (newHero.fightingEnemyId === e.id) { newHero.state = 'IDLE'; newHero.fightingEnemyId = null; }
            } else {
              survivingEnemies.push(e);
            }
        });

        const activeProjectiles: Projectile[] = [];
        newProjectiles.forEach(p => {
            const target = survivingEnemies.find(e => e.id === p.targetId);
            let tx = p.x, ty = p.y;
            if (target) { tx = target.x; ty = target.y; }
            else if (p.type !== ProjectileType.BOMB) return;

            const dx = tx - p.x;
            const dy = ty - p.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist <= p.speed) {
                if (p.splashRadius) {
                    newParticles.push({ id: Math.random().toString(), x: tx, y: ty, life: 30, maxLife: 30, color: '#f59e0b', radius: p.splashRadius });
                    survivingEnemies.forEach(e => {
                        if (Math.sqrt((e.x - tx)**2 + (e.y - ty)**2) <= p.splashRadius!) e.hp -= p.damage;
                    });
                } else {
                    if (target) {
                        target.hp -= p.damage;
                        if (p.type === ProjectileType.MAGIC) target.freezeTime = 30;
                        if (p.isHeroProjectile && selectedTalents.t2 === 'tamamo_t2_slow') target.freezeTime = 120;
                        if (p.isHeroProjectile) newParticles.push({ id: Math.random().toString(), x: tx, y: ty, life: 10, maxLife: 10, color: hero.visualTheme.primaryColor, radius: 6 });
                    }
                }
            } else {
                activeProjectiles.push({ ...p, x: p.x + (dx / dist) * p.speed, y: p.y + (dy / dist) * p.speed });
            }
        });

        waveStateRef.current.spawnTimer++;
        // 隨波次加速，但限制最快 30 幀（保證可控）
        const spawnInterval = Math.max(30, 100 - (newWave * 4)); 
        
        if (waveStateRef.current.enemiesSpawned < waveStateRef.current.enemiesToSpawn && waveStateRef.current.spawnTimer > spawnInterval) {
            waveStateRef.current.spawnTimer = 0;
            waveStateRef.current.enemiesSpawned++;
            const pathId = Math.floor(Math.random() * levelConfig.paths.length);
            const path = levelConfig.paths[pathId];
            const enemyTypes = Object.values(EnemyType);
            let typeIndex = 0;
            // 根據波次逐步解鎖敵人類型
            if (newWave > 15) typeIndex = Math.floor(Math.random() * 9); // 不包括 BOSS
            else if (newWave > 10) typeIndex = Math.floor(Math.random() * 8);
            else if (newWave > 5) typeIndex = Math.floor(Math.random() * 6);
            else typeIndex = Math.floor(Math.random() * 4);
            // 每 5 波有概率出現 BOSS（VOID_LORD）
            if (newWave > 0 && newWave % 5 === 0 && Math.random() > 0.7) typeIndex = 9; 
            const def = ENEMIES[enemyTypes[typeIndex]];
            const scale = Math.pow(1.10, newWave - 1); 

            survivingEnemies.push({
                id: `e_${newWave}_${Math.random()}`,
                defId: def.type,
                x: path[0].x,
                y: path[0].y,
                hp: Math.floor(def.baseHp * scale),
                maxHp: Math.floor(def.baseHp * scale),
                speed: def.baseSpeed,
                pathId: pathId,
                pathIndex: 0,
                isFlying: def.isFlying,
                freezeTime: 0,
                burnTime: 0,
                stunTime: 0,
                isBlocked: false,
                blockedBy: null
            });
        }

        if (newLives <= 0) prev.view = GameView.GAME_OVER;

        return {
            ...prev,
            activeTowers: newTowers,
            enemies: survivingEnemies,
            projectiles: activeProjectiles,
            particles: newParticles,
            lives: newLives,
            money: newMoney + 0.05,
            wave: newWave,
            heroEntity: newHero,
            skillEffect: skillEffect
        };
      });
      lastTimeRef.current = time;
    }
    requestRef.current = requestAnimationFrame(updateGame);
  }, [gameState.isPaused, levelConfig, gameState.view, showBestiary]);

  const StatRow = ({label, value, nextValue}: {label: string, value: string, nextValue?: string}) => (
      <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">{label}</span>
          <div className="flex gap-2">
              <span className="font-mono text-white">{value}</span>
              {nextValue && <span className="font-mono text-green-400">→ {nextValue}</span>}
          </div>
      </div>
  );

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [updateGame]);

  const callNextWave = () => {
      const now = Date.now();
      if (now - lastWaveCallTime.current < 5000) return;
      lastWaveCallTime.current = now;
      setNextWaveCooldown(5000);
      // 手動呼叫下一波時，將 waveCooldown 設為 120 以觸發波次轉換
      // 這樣下一次 updateGame 就會立即轉換波次
      waveStateRef.current.waveCooldown = 121; // 超過 120 的閾值立即觸發
  };
  
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const svg = e.currentTarget.querySelector('svg');
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      if (isSettingRally && gameState.selectedTowerId) {
          const tower = gameState.activeTowers.find(t => t.id === gameState.selectedTowerId);
          if (tower) {
              const range = getTowerStats(tower).range;
              const dist = Math.sqrt((clickX - tower.x)**2 + (clickY - tower.y)**2);
              if (dist <= range) {
                   setGameState(p => ({ ...p, activeTowers: p.activeTowers.map(t => t.id === tower.id ? {...t, rallyPoint: {x: clickX, y: clickY}} : t) }));
              }
              setIsSettingRally(false);
              return;
          }
      }
      
      const clickedSlot = levelConfig.buildSlots.find(slot => Math.sqrt((slot.x - clickX)**2 + (slot.y - clickY)**2) < 25);
      if (clickedSlot) {
          const existingTower = gameState.activeTowers.find(t => t.x === clickedSlot.x && t.y === clickedSlot.y);
          if (existingTower) {
              setGameState(p => ({...p, selectedTowerId: existingTower.id}));
              setBuildMenuOpen(null);
          } else {
              setGameState(p => ({...p, selectedTowerId: null}));
              setBuildMenuOpen({x: clickedSlot.x, y: clickedSlot.y});
          }
          setIsSettingRally(false);
          return;
      }
      
      if (!gameState.heroEntity?.isDead) {
          setGameState(p => ({
              ...p, selectedTowerId: null, buildMenuOpen: null,
              heroEntity: { ...p.heroEntity!, state: 'MOVING', targetX: clickX, targetY: clickY, fightingEnemyId: null }
          }));
          setGameState(p => ({...p, particles: [...p.particles, {id: Math.random().toString(), x: clickX, y: clickY, life: 10, maxLife: 10, radius: 5, color: '#60a5fa'}]}));
      }
      setBuildMenuOpen(null);
      setIsSettingRally(false);
  };
  
  const buildTower = (type: TowerType) => {
    if (!buildMenuOpen) return;
    const def = TOWER_DEFS[type];
    if (gameState.money >= def.t1.cost) {
        let initialSoldiers: Soldier[] = [];
        if (type === TowerType.BARRACKS) {
            initialSoldiers = [1,2,3].map(i => ({
                id: `s_${Math.random()}_${i}`, x: buildMenuOpen.x + (Math.random()*20 - 10), y: buildMenuOpen.y + 30,
                hp: def.t1.soldierHp || 100, maxHp: def.t1.soldierHp || 100, damage: def.t1.damage, respawnTime: 0, isDead: false, targetEnemyId: null
            }));
        }
        setGameState(prev => ({
            ...prev, money: prev.money - def.t1.cost,
            activeTowers: [...prev.activeTowers, { id: Math.random().toString(), x: buildMenuOpen.x, y: buildMenuOpen.y, defId: def.id, tier: 1, lastAttackTime: 0, level: 1, soldiers: initialSoldiers }]
        }));
        setBuildMenuOpen(null);
    }
  };
  
  const renderEnemy = (enemy: Enemy) => {
      const def = ENEMIES[enemy.defId];
      const color = def.visualColor;
      return (
          <g>
              <rect x="-6" y="-8" width="12" height="16" fill={color} />
              <rect x="-4" y="-6" width="4" height="4" fill="white" opacity="0.5" />
              <rect x="-6" y="8" width="4" height="4" fill="black" />
              <rect x="2" y="8" width="4" height="4" fill="black" />
              {def.isFlying && <path d="M-10,-5 L-6,-2 M10,-5 L6,-2" stroke="white" strokeWidth="2" />}
              {enemy.stunTime > 0 && <path d="M-8,-15 L-4,-18 L0,-15 L4,-18 L8,-15" stroke="yellow" fill="none" strokeWidth="2" className="animate-spin origin-center" />}
          </g>
      );
  };
  
  const renderTowerVisual = (tower: ActiveTower) => {
      const def = TOWER_DEFS[Object.values(TOWER_DEFS).find(d => d.id === tower.defId)!.type];
      const tier = tower.tier;
      const t3Idx = tower.t3Index ?? 0;

      if (def.type === TowerType.BARRACKS) {
          if (tier === 1) return <g><path d="M-12,10 L0,-12 L12,10 Z" fill="#475569" stroke="#1e293b" strokeWidth="2"/><rect x="-4" y="2" width="8" height="8" fill="#1e1b4b"/></g>;
          if (tier === 2) return <g><rect x="-14" y="-12" width="28" height="24" fill="#334155" stroke="#0f172a" strokeWidth="2"/><path d="M-14,-12 L-14,-16 L-10,-12 L-6,-16 L-2,-12 L2,-16 L6,-12 L10,-16 L14,-12" fill="#334155" stroke="#0f172a" strokeWidth="2"/><rect x="-6" y="2" width="12" height="10" fill="#451a03"/></g>;
          if (tier === 3) {
             // Paladin (T3-0): Golden Castle + Cross
             if (t3Idx === 0) return <g><rect x="-16" y="-14" width="32" height="28" fill="#fcd34d" stroke="#b45309" strokeWidth="2"/><path d="M0,-14 L0,-24 M-5,-20 L5,-20" stroke="#fef08a" strokeWidth="3"/><rect x="-8" y="0" width="16" height="14" fill="#b45309"/></g>;
             // Barbarian (T3-1): Red Spiked Arena + Axes
             if (t3Idx === 1) return <g><path d="M-15,10 L-10,-15 L10,-15 L15,10 Z" fill="#b91c1c" stroke="#450a0a" strokeWidth="2"/><path d="M-18,-5 L-10,5 M18,-5 L10,5" stroke="#fca5a5" strokeWidth="3"/><rect x="-6" y="0" width="12" height="10" fill="#2a0a0a"/></g>;
             // Assassin (T3-2): Dark Dojo + Dagger
             return <g><rect x="-14" y="-14" width="28" height="28" rx="4" fill="#312e81" stroke="#3b0764" strokeWidth="2"/><path d="M-14,-14 L14,14 M-14,14 L14,-14" stroke="#818cf8" strokeWidth="2"/><rect x="-6" y="2" width="12" height="12" fill="#020617"/></g>;
          }
      } else if (def.type === TowerType.ARCHER) {
          if (tier === 1) return <g><rect x="-6" y="-20" width="12" height="30" fill="#a16207" stroke="#451a03" strokeWidth="2"/><rect x="-8" y="-22" width="16" height="8" fill="#78350f"/></g>;
          if (tier === 2) return <g><rect x="-8" y="-25" width="16" height="40" fill="#78350f" stroke="#2a0a0a" strokeWidth="2"/><rect x="-10" y="-28" width="20" height="10" fill="#57534e"/><path d="M-5,-10 L-5,0 M5,-10 L5,0" stroke="#2a0a0a"/></g>;
          if (tier === 3) {
             // Sniper (T3-0): Black Iron Tower + Rifle
             if (t3Idx === 0) return <g><rect x="-8" y="-25" width="16" height="35" fill="#1e293b" stroke="#0f172a"/><circle cx="0" cy="-25" r="8" fill="#94a3b8"/><rect x="4" y="-28" width="20" height="6" fill="#000000"/></g>;
             // Ranger (T3-1): Green Tree House
             if (t3Idx === 1) return <g><rect x="-6" y="-25" width="12" height="35" fill="#166534"/><path d="M-10,10 L-10,-20 L-6,-25 L6,-25 L10,-20 L10,10" fill="none" stroke="#22c55e" strokeWidth="2"/><circle cx="0" cy="-25" r="4" fill="#dcfce7"/></g>;
             // Poison (T3-2): Purple Vines
             return <g><rect x="-6" y="-25" width="12" height="35" fill="#3f6212"/><path d="M-10,10 Q-15,0 -5,-10 Q5,-20 10,-30" fill="none" stroke="#a3e635" strokeWidth="2"/><circle cx="0" cy="-25" r="5" fill="#bef264"/></g>;
          }
      } else if (def.type === TowerType.MAGE) {
          if (tier === 1) return <g><path d="M-8,10 L0,-20 L8,10 Z" fill="#6b21a8"/><circle cx="0" cy="-25" r="5" fill="#d8b4fe" className="animate-pulse"/></g>;
          if (tier === 2) return <g><rect x="-8" y="-10" width="16" height="20" fill="#581c87"/><path d="M-8,-10 L0,-30 L8,-10" fill="#7e22ce"/><circle cx="0" cy="-35" r="6" fill="#c084fc" className="animate-pulse"/></g>;
          if (tier === 3) {
              // Arcane (T3-0): Pink Crystal Spire
              if (t3Idx === 0) return <g><path d="M-8,10 L0,-20 L8,10 Z" fill="#be185d"/><circle cx="0" cy="-25" r="8" fill="#f472b6" className="animate-pulse"/><path d="M0,-25 L0,-40" stroke="#fbcfe8" strokeWidth="2"/></g>;
              // Necro (T3-1): Blue Skull Tower
              if (t3Idx === 1) return <g><rect x="-8" y="-15" width="16" height="25" fill="#172554"/><circle cx="0" cy="-25" r="7" fill="#60a5fa" opacity="0.5"/><path d="M-4,-25 L4,-25 M0,-29 L0,-21" stroke="#93c5fd"/></g>;
              // Golem (T3-2): Purple Summoning Circle
              return <g><rect x="-10" y="-10" width="20" height="20" fill="#a855f7"/><rect x="-6" y="-20" width="12" height="10" fill="#d8b4fe"/><circle cx="0" cy="-25" r="5" fill="white" className="animate-pulse"/></g>;
          }
      } else if (def.type === TowerType.CANNON) {
          if (tier === 1) return <g><rect x="-10" y="-5" width="20" height="15" fill="#1f2937"/><circle cx="0" cy="0" r="8" fill="#4b5563"/><rect x="0" y="-4" width="14" height="8" fill="#111827" transform="rotate(-30)"/></g>;
          if (tier === 2) return <g><rect x="-12" y="-8" width="24" height="18" fill="#111827"/><circle cx="0" cy="-2" r="10" fill="#374155"/><rect x="0" y="-6" width="18" height="12" fill="#020617" transform="rotate(-30)"/></g>;
          if (tier === 3) {
              // Tesla (T3-0): Cyan Coil
              if (t3Idx === 0) return <g><rect x="-10" y="-10" width="20" height="20" fill="#0e7490"/><path d="M-5,-10 L0,-25 L5,-10" fill="none" stroke="#67e8f9" strokeWidth="2"/><circle cx="0" cy="-25" r="4" fill="#a5f3fc" className="animate-pulse"/></g>;
              // Bertha (T3-1): Massive Black Cannon
              if (t3Idx === 1) return <g><rect x="-14" y="-8" width="28" height="18" fill="#1e1b4b"/><circle cx="0" cy="-2" r="12" fill="#0f172a"/><rect x="0" y="-8" width="24" height="16" fill="black" transform="rotate(-30)"/></g>;
              // Mecha (T3-2): Red Missile Pod
              return <g><rect x="-10" y="-10" width="20" height="20" fill="#991b1b"/><rect x="-14" y="-5" width="4" height="12" fill="#450a0a"/><rect x="10" y="-5" width="4" height="12" fill="#450a0a"/><circle cx="0" cy="-5" r="6" fill="#fca5a5"/></g>;
          }
      } else if (def.type === TowerType.GOLD_MINE) {
          return <g><path d="M-15,10 Q0,-5 15,10" fill="none" stroke="#713f12" strokeWidth="4"/><circle cx="0" cy="5" r="3" fill="#fbbf24"/><circle cx="-6" cy="8" r="3" fill="#fbbf24"/><circle cx="6" cy="8" r="3" fill="#fbbf24"/></g>;
      } else {
          return <g><rect x="-6" y="-15" width="12" height="30" fill="#57534e"/><path d="M-10,-5 L10,-5 M-8,5 L8,5" stroke="#a8a29e" strokeWidth="2"/><circle cx="0" cy="-15" r="6" fill="#ef4444" opacity="0.5"/></g>;
      }
      return <circle r="10" fill="gray" />;
  };
  
  const getSoldierColor = (tower: ActiveTower): {fill: string, stroke: string} => {
    if (tower.tier === 1) return { fill: '#60a5fa', stroke: '#1e3a8a' }; // Blue
    if (tower.tier === 2) return { fill: '#94a3b8', stroke: '#0f172a' }; // Grey Iron
    if (tower.t3Index === 0) return { fill: '#facc15', stroke: '#854d0e' }; // Gold (Paladin)
    if (tower.t3Index === 1) return { fill: '#f87171', stroke: '#7f1d1d' }; // Red (Barbarian)
    return { fill: '#a78bfa', stroke: '#4c1d95' }; // Purple (Assassin)
  };

  const selectedTower = gameState.selectedTowerId 
    ? gameState.activeTowers.find(t => t.id === gameState.selectedTowerId) 
    : null;
  const selectedTowerDef = selectedTower 
    ? TOWER_DEFS[Object.values(TOWER_DEFS).find(d => d.id === selectedTower.defId)!.type]
    : null;

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden flex flex-col">
       {showBestiary && <Bestiary onClose={() => setShowBestiary(false)} renderHero={(t, s) => <HeroPortrait theme={t} size={s} />} />}
       
       {gameState.view === GameView.GAME_OVER && (
           <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center animate-fade-in pointer-events-auto">
               <Skull size={64} className="text-red-500 mb-4 animate-bounce" />
               <h2 className="text-5xl font-bold text-red-500 mb-2 fantasy-font">任務失敗</h2>
               <p className="text-slate-400 mb-6">波次: {gameState.wave} | 獲得金幣: {Math.floor(gameState.money)}</p>
               <div className="flex gap-4 mt-8">
                   <button onClick={onRetry} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center gap-2 pointer-events-auto"><RotateCcw/> 重新開始</button>
                   <button onClick={onExit} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded pointer-events-auto">回到主選單</button>
               </div>
           </div>
       )}

       {gameState.view === GameView.VICTORY && (
           <div className="absolute inset-0 z-50 bg-gradient-to-b from-black/80 to-blue-900/50 flex flex-col items-center justify-center animate-fade-in pointer-events-auto">
               <Zap size={80} className="text-amber-400 mb-4 animate-pulse drop-shadow-lg" />
               <h2 className="text-6xl font-bold text-amber-300 mb-2 fantasy-font drop-shadow-lg">任務成功！</h2>
               <p className="text-lg text-amber-200 mb-2">波次完成: Wave {gameState.wave}</p>
               <p className="text-slate-300 mb-6">最終金幣: {Math.floor(gameState.money)}</p>
               <div className="flex gap-4 mt-8">
                   <button onClick={onRetry} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded flex items-center gap-2 pointer-events-auto"><ArrowUp/> 下一關</button>
                   <button onClick={onExit} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded pointer-events-auto">回到主選單</button>
               </div>
           </div>
       )}

       <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 pl-20 z-50 shadow-md relative">
           <div className="flex gap-6 items-center">
               <span className="text-amber-400 font-bold text-xl drop-shadow-md">💰 {Math.floor(gameState.money)}</span>
               <span className={`text-xl font-bold drop-shadow-md ${gameState.lives < 5 ? 'text-red-500 animate-pulse' : 'text-red-400'}`}>❤️ {gameState.lives}</span>
               <span className="text-blue-300 font-bold text-xl">Wave {gameState.wave}</span>
               <button 
                onClick={callNextWave} 
                disabled={nextWaveCooldown > 0}
                className={`flex items-center gap-2 px-3 py-1 rounded border transition-all ${nextWaveCooldown > 0 ? 'bg-slate-700 text-slate-500 border-slate-600 cursor-not-allowed' : 'bg-red-900/80 text-white border-red-500 hover:bg-red-700 animate-pulse'}`}
               >
                   <Skull size={18} /> {nextWaveCooldown > 0 ? `${(nextWaveCooldown/1000).toFixed(1)}s` : 'CALL WAVE'}
               </button>
           </div>
           <div className="flex gap-4">
              <button onClick={() => setShowBestiary(true)} className="p-2 bg-slate-700 rounded hover:bg-slate-600 text-amber-300 pointer-events-auto" title="圖鑑">
                  <BookOpen size={20}/>
              </button>
              <button onClick={() => setGameState(p => ({...p, isPaused: !p.isPaused}))} className="p-2 bg-slate-700 rounded hover:bg-slate-600 text-white pointer-events-auto">
                  {gameState.isPaused ? <Play size={20}/> : <Pause size={20}/>}
              </button>
              <button onClick={onExit} className="px-4 py-2 bg-red-900/50 border border-red-500 rounded text-red-200 hover:bg-red-900 pointer-events-auto">撤退</button>
           </div>
       </div>

       <div 
         className="flex-1 relative overflow-auto flex justify-center items-center cursor-crosshair z-0"
         style={{ backgroundColor: levelConfig.theme.background }}
         onClick={handleMapClick}
       >
           <svg width="800" height="400" 
                className="shadow-2xl border border-slate-600 rounded-lg relative overflow-visible"
                style={{ cursor: isSettingRally ? 'crosshair' : 'default', backgroundColor: levelConfig.theme.background }}
            >
               {renderMapDecorations()}
               {renderSkillEffect()}
               
               {levelConfig.paths.map((path, idx) => (
                   <polyline key={idx} points={path.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={levelConfig.theme.pathColor} strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none" />
               ))}
               <g transform={`translate(${pathEnd.x}, ${pathEnd.y})`}>
                  <line x1="0" y1="0" x2="0" y2="-30" stroke="white" strokeWidth="2" />
                  <path d="M0,-30 L20,-20 L0,-10 Z" fill="#ef4444" stroke="white" />
               </g>

               {levelConfig.buildSlots.map((slot, idx) => (
                   <circle key={idx} cx={slot.x} cy={slot.y} r="22" fill="rgba(30, 41, 59, 0.5)" stroke="#475569" strokeWidth="1" className="hover:stroke-amber-500 hover:fill-slate-700 transition-colors pointer-events-none" />
               ))}

               {gameState.activeTowers.map(tower => (
                   <g key={tower.id} transform={`translate(${tower.x}, ${tower.y})`}>
                       {renderTowerVisual(tower)}
                       {gameState.selectedTowerId === tower.id && <circle cx="0" cy="0" r={getTowerStats(tower).range} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" pointerEvents="none" />}
                       {gameState.selectedTowerId === tower.id && tower.rallyPoint && (
                           <line x1="0" y1="0" x2={tower.rallyPoint.x - tower.x} y2={tower.rallyPoint.y - tower.y} stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,2" opacity="0.6"/>
                       )}
                   </g>
               ))}
               
               {gameState.activeTowers.map(tower => {
                   if (tower.defId === 'barracks' && (gameState.selectedTowerId === tower.id || tower.rallyPoint)) {
                       const rally = getRallyPoint(tower, 0); 
                       if (gameState.selectedTowerId === tower.id || tower.rallyPoint) {
                           return (
                               <g key={`rally-${tower.id}`} transform={`translate(${rally.x}, ${rally.y})`}>
                                   <path d="M0,0 L0,-20 L10,-15 L0,-10" stroke="#3b82f6" strokeWidth="2" fill="#60a5fa" />
                                   <circle r="3" fill="#3b82f6" />
                               </g>
                           )
                       }
                   }
                   return null;
               })}
               
               {gameState.activeTowers.map(tower => {
                   const { fill, stroke } = getSoldierColor(tower);
                   return tower.soldiers?.map(s => !s.isDead && (
                       <g key={s.id} transform={`translate(${s.x}, ${s.y})`}>
                           <circle r="5" fill={fill} stroke={stroke} strokeWidth="1.5"/>
                       </g>
                   ))
               })}

               {gameState.enemies.map(enemy => (
                   <g key={enemy.id} transform={`translate(${enemy.x}, ${enemy.y})`}>
                       {renderEnemy(enemy)}
                       <rect x="-8" y="-12" width="16" height="3" fill="#991b1b" />
                       <rect x="-8" y="-12" width={Math.max(0, (enemy.hp/enemy.maxHp)*16)} height="3" fill="#22c55e" />
                   </g>
               ))}

               {gameState.heroEntity && !gameState.heroEntity.isDead && (
                 <g transform={`translate(${gameState.heroEntity.x - 12}, ${gameState.heroEntity.y - 12})`}>
                     <HeroPortrait theme={hero.visualTheme} size={24} />
                     <rect x="0" y="-8" width="24" height="4" fill="red" stroke="black" strokeWidth="0.5"/>
                     <rect x="0" y="-8" width={(gameState.heroEntity.hp / gameState.heroEntity.maxHp) * 24} height="4" fill="#3b82f6" />
                 </g>
               )}

               {gameState.projectiles.map(p => (
                   <circle key={p.id} cx={p.x} cy={p.y} r={p.isHeroProjectile ? 4 : 3} fill={p.isHeroProjectile ? hero.visualTheme.primaryColor : (p.type===ProjectileType.MAGIC?'purple':'yellow')} />
               ))}
               
               {gameState.particles.map(p => (
                   <circle key={p.id} cx={p.x} cy={p.y} r={p.radius} fill={p.color} opacity={p.life/p.maxLife} />
               ))}
           </svg>

           {buildMenuOpen && (
               <div 
                    className="absolute bg-slate-800 border-2 border-slate-500 p-2 rounded shadow-2xl grid grid-cols-3 gap-2 z-[60] animate-in fade-in zoom-in duration-200" 
                    style={{ left: `${buildMenuOpen.x + 40}px`, top: `${buildMenuOpen.y - 40}px` }}
                    onClick={(e) => e.stopPropagation()} 
                >
                   {Object.values(TOWER_DEFS).map(def => (
                       <button key={def.id} onClick={() => {
                          buildTower(def.type);
                       }} className="flex flex-col items-center p-2 hover:bg-slate-700 active:bg-slate-600 rounded min-w-[70px] transition-colors" disabled={gameState.money < def.t1.cost}>
                           <div className="text-2xl mb-1">{def.icon}</div>
                           <div className="text-[10px] text-slate-300 font-bold">{def.name}</div>
                           <div className={`text-[10px] ${gameState.money < def.t1.cost ? 'text-red-500' : 'text-amber-400'}`}>{def.t1.cost}g</div>
                       </button>
                   ))}
               </div>
           )}
       </div>

       <div className="h-48 bg-slate-900 border-t border-slate-700 p-4 flex gap-4 z-50 relative shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
           <div className="w-56 border-r border-slate-700 pr-4 flex gap-4">
              <div className="shrink-0 rounded-lg overflow-hidden border border-slate-600 bg-slate-800">
                  <HeroPortrait theme={hero.visualTheme} size={80} />
              </div>
              <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-blue-300 font-bold text-sm truncate">{hero.name}</h3>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">{isRangedHero ? 'Ranged DPS' : 'Melee Tank'}</div>
                    <div className="w-full bg-slate-800 h-2 rounded mt-1 overflow-hidden">
                       <div className="h-full bg-green-500 transition-all" style={{width: `${gameState.heroEntity ? (gameState.heroEntity.hp / gameState.heroEntity.maxHp)*100 : 0}%`}} />
                    </div>
                  </div>
                  
                  <button 
                    onClick={activateHeroSkill}
                    disabled={gameState.heroEntity?.isDead || gameState.heroEntity!.skillCooldownTimer > 0}
                    className={`relative w-full h-12 rounded border flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-95 ${
                        gameState.heroEntity?.skillCooldownTimer === 0 
                        ? 'bg-gradient-to-r from-amber-600 to-amber-500 border-amber-400 text-white hover:from-amber-500 hover:to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse' 
                        : 'bg-slate-800 border-slate-600 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Zap size={18} /> 
                    {gameState.heroEntity && gameState.heroEntity.skillCooldownTimer > 0 
                        ? `${Math.ceil(gameState.heroEntity.skillCooldownTimer/60)}s` 
                        : '終極技能 (ULT)'}
                  </button>
              </div>
           </div>

           <div className="flex-1 px-4">
               {selectedTower && selectedTowerDef ? (
                   <div className="text-slate-300 flex items-center gap-4 h-full w-full">
                        <div className="flex flex-col min-w-[140px] border-r border-slate-700 pr-4">
                             <h3 className="font-bold text-amber-400 text-lg">{selectedTowerDef.name}</h3>
                             <div className="text-xs text-slate-500 mb-2">Lv {selectedTower.level} • Tier {selectedTower.tier}</div>
                             
                             <div className="bg-slate-950 p-2 rounded text-xs border border-slate-700 w-40">
                                 {selectedTower.tier === 1 && (
                                     <>
                                        <StatRow label="攻擊" value={`${selectedTowerDef.t1.damage}`} nextValue={hoveredUpgradeTier !== null ? `${selectedTowerDef.t2.damage}` : undefined} />
                                        <StatRow label="射程" value={`${selectedTowerDef.t1.range}`} nextValue={hoveredUpgradeTier !== null ? `${selectedTowerDef.t2.range}` : undefined} />
                                     </>
                                 )}
                                 {selectedTower.tier === 2 && (
                                     <>
                                        <StatRow label="攻擊" value={`${selectedTowerDef.t2.damage}`} />
                                        <div className="text-amber-500 text-[10px] mt-1">請選擇專精分支</div>
                                     </>
                                 )}
                                  {selectedTower.tier === 3 && selectedTower.t3Index !== undefined && (
                                     <>
                                        <StatRow label="攻擊" value={`${selectedTowerDef.t3Options[selectedTower.t3Index].damage}`} />
                                        <StatRow label="射程" value={`${selectedTowerDef.t3Options[selectedTower.t3Index].range}`} />
                                     </>
                                 )}
                             </div>
                        </div>

                        <div className="flex-1 flex gap-2 items-center justify-center">
                            {selectedTower.tier === 1 && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); upgradeTower(selectedTower.id); }}
                                    onMouseEnter={() => setHoveredUpgradeTier(2)}
                                    onMouseLeave={() => setHoveredUpgradeTier(null)}
                                    className={`px-4 py-3 rounded border font-bold flex flex-col items-center gap-1 min-w-[140px] transition-colors ${gameState.money >= selectedTowerDef.t2.cost ? 'bg-slate-700 hover:bg-slate-600 text-white border-blue-500' : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'}`}
                                >
                                    <div className="flex items-center gap-1 text-sm"><ArrowUp size={16}/> 升級至 T2</div>
                                    <span className={gameState.money >= selectedTowerDef.t2.cost ? 'text-amber-400' : 'text-red-500'}>{selectedTowerDef.t2.cost}g</span>
                                </button>
                            )}

                            {selectedTower.tier === 2 && (
                                <div className="flex gap-2">
                                    {selectedTowerDef.t3Options.map((opt, idx) => (
                                        <div key={idx} className="group relative">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); upgradeTower(selectedTower.id, idx); }}
                                                className={`p-2 rounded border font-bold flex flex-col items-center w-32 h-24 justify-center transition-colors ${gameState.money >= opt.cost ? 'bg-slate-700 hover:bg-slate-600 text-white border-purple-500' : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'}`}
                                            >
                                                <div className="text-xs text-center mb-1 leading-tight">{opt.name}</div>
                                                <span className={`text-xs ${gameState.money >= opt.cost ? 'text-amber-400' : 'text-red-500'}`}>{opt.cost}g</span>
                                            </button>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black/90 border border-slate-600 p-2 rounded text-xs text-slate-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-[60]">
                                                <div className="font-bold text-amber-400 mb-1">{opt.name}</div>
                                                {opt.description}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedTower.tier === 3 && (
                                <div className="text-sm text-slate-400 italic bg-slate-800/50 px-4 py-2 rounded">
                                    已達最高等級 (Max Level)
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 ml-auto">
                            {selectedTowerDef.type === TowerType.BARRACKS && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsSettingRally(true); }}
                                    className={`px-3 py-1 rounded border text-xs font-bold flex items-center gap-2 ${isSettingRally ? 'bg-green-600 text-white border-green-400' : 'bg-slate-700 text-slate-300 border-slate-500 hover:bg-slate-600'}`}
                                >
                                    <Crosshair size={14}/> {isSettingRally ? '點擊地圖...' : '集結'}
                                </button>
                            )}
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const tId = gameState.selectedTowerId;
                                    if(tId) setGameState(p => ({...p, activeTowers: p.activeTowers.filter(t => t.id !== tId), money: p.money + 50, selectedTowerId: null}));
                                }}
                                className="px-3 py-1 bg-red-900/50 border border-red-800 text-red-300 rounded hover:bg-red-800 text-xs"
                            >
                                出售 (Sell)
                            </button>
                        </div>
                   </div>
               ) : (
                   <div className="flex items-center justify-center h-full text-slate-500 text-sm italic">
                       {isSettingRally ? <span className="text-green-400 flex items-center gap-2 font-bold animate-pulse"><Crosshair/> 請點擊地圖設定集結點...</span> : "點擊空地建造，或點擊防禦塔升級"}
                   </div>
               )}
           </div>
       </div>
    </div>
  );
};

export default GameLevel;
