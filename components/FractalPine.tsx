
import React, { useRef, useEffect } from 'react';
import { ThemeColor } from '../types';

interface FractalPineProps {
  progress: number; // 0.0 to 1.0
  width?: number;
  height?: number;
  theme?: ThemeColor;
  showTree?: boolean;
  showParticles?: boolean;
}

const THEME_PALETTES: Record<ThemeColor, { trunk: string; leaf: string; particle: string[] }> = {
  pine: { 
      trunk: '#4A3728', 
      leaf: '#2E8B57', 
      particle: ['#fde047', '#86efac'] // 黄色(Yellow-300)/浅绿(Green-300) 用于萤火虫双层光晕
  }, 
  ocean: { 
      trunk: '#1e293b', 
      leaf: '#0ea5e9', 
      particle: ['#e0f2fe', '#bae6fd', 'rgba(255,255,255,0.8)'] // 浅蓝/白 (气泡)
  }, 
  sunset: { 
      trunk: '#5c2b29', 
      leaf: '#fb7185', 
      particle: ['#fbcfe8', '#f9a8d4', '#fda4af'] // 樱花粉
  }, 
  lavender: { 
      trunk: '#2e1065', 
      leaf: '#8b5cf6', 
      particle: ['#e9d5ff', '#d8b4fe', '#c4b5fd'] // 紫色 (蝴蝶)
  }, 
  graphite: { 
      trunk: '#171717', 
      leaf: '#64748b', 
      particle: ['#94a3b8', '#cbd5e1', '#64748b'] // 灰色 (代码)
  }, 
};

type ParticleType = 'firefly' | 'bubble' | 'sakura' | 'code' | 'butterfly';

class Particle {
    x: number;
    y: number;
    size: number;
    speedY: number;
    speedX: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    width: number;
    height: number;
    phase: number;
    type: ParticleType;
    color: string;
    colors: string[];
    char: string; // 用于 Digital Rain
    flapSpeed: number; // 用于蝴蝶扇动频率
    
    constructor(width: number, height: number, type: ParticleType, colors: string[]) {
        this.width = width;
        this.height = height;
        this.type = type;
        this.colors = colors;
        this.color = colors[0];
        
        // Init properties
        this.x = 0;
        this.y = 0;
        this.phase = 0;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.opacity = 0;
        this.size = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.char = '';
        this.flapSpeed = 0.1;

        this.reset(true);
    }

    reset(initial: boolean = false) {
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.phase = Math.random() * 100;

        if (!initial) {
            // Re-spawn logic based on type
            if (this.type === 'bubble' || this.type === 'butterfly' || this.type === 'firefly') {
                 this.y = this.height + 20; // Rise from bottom
            } else {
                 this.y = -20; // Fall from top
            }
            this.x = Math.random() * this.width;
            this.opacity = 0;
        } else {
            this.x = Math.random() * this.width;
            this.y = Math.random() * this.height;
            this.opacity = Math.random();
        }

        switch (this.type) {
            case 'bubble': 
                this.size = Math.random() * 4 + 2; 
                this.speedY = Math.random() * 1.5 + 0.5; 
                this.speedX = 0;
                break;

            case 'sakura': 
                this.size = Math.random() * 5 + 3; 
                this.speedY = Math.random() * 1.0 + 0.5; 
                this.speedX = Math.random() * 1.0 - 0.5; 
                this.rotationSpeed = (Math.random() - 0.5) * 0.05;
                this.rotation = Math.random() * Math.PI * 2;
                break;

            case 'butterfly':
                this.size = Math.random() * 5 + 4; // 蝴蝶大小
                this.speedY = Math.random() * 0.8 + 0.3; 
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.flapSpeed = 0.15 + Math.random() * 0.1;
                this.rotation = Math.random() * 0.5 - 0.25; // 稍微倾斜
                break;
            
            case 'code':
                this.size = Math.random() * 10 + 8; // Font size
                this.speedY = Math.random() * 2 + 1.5; 
                this.speedX = 0;
                const chars = ['0', '1', '+', 'x', '<', '>'];
                this.char = chars[Math.floor(Math.random() * chars.length)];
                break;

            case 'firefly': 
            default:
                this.size = Math.random() * 1.5 + 1.0; // 真实萤火虫本体很小
                this.speedY = Math.random() * 0.3 + 0.1; // 飞得很慢
                this.speedX = (Math.random() - 0.5) * 0.4;
                break;
        }
    }

    update() {
        this.phase += 0.05;

        switch (this.type) {
            case 'bubble': // Ocean: Rising hollow circles
                this.y -= this.speedY;
                this.x += Math.sin(this.phase * 0.5) * 0.5; 
                
                // Expand as they rise (pressure drops)
                if (this.y < this.height * 0.5) {
                     this.size += 0.01;
                }
                
                // Pop near top
                if (this.y < this.height * 0.2) {
                    this.opacity -= 0.02;
                } else if (this.opacity < 0.6) {
                    this.opacity += 0.02;
                }
                break;

            case 'sakura': // Sunset: Falling petals
                this.y += this.speedY;
                this.x += Math.sin(this.phase) * 1.2 + this.speedX; 
                this.rotation += this.rotationSpeed;
                this.rotation += Math.cos(this.phase) * 0.01; 

                if (this.y < this.height * 0.2) this.opacity = Math.min(1, this.opacity + 0.05);
                if (this.y > this.height * 0.9) this.opacity -= 0.02; 
                break;

            case 'butterfly': // Lavender: Fluttering wings
                this.y -= this.speedY;
                // Figure-8 flight path
                this.x += Math.sin(this.phase) * 0.8 + this.speedX;
                
                // Tilt body towards direction
                this.rotation = Math.sin(this.phase) * 0.3;

                if (this.y < this.height * 0.8 && this.opacity < 0.8) this.opacity += 0.02;
                if (this.y < this.height * 0.1) this.opacity -= 0.02;
                break;
            
            case 'code': // Graphite: Matrix rain
                 this.y += this.speedY;
                 // Glitch effect: randomly jump position
                 if (Math.random() > 0.99) this.x += (Math.random() - 0.5) * 20;
                 // Character change
                 if (Math.random() > 0.95) {
                    const chars = ['0', '1', '+', 'x', '<', '>'];
                    this.char = chars[Math.floor(Math.random() * chars.length)];
                 }

                 if (this.y < this.height * 0.2) this.opacity = Math.min(0.8, this.opacity + 0.1);
                 if (this.y > this.height * 0.9) this.opacity -= 0.05;
                 break;

            case 'firefly': // Pine: Improved Firefly Logic
            default:
                // 更加自然的游荡：垂直缓慢上升，水平方向正弦波游走
                // Use two overlapping sine waves for more organic horizontal movement
                this.x += (Math.sin(this.phase * 0.3) * 0.3 + Math.cos(this.phase * 0.7) * 0.2) + this.speedX * 0.1;
                this.y -= this.speedY * 0.8; 
                
                // 呼吸灯：更慢的频率，不完全熄灭
                this.opacity = 0.4 + (Math.sin(this.phase * 0.5) + 1) * 0.3; 
                break;
        }

        // Boundary Check
        const margin = 30;
        if (
            this.y < -margin || 
            this.y > this.height + margin || 
            this.x < -margin || 
            this.x > this.width + margin || 
            this.opacity <= 0
        ) {
            this.reset();
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.type === 'sakura') {
            // 🌸 Sakura: Rotating Petal
            ctx.globalAlpha = Math.max(0, Math.min(1, this.opacity));
            ctx.fillStyle = this.color;
            ctx.rotate(this.rotation);
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
            ctx.shadowColor = 'rgba(255, 182, 193, 0.5)';
            ctx.shadowBlur = 4;
            ctx.fill();

        } else if (this.type === 'butterfly') {
            // 🦋 Butterfly: Flapping Wings
            ctx.globalAlpha = Math.max(0, Math.min(1, this.opacity));
            ctx.fillStyle = this.color;
            ctx.rotate(this.rotation);
            
            // Flap animation: Scale X using sine wave
            const flap = Math.abs(Math.sin(this.phase * 3)); 
            ctx.scale(flap, 1); 

            // Draw wings (two ellipses)
            ctx.beginPath();
            ctx.ellipse(-this.size/2, 0, this.size, this.size/1.5, Math.PI/4, 0, Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(this.size/2, 0, this.size, this.size/1.5, -Math.PI/4, 0, Math.PI*2);
            ctx.fill();
            
            // Glow
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 8;

        } else if (this.type === 'code') {
            // 💻 Code: Text Character
            ctx.globalAlpha = Math.max(0, Math.min(1, this.opacity));
            ctx.fillStyle = this.color;
            ctx.font = `bold ${this.size}px monospace`;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 2; // Slight bloom
            ctx.fillText(this.char, 0, 0);

        } else if (this.type === 'bubble') {
            // 🫧 Bubble: Hollow with highlight
            ctx.globalAlpha = Math.max(0, Math.min(1, this.opacity));
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.stroke();
            
            // Reflection spot
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(-this.size*0.3, -this.size*0.3, this.size*0.25, 0, Math.PI * 2);
            ctx.fill();

        } else {
            // ✨ Firefly (Revised): 
            // 真实感：中心是暖黄高亮实心，外围是绿色柔光晕
            const alpha = Math.max(0, Math.min(1, this.opacity));
            
            // 1. Draw Glow (Large, Greenish)
            // 使用 colors[1] (绿色) 做光晕
            const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 5);
            glowGradient.addColorStop(0, this.colors[1].replace('rgb', 'rgba').replace(')', `, ${alpha * 0.4})`)); 
            glowGradient.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.fillStyle = glowGradient;
            ctx.globalAlpha = 1; 
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 5, 0, Math.PI * 2);
            ctx.fill();

            // 2. Draw Core (Small, Yellowish)
            // 使用 colors[0] (黄色) 做核心
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.colors[0]; 
            ctx.shadowBlur = 5;
            ctx.shadowColor = this.colors[0];
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

const FractalPine: React.FC<FractalPineProps> = ({ 
    progress, 
    width = 300, 
    height = 300, 
    theme = 'pine',
    showTree = true,
    showParticles = true 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  const MAX_DEPTH = 12;
  const palette = THEME_PALETTES[theme] || THEME_PALETTES.pine;
  const TRUNK_COLOR = palette.trunk;
  const LEAF_COLOR = palette.leaf;
  const PARTICLE_COLORS = palette.particle;
  
  const BRANCH_ANGLE = 22;
  const TRUNK_SHRINK = 0.8;
  const BRANCH_SHRINK = 0.65;

  // Map theme to particle type
  const getParticleType = (t: ThemeColor): ParticleType => {
      switch(t) {
          case 'ocean': return 'bubble';
          case 'sunset': return 'sakura';
          case 'lavender': return 'butterfly';
          case 'graphite': return 'code';
          case 'pine': default: return 'firefly';
      }
  };

  // Re-initialize particles when theme or dimensions change
  useEffect(() => {
     if (!showParticles) {
         particlesRef.current = [];
         return;
     }

     particlesRef.current = [];
     const type = getParticleType((theme || 'pine') as ThemeColor);
     // Different counts for different effects
     let count = 60;
     if (type === 'sakura') count = 100;
     if (type === 'code') count = 80;
     if (type === 'butterfly') count = 40; // Fewer but bigger
     if (type === 'firefly') count = 50; // Fewer but higher quality

     for(let i=0; i < count; i++) {
         particlesRef.current.push(new Particle(width, height, type, PARTICLE_COLORS));
     }
  }, [width, height, theme, showParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const degToRad = (deg: number) => (deg * Math.PI) / 180;

    const drawPine = (
      x: number, 
      y: number, 
      length: number, 
      angle: number, 
      depth: number, 
      branchWidth: number,
      currentTime: number
    ) => {
      ctx.beginPath();
      ctx.save();
      ctx.translate(x, y);

      const windInfluence = (MAX_DEPTH - depth) * 0.05; 
      const windSway = Math.sin(currentTime * 0.002 + (MAX_DEPTH - depth) * 0.5) * windInfluence; 
      const finalAngle = depth === MAX_DEPTH ? angle : angle + windSway;

      ctx.rotate(degToRad(finalAngle));
      
      if (depth > MAX_DEPTH - 3) {
          ctx.strokeStyle = TRUNK_COLOR;
      } else {
          ctx.strokeStyle = LEAF_COLOR;
          if (depth < 3) ctx.globalAlpha = 0.8;
      }

      ctx.lineWidth = branchWidth;
      ctx.lineCap = 'round';
      
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -length);
      ctx.stroke();

      if (depth > 0) {
        ctx.translate(0, -length);
        
        const wobble = Math.sin(depth * 1324) * 5; 
        
        drawPine(
            0, 0, 
            length * TRUNK_SHRINK, 
            wobble,
            depth - 1, 
            branchWidth * 0.8,
            currentTime
        );

        if (depth < MAX_DEPTH) {
            drawPine(
                0, 0, 
                length * BRANCH_SHRINK, 
                -BRANCH_ANGLE - 10,
                depth - 1, 
                branchWidth * 0.6,
                currentTime
            );
            drawPine(
                0, 0, 
                length * BRANCH_SHRINK, 
                BRANCH_ANGLE + 10,
                depth - 1, 
                branchWidth * 0.6,
                currentTime
            );
        }
      }
      
      ctx.restore();
    };

    const animate = (timestamp: number) => {
      timeRef.current = timestamp;

      // Smooth progress tweening
      const target = Math.min(1, Math.max(0, progress));
      const diff = target - currentProgressRef.current;
      
      if (Math.abs(diff) < 0.001) {
          currentProgressRef.current = target;
      } else {
          currentProgressRef.current += diff * 0.1;
      }

      ctx.clearRect(0, 0, width, height);
      
      const displayProgress = currentProgressRef.current;

      // 1. Draw Tree (Conditional)
      if (showTree && displayProgress > 0.01) {
          const maxPossibleHeight = height * 0.85; 
          const maxBaseLength = maxPossibleHeight / 3.5; 
          const currentBaseLength = maxBaseLength * Math.pow(displayProgress, 0.7);
          const currentDepth = Math.floor(3 + (displayProgress * (MAX_DEPTH - 3)));
          const baseWidth = Math.max(1, currentBaseLength / 6);

          drawPine(
            width / 2,
            height,
            currentBaseLength,
            0,
            currentDepth,
            baseWidth,
            timeRef.current
          );
      }

      // 2. Draw Particles (Conditional)
      if (showParticles) {
          particlesRef.current.forEach(p => {
              p.update();
              p.draw(ctx);
          });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [progress, width, height, theme, showTree, showParticles]);

  return <canvas ref={canvasRef} className="pointer-events-none" />;
};

export default FractalPine;
