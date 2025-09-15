// Canvas setup
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Responsive canvas sizing
function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    canvas.width = width;
    canvas.height = height;
    
    // Adjust scale based on screen size
    const scale = Math.min(width, height) / 600;
    return scale;
}

let scale = resizeCanvas();
window.addEventListener('resize', () => {
    scale = resizeCanvas();
});

// Heart shape parameters
function getHeartPath(t, scale = 1) {
    // Parametric heart equation
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    
    return {
        x: x * scale,
        y: y * scale
    };
}

// Animation variables
let time = 0;
const trailLength = 20;
const trail1 = [];
const trail2 = [];
let angle1 = 0;
let angle2 = Math.PI; // Start 180 degrees apart

// Particle system for glow effect
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.life = 1.0;
        this.decay = 0.01;
        this.color = color;
        this.size = Math.random() * 3 + 1;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.vx *= 0.98;
        this.vy *= 0.98;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

const particles = [];

// Main animation function
function animate() {
    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Center of canvas
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Calculate scale for responsive design
    const heartScale = scale * 15;
    
    // Update angles for rotation
    angle1 += 0.10;
    angle2 += 0.10;
    
    // Get current positions on heart path
    const pos1 = getHeartPath(angle1, heartScale);
    const pos2 = getHeartPath(angle2, heartScale);
    
    // Add to trails
    trail1.push({
        x: centerX + pos1.x,
        y: centerY + pos1.y
    });
    
    trail2.push({
        x: centerX + pos2.x,
        y: centerY + pos2.y
    });
    
    // Limit trail length
    if (trail1.length > trailLength) trail1.shift();
    if (trail2.length > trailLength) trail2.shift();
    
    // Create particles occasionally
    if (Math.random() < 0.3) {
        particles.push(new Particle(
            centerX + pos1.x,
            centerY + pos1.y,
            '#00d4ff'
        ));
    }
    
    if (Math.random() < 0.3) {
        particles.push(new Particle(
            centerX + pos2.x,
            centerY + pos2.y,
            '#ff0080'
        ));
    }
    
    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        
        if (particle.life <= 0) {
            particles.splice(i, 1);
        } else {
            particle.draw(ctx);
        }
    }
    
    // Draw trail 1 (blue/cyan)
    drawTrail(trail1, '#00d4ff', '#0080ff');
    
    // Draw trail 2 (pink/magenta)
    drawTrail(trail2, '#ff0080', '#ff00ff');
    
    // Draw leading lights
    drawLight(centerX + pos1.x, centerY + pos1.y, '#00d4ff', 9);
    drawLight(centerX + pos2.x, centerY + pos2.y, '#ff0080', 9);
    
    // Continue animation
    requestAnimationFrame(animate);
}

// Draw trail with gradient
function drawTrail(trail, color1, color2) {
    if (trail.length < 2) return;
    
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    for (let i = 1; i < trail.length; i++) {
        const alpha = i / trail.length;
        const width = (i / trail.length) * 4 + 1;
        
        // Create gradient for each segment
        const gradient = ctx.createLinearGradient(
            trail[i-1].x, trail[i-1].y,
            trail[i].x, trail[i].y
        );
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        
        ctx.strokeStyle = gradient;
        ctx.globalAlpha = alpha * 0.8;
        ctx.lineWidth = width;
        ctx.shadowBlur = 20;
        ctx.shadowColor = color1;
        
        ctx.beginPath();
        ctx.moveTo(trail[i-1].x, trail[i-1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();
    }
    
    ctx.restore();
}

// Draw glowing light point
function drawLight(x, y, color, size) {
    ctx.save();
    
    // Outer glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, color + '40');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner core
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Middle ring
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// Start animation
animate();