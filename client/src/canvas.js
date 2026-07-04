import { 
  TABLE_WIDTH, 
  TABLE_HEIGHT, 
  CUSHION_WIDTH, 
  BALL_RADIUS, 
  POCKETS, 
  POCKET_RADIUS,
  D_LINE_X 
} from '../../shared/constants.js';

// Table color variables (Teal felt / mahogany wood)
const COLOR_WOOD = '#2c1609';
const COLOR_WOOD_LIGHT = '#3d200e';
const COLOR_FELT = '#126252'; // Premium teal felt
const COLOR_CUSHION = '#0d4a3e'; // Darker teal for cushion borders
const COLOR_LINE = 'rgba(255, 255, 255, 0.15)'; // Subtle lines
const COLOR_POCKET = '#04070a';

/**
 * Canvas renderer helper class
 */
export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  /**
   * Main render function
   * @param {Array} balls - List of ball states
   * @param {Object} cueBall - Reference to the cue ball
   * @param {boolean} isAiming - Whether the player is currently aiming
   * @param {number} aimAngle - Current aiming angle in radians
   * @param {number} power - Current shot power (0 to 1)
   * @param {boolean} isMyTurn - Is it this client's turn to shoot?
   * @param {boolean} isBallInHand - Does the player have ball-in-hand placement?
   */
  draw(balls, cueBall, isAiming, aimAngle, power, isMyTurn, isBallInHand) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw Outer Wood Border
    this.drawWoodBorder();

    // 2. Draw Felt Playing Area
    this.drawFelt();

    // 3. Draw D-Line (Kitchen Line) & Semicircle
    this.drawDLine();

    // 4. Draw Pockets
    this.drawPockets();

    // 5. Draw Cushions
    this.drawCushions();

    // 6. Draw Aiming Guideline (if active player is aiming)
    if (isAiming && cueBall && !cueBall.isPocketed && isMyTurn) {
      this.drawAimGuideline(cueBall, aimAngle, balls);
    }

    // 7. Draw Balls
    for (const ball of balls) {
      if (!ball.isPocketed) {
        this.drawBall(ball);
      }
    }

    // 8. Draw Ball-In-Hand Highlight indicator
    if (isBallInHand && cueBall && !cueBall.isPocketed && isMyTurn) {
      this.drawBallInHandIndicator(cueBall);
    }

    // 9. Draw Cue Stick (if active player is aiming and balls are stationary)
    if (isAiming && cueBall && !cueBall.isPocketed && isMyTurn) {
      this.drawCueStick(cueBall, aimAngle, power);
    }
  }

  drawWoodBorder() {
    const ctx = this.ctx;
    // Draw wood boundary
    const grad = ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 100,
      this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2
    );
    grad.addColorStop(0, COLOR_WOOD_LIGHT);
    grad.addColorStop(1, COLOR_WOOD);
    
    ctx.fillStyle = grad;
    // Round border rectangle
    this.drawRoundedRect(0, 0, this.canvas.width, this.canvas.height, 24);
    ctx.fill();

    // Small metallic diamonds on the wood border (sight indicators)
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    const offset = CUSHION_WIDTH / 2;
    // Top & Bottom Diamonds
    for (let x = D_LINE_X; x < TABLE_WIDTH; x += TABLE_WIDTH / 4) {
      this.drawDiamond(x + CUSHION_WIDTH, offset);
      this.drawDiamond(x + CUSHION_WIDTH, this.canvas.height - offset);
    }
    // Left & Right Diamonds
    for (let y = TABLE_HEIGHT / 4; y < TABLE_HEIGHT; y += TABLE_HEIGHT / 4) {
      this.drawDiamond(offset, y + CUSHION_WIDTH);
      this.drawDiamond(this.canvas.width - offset, y + CUSHION_WIDTH);
    }
  }

  drawDiamond(x, y) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x + 4, y);
    ctx.lineTo(x, y + 4);
    ctx.lineTo(x - 4, y);
    ctx.closePath();
    ctx.fill();
  }

  drawFelt() {
    const ctx = this.ctx;
    ctx.fillStyle = COLOR_FELT;
    ctx.fillRect(CUSHION_WIDTH, CUSHION_WIDTH, TABLE_WIDTH, TABLE_HEIGHT);
  }

  drawDLine() {
    const ctx = this.ctx;
    // D-Line vertical
    ctx.strokeStyle = COLOR_LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(D_LINE_X + CUSHION_WIDTH, CUSHION_WIDTH);
    ctx.lineTo(D_LINE_X + CUSHION_WIDTH, TABLE_HEIGHT + CUSHION_WIDTH);
    ctx.stroke();

    // D semicircle (to the left of D-Line)
    ctx.beginPath();
    ctx.arc(
      D_LINE_X + CUSHION_WIDTH, 
      TABLE_HEIGHT / 2 + CUSHION_WIDTH, 
      TABLE_HEIGHT / 4, 
      Math.PI / 2, 
      (3 * Math.PI) / 2
    );
    ctx.stroke();
  }

  drawPockets() {
    const ctx = this.ctx;
    for (const pocket of POCKETS) {
      const cx = pocket.x + CUSHION_WIDTH;
      const cy = pocket.y + CUSHION_WIDTH;

      // Dark hole gradient
      const grad = ctx.createRadialGradient(cx, cy, 3, cx, cy, POCKET_RADIUS);
      grad.addColorStop(0, '#000000');
      grad.addColorStop(0.7, COLOR_POCKET);
      grad.addColorStop(1, '#1b2430'); // outer pocket rim

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, POCKET_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Golden outer pocket ring
      ctx.strokeStyle = '#c5a059';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, POCKET_RADIUS, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  drawCushions() {
    const ctx = this.ctx;
    ctx.fillStyle = COLOR_CUSHION;

    // Draw top cushion segments
    // Top-Left cushion
    ctx.beginPath();
    ctx.moveTo(CUSHION_WIDTH + POCKET_RADIUS, CUSHION_WIDTH);
    ctx.lineTo(CUSHION_WIDTH + TABLE_WIDTH / 2 - POCKET_RADIUS, CUSHION_WIDTH);
    ctx.lineTo(CUSHION_WIDTH + TABLE_WIDTH / 2 - POCKET_RADIUS - 10, CUSHION_WIDTH + 15);
    ctx.lineTo(CUSHION_WIDTH + POCKET_RADIUS + 10, CUSHION_WIDTH + 15);
    ctx.closePath();
    ctx.fill();

    // Top-Right cushion
    ctx.beginPath();
    ctx.moveTo(CUSHION_WIDTH + TABLE_WIDTH / 2 + POCKET_RADIUS, CUSHION_WIDTH);
    ctx.lineTo(CUSHION_WIDTH + TABLE_WIDTH - POCKET_RADIUS, CUSHION_WIDTH);
    ctx.lineTo(CUSHION_WIDTH + TABLE_WIDTH - POCKET_RADIUS - 10, CUSHION_WIDTH + 15);
    ctx.lineTo(CUSHION_WIDTH + TABLE_WIDTH / 2 + POCKET_RADIUS + 10, CUSHION_WIDTH + 15);
    ctx.closePath();
    ctx.fill();

    // Bottom cushions
    // Bottom-Left cushion
    ctx.beginPath();
    ctx.moveTo(CUSHION_WIDTH + POCKET_RADIUS, CUSHION_WIDTH + TABLE_HEIGHT);
    ctx.lineTo(CUSHION_WIDTH + TABLE_WIDTH / 2 - POCKET_RADIUS, CUSHION_WIDTH + TABLE_HEIGHT);
    ctx.lineTo(CUSHION_WIDTH + TABLE_WIDTH / 2 - POCKET_RADIUS - 10, CUSHION_WIDTH + TABLE_HEIGHT - 15);
    ctx.lineTo(CUSHION_WIDTH + POCKET_RADIUS + 10, CUSHION_WIDTH + TABLE_HEIGHT - 15);
    ctx.closePath();
    ctx.fill();

    // Bottom-Right cushion
    ctx.beginPath();
    ctx.moveTo(CUSHION_WIDTH + TABLE_WIDTH / 2 + POCKET_RADIUS, CUSHION_WIDTH + TABLE_HEIGHT);
    ctx.lineTo(CUSHION_WIDTH + TABLE_WIDTH - POCKET_RADIUS, CUSHION_WIDTH + TABLE_HEIGHT);
    ctx.lineTo(CUSHION_WIDTH + TABLE_WIDTH - POCKET_RADIUS - 10, CUSHION_WIDTH + TABLE_HEIGHT - 15);
    ctx.lineTo(CUSHION_WIDTH + TABLE_WIDTH / 2 + POCKET_RADIUS + 10, CUSHION_WIDTH + TABLE_HEIGHT - 15);
    ctx.closePath();
    ctx.fill();

    // Left cushion
    ctx.beginPath();
    ctx.moveTo(CUSHION_WIDTH, CUSHION_WIDTH + POCKET_RADIUS);
    ctx.lineTo(CUSHION_WIDTH, CUSHION_WIDTH + TABLE_HEIGHT - POCKET_RADIUS);
    ctx.lineTo(CUSHION_WIDTH + 15, CUSHION_WIDTH + TABLE_HEIGHT - POCKET_RADIUS - 10);
    ctx.lineTo(CUSHION_WIDTH + 15, CUSHION_WIDTH + POCKET_RADIUS + 10);
    ctx.closePath();
    ctx.fill();

    // Right cushion
    ctx.beginPath();
    ctx.moveTo(CUSHION_WIDTH + TABLE_WIDTH, CUSHION_WIDTH + POCKET_RADIUS);
    ctx.lineTo(CUSHION_WIDTH + TABLE_WIDTH, CUSHION_WIDTH + TABLE_HEIGHT - POCKET_RADIUS);
    ctx.lineTo(CUSHION_WIDTH + TABLE_WIDTH - 15, CUSHION_WIDTH + TABLE_HEIGHT - POCKET_RADIUS - 10);
    ctx.lineTo(CUSHION_WIDTH + TABLE_WIDTH - 15, CUSHION_WIDTH + POCKET_RADIUS + 10);
    ctx.closePath();
    ctx.fill();
  }

  drawBall(ball) {
    const ctx = this.ctx;
    const cx = ball.x + CUSHION_WIDTH;
    const cy = ball.y + CUSHION_WIDTH;

    // Draw base shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.arc(cx + 2, cy + 2, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Draw main colored ball with shiny 3D radial gradient
    const grad = ctx.createRadialGradient(
      cx - BALL_RADIUS * 0.3, cy - BALL_RADIUS * 0.3, 1,
      cx, cy, BALL_RADIUS
    );

    if (ball.id === 0) {
      // Cue ball (slightly off-white)
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.8, '#ededed');
      grad.addColorStop(1, '#d1d1d1');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    } else if (ball.id === 8) {
      // 8-ball (black)
      grad.addColorStop(0, '#555555');
      grad.addColorStop(0.2, '#1a1a1a');
      grad.addColorStop(1, '#080808');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Number plate (small white circle)
      this.drawNumberCircle(cx, cy, '8', '#000000');
    } else if (ball.id < 8) {
      // SOLID
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.25, ball.color);
      grad.addColorStop(1, this.shadeColor(ball.color, -40));
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Number plate
      this.drawNumberCircle(cx, cy, ball.id.toString(), ball.color);
    } else {
      // STRIPE
      // Stripes are drawn as white ball with a colored stripe
      // We draw the white ball first
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.8, '#e0e0e0');
      grad.addColorStop(1, '#c2c2c2');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Draw the colored stripe
      ctx.save();
      // Clip to ball circle so the stripe doesn't overflow
      ctx.beginPath();
      ctx.arc(cx, cy, BALL_RADIUS, 0, Math.PI * 2);
      ctx.clip();
      
      // Draw stripe rectangle through middle
      ctx.fillStyle = ball.color;
      // We draw the rectangle vertically or horizontally. Let's do horizontal.
      ctx.fillRect(cx - BALL_RADIUS, cy - BALL_RADIUS * 0.5, BALL_RADIUS * 2, BALL_RADIUS);
      ctx.restore();

      // Overlay slight shadow to make stripe look curved
      const overlayGrad = ctx.createRadialGradient(
        cx - BALL_RADIUS * 0.3, cy - BALL_RADIUS * 0.3, 1,
        cx, cy, BALL_RADIUS
      );
      overlayGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
      overlayGrad.addColorStop(0.8, 'rgba(0,0,0,0)');
      overlayGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = overlayGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Number plate
      this.drawNumberCircle(cx, cy, ball.id.toString(), ball.color);
    }
  }

  drawNumberCircle(cx, cy, numberString, color) {
    const ctx = this.ctx;
    const r = BALL_RADIUS * 0.45;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Number text
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${BALL_RADIUS * 0.55}px 'Space Grotesk'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(numberString, cx, cy + 0.5);
  }

  drawAimGuideline(cueBall, angle, balls) {
    const ctx = this.ctx;
    const cx = cueBall.x + CUSHION_WIDTH;
    const cy = cueBall.y + CUSHION_WIDTH;

    // Direct line vector
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);

    // Let's find if the guideline collides with any other ball first
    let closestDist = 1000;
    let targetX = cx + dirX * 1000;
    let targetY = cy + dirY * 1000;
    let hitBall = null;

    const cueX = cueBall.x;
    const cueY = cueBall.y;

    // Check ball collisions with the line ray
    for (const ball of balls) {
      if (ball.id === 0 || ball.isPocketed) continue;

      // Project ball position onto cue ray
      const toBallX = ball.x - cueX;
      const toBallY = ball.y - cueY;
      
      const projection = toBallX * dirX + toBallY * dirY;
      
      if (projection > 0) { // must be in front
        // Find closest point on line to ball center
        const closestX = cueX + dirX * projection;
        const closestY = cueY + dirY * projection;
        
        const distToLineSq = Math.pow(ball.x - closestX, 2) + Math.pow(ball.y - closestY, 2);
        
        // If distance is less than diameter (2*radius), there is a collision
        if (distToLineSq < Math.pow(BALL_DIAMETER, 2)) {
          // Calculate exact collision distance along ray
          const halfOverlap = Math.sqrt(Math.pow(BALL_DIAMETER, 2) - distToLineSq);
          const collisionDist = projection - halfOverlap;
          
          if (collisionDist < closestDist && collisionDist > 0) {
            closestDist = collisionDist;
            targetX = cueX + dirX * collisionDist + CUSHION_WIDTH;
            targetY = cueY + dirY * collisionDist + CUSHION_WIDTH;
            hitBall = ball;
          }
        }
      }
    }

    // Draw main dashed guideline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // If it hits a ball, draw a ghost cue ball at target position and deflection indicators
    if (hitBall) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      
      // Draw ghost cue ball
      ctx.beginPath();
      ctx.arc(targetX, targetY, BALL_RADIUS, 0, Math.PI * 2);
      ctx.stroke();

      // Draw secondary line showing target ball path
      const targetBallCx = hitBall.x + CUSHION_WIDTH;
      const targetBallCy = hitBall.y + CUSHION_WIDTH;

      const pathX = targetBallCx - targetX;
      const pathY = targetBallCy - targetY;
      const pathDist = Math.sqrt(pathX * pathX + pathY * pathY);
      
      if (pathDist > 0) {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)'; // Cyan path for object ball
        ctx.beginPath();
        ctx.moveTo(targetBallCx, targetBallCy);
        ctx.lineTo(targetBallCx + (pathX / pathDist) * 60, targetBallCy + (pathY / pathDist) * 60);
        ctx.stroke();
      }
    }
  }

  drawCueStick(cueBall, angle, power) {
    const ctx = this.ctx;
    const cx = cueBall.x + CUSHION_WIDTH;
    const cy = cueBall.y + CUSHION_WIDTH;

    // Angle is the shooting direction. The stick is in the opposite direction.
    const oppositeAngle = angle + Math.PI;

    // Distance offset of the stick from the cue ball, increases with power (pull-back animation)
    const powerOffset = power * 40;
    const baseOffset = BALL_RADIUS + 8; // small gap
    const totalOffset = baseOffset + powerOffset;

    // Cue stick dimensions
    const cueLength = 260;
    const thinWidth = 3;
    const thickWidth = 7;

    const dirX = Math.cos(oppositeAngle);
    const dirY = Math.sin(oppositeAngle);

    // Tip of the cue stick
    const tipX = cx + dirX * totalOffset;
    const tipY = cy + dirY * totalOffset;

    // Back end of the cue stick
    const endX = cx + dirX * (totalOffset + cueLength);
    const endY = cy + dirY * (totalOffset + cueLength);

    // Orthogonal vector for thickness
    const orthoX = -dirY;
    const orthoY = dirX;

    // Draw cue stick as a colored polygon (tapered shaft)
    // Wood gradient for the stick
    const stickGrad = ctx.createLinearGradient(tipX, tipY, endX, endY);
    stickGrad.addColorStop(0, '#faebd7'); // Ivory white tip
    stickGrad.addColorStop(0.05, '#e5c185'); // Wood start
    stickGrad.addColorStop(0.7, '#8b5a2b'); // Mahogany middle
    stickGrad.addColorStop(0.9, '#3d200e'); // Grip wrapper (black/dark)
    stickGrad.addColorStop(1, '#000000'); // Rubber bumper end

    ctx.fillStyle = stickGrad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    ctx.beginPath();
    // Tip points
    ctx.moveTo(tipX + orthoX * (thinWidth / 2), tipY + orthoY * (thinWidth / 2));
    ctx.lineTo(tipX - orthoX * (thinWidth / 2), tipY - orthoY * (thinWidth / 2));
    // End points
    ctx.lineTo(endX - orthoX * (thickWidth / 2), endY - orthoY * (thickWidth / 2));
    ctx.lineTo(endX + orthoX * (thickWidth / 2), endY + orthoY * (thickWidth / 2));
    ctx.closePath();
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }

  drawBallInHandIndicator(cueBall) {
    const ctx = this.ctx;
    const cx = cueBall.x + CUSHION_WIDTH;
    const cy = cueBall.y + CUSHION_WIDTH;

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, BALL_RADIUS + 6, 0, Math.PI * 2);
    ctx.stroke();

    // Pulsing outer glow ring
    const scale = 1 + 0.2 * Math.sin(Date.now() / 200);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(cx, cy, (BALL_RADIUS + 6) * scale, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Draw rounded rectangles
  drawRoundedRect(x, y, width, height, radius) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Helper to shade colors for 3D look
  shadeColor(color, percent) {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = parseInt((R * (100 + percent)) / 100);
    G = parseInt((G * (100 + percent)) / 100);
    B = parseInt((B * (100 + percent)) / 100);

    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;

    R = R > 0 ? R : 0;
    G = G > 0 ? G : 0;
    B = B > 0 ? B : 0;

    const rr = R.toString(16).padStart(2, '0');
    const gg = G.toString(16).padStart(2, '0');
    const bb = B.toString(16).padStart(2, '0');

    return `#${rr}${gg}${bb}`;
  }
}
