import {
  TABLE_WIDTH,
  TABLE_HEIGHT,
  BALL_RADIUS,
  BALL_DIAMETER,
  FRICTION,
  STOP_THRESHOLD,
  ELASTICITY,
  POCKET_RADIUS,
  POCKETS
} from './constants.js';

// Static cushion corner vertices to create realistic bounce effects at pocket entries
export const CUSHION_CORNERS = [
  // Top-Left pocket corners
  { x: POCKET_RADIUS, y: 0 },
  { x: 0, y: POCKET_RADIUS },
  // Top-Middle pocket corners
  { x: TABLE_WIDTH / 2 - POCKET_RADIUS, y: 0 },
  { x: TABLE_WIDTH / 2 + POCKET_RADIUS, y: 0 },
  // Top-Right pocket corners
  { x: TABLE_WIDTH - POCKET_RADIUS, y: 0 },
  { x: TABLE_WIDTH, y: POCKET_RADIUS },
  // Bottom-Left pocket corners
  { x: POCKET_RADIUS, y: TABLE_HEIGHT },
  { x: 0, y: TABLE_HEIGHT - POCKET_RADIUS },
  // Bottom-Middle pocket corners
  { x: TABLE_WIDTH / 2 - POCKET_RADIUS, y: TABLE_HEIGHT },
  { x: TABLE_WIDTH / 2 + POCKET_RADIUS, y: TABLE_HEIGHT },
  // Bottom-Right pocket corners
  { x: TABLE_WIDTH - POCKET_RADIUS, y: TABLE_HEIGHT },
  { x: TABLE_WIDTH, y: TABLE_HEIGHT - POCKET_RADIUS }
];

/**
 * Updates physics for all balls by 1 timestep (usually 16ms)
 * @param {Array} balls - List of ball objects {id, type, x, y, vx, vy, isPocketed}
 * @param {number} dt - Timestep in seconds (e.g. 0.016 for 60fps)
 * @param {Function} onPocketCallback - Optional callback when a ball is pocketed: (ball, pocketId) => {}
 * @param {Function} onCollisionCallback - Optional callback when a collision occurs: (type, intensity) => {}
 */
export function updatePhysicsStep(balls, dt = 0.016, onPocketCallback = null, onCollisionCallback = null) {
  const activeBalls = balls.filter(b => !b.isPocketed);

  // 1. Move balls and apply friction
  for (const ball of activeBalls) {
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Apply friction (exponential decay based on dt)
    const stepFriction = Math.pow(FRICTION, dt / 0.016);
    ball.vx *= stepFriction;
    ball.vy *= stepFriction;

    // Stop ball if it's moving extremely slowly
    const speedSq = ball.vx * ball.vx + ball.vy * ball.vy;
    if (speedSq < STOP_THRESHOLD * STOP_THRESHOLD) {
      ball.vx = 0;
      ball.vy = 0;
    }
  }

  // 2. Check Pocket Collisions
  for (const ball of activeBalls) {
    for (const pocket of POCKETS) {
      const dx = ball.x - pocket.x;
      const dy = ball.y - pocket.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < POCKET_RADIUS * POCKET_RADIUS) {
        ball.isPocketed = true;
        ball.vx = 0;
        ball.vy = 0;
        if (onPocketCallback) {
          onPocketCallback(ball, pocket.id);
        }
        break;
      }
    }
  }

  // Refresh active list after pocketing
  const remainingBalls = balls.filter(b => !b.isPocketed);

  // 3. Flat Cushion Collisions (boundaries)
  for (const ball of remainingBalls) {
    // Top-Left & Top-Right Cushions
    if (ball.y - BALL_RADIUS <= 0) {
      const inTopLeftSegment = ball.x >= POCKET_RADIUS && ball.x <= (TABLE_WIDTH / 2 - POCKET_RADIUS);
      const inTopRightSegment = ball.x >= (TABLE_WIDTH / 2 + POCKET_RADIUS) && ball.x <= (TABLE_WIDTH - POCKET_RADIUS);
      
      if (inTopLeftSegment || inTopRightSegment) {
        ball.y = BALL_RADIUS;
        const bounceIntensity = Math.abs(ball.vy);
        ball.vy = -ball.vy * ELASTICITY;
        if (onCollisionCallback && bounceIntensity > 2) {
          onCollisionCallback('cushion', bounceIntensity);
        }
      }
    }

    // Bottom-Left & Bottom-Right Cushions
    if (ball.y + BALL_RADIUS >= TABLE_HEIGHT) {
      const inBottomLeftSegment = ball.x >= POCKET_RADIUS && ball.x <= (TABLE_WIDTH / 2 - POCKET_RADIUS);
      const inBottomRightSegment = ball.x >= (TABLE_WIDTH / 2 + POCKET_RADIUS) && ball.x <= (TABLE_WIDTH - POCKET_RADIUS);
      
      if (inBottomLeftSegment || inBottomRightSegment) {
        ball.y = TABLE_HEIGHT - BALL_RADIUS;
        const bounceIntensity = Math.abs(ball.vy);
        ball.vy = -ball.vy * ELASTICITY;
        if (onCollisionCallback && bounceIntensity > 2) {
          onCollisionCallback('cushion', bounceIntensity);
        }
      }
    }

    // Left Cushion
    if (ball.x - BALL_RADIUS <= 0) {
      const inLeftSegment = ball.y >= POCKET_RADIUS && ball.y <= (TABLE_HEIGHT - POCKET_RADIUS);
      if (inLeftSegment) {
        ball.x = BALL_RADIUS;
        const bounceIntensity = Math.abs(ball.vx);
        ball.vx = -ball.vx * ELASTICITY;
        if (onCollisionCallback && bounceIntensity > 2) {
          onCollisionCallback('cushion', bounceIntensity);
        }
      }
    }

    // Right Cushion
    if (ball.x + BALL_RADIUS >= TABLE_WIDTH) {
      const inRightSegment = ball.y >= POCKET_RADIUS && ball.y <= (TABLE_HEIGHT - POCKET_RADIUS);
      if (inRightSegment) {
        ball.x = TABLE_WIDTH - BALL_RADIUS;
        const bounceIntensity = Math.abs(ball.vx);
        ball.vx = -ball.vx * ELASTICITY;
        if (onCollisionCallback && bounceIntensity > 2) {
          onCollisionCallback('cushion', bounceIntensity);
        }
      }
    }
  }

  // 4. Cushion Corner (Horns) Collisions
  for (const ball of remainingBalls) {
    for (const corner of CUSHION_CORNERS) {
      const dx = ball.x - corner.x;
      const dy = ball.y - corner.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < BALL_RADIUS) {
        const nx = dx / dist;
        const ny = dy / dist;
        ball.x = corner.x + nx * BALL_RADIUS;
        ball.y = corner.y + ny * BALL_RADIUS;

        const vn = ball.vx * nx + ball.vy * ny;
        if (vn < 0) {
          ball.vx = ball.vx - 2 * vn * nx * ELASTICITY;
          ball.vy = ball.vy - 2 * vn * ny * ELASTICITY;
          if (onCollisionCallback && Math.abs(vn) > 2) {
            onCollisionCallback('cushion', Math.abs(vn));
          }
        }
      }
    }
  }

  // 5. Ball-to-Ball Collisions (Double loop)
  for (let i = 0; i < remainingBalls.length; i++) {
    const ballA = remainingBalls[i];
    for (let j = i + 1; j < remainingBalls.length; j++) {
      const ballB = remainingBalls[j];

      const dx = ballB.x - ballA.x;
      const dy = ballB.y - ballA.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < BALL_DIAMETER * BALL_DIAMETER) {
        const dist = Math.sqrt(distSq);
        if (dist === 0) continue;

        const overlap = BALL_DIAMETER - dist;
        const nx = dx / dist;
        const ny = dy / dist;

        ballA.x -= nx * (overlap / 2);
        ballA.y -= ny * (overlap / 2);
        ballB.x += nx * (overlap / 2);
        ballB.y += ny * (overlap / 2);

        const tx = -ny;
        const ty = nx;

        const vna = ballA.vx * nx + ballA.vy * ny;
        const vta = ballA.vx * tx + ballA.vy * ty;
        const vnb = ballB.vx * nx + ballB.vy * ny;
        const vtb = ballB.vx * tx + ballB.vy * ty;

        const relativeNormalVelocity = Math.abs(vna - vnb);

        const vnaNew = vnb * ELASTICITY;
        const vnbNew = vna * ELASTICITY;

        ballA.vx = vnaNew * nx + vta * tx;
        ballA.vy = vnaNew * ny + vta * ty;
        ballB.vx = vnbNew * nx + vtb * tx;
        ballB.vy = vnbNew * ny + vtb * ty;

        if (onCollisionCallback && relativeNormalVelocity > 2) {
          onCollisionCallback('ball', relativeNormalVelocity);
        }
      }
    }
  }
}

/**
 * Checks if all balls on the table are completely stationary
 * @param {Array} balls - List of ball objects
 * @returns {boolean}
 */
export function areBallsStationary(balls) {
  return balls.every(b => b.isPocketed || (b.vx === 0 && b.vy === 0));
}

/**
 * Initialize standard 8-ball positions in a rack
 * @returns {Array} List of initialized balls
 */
export function initialize8BallRack() {
  const balls = [];
  
  // 1. Add Cue Ball (id = 0)
  balls.push({
    id: 0,
    type: BALL_TYPES.CUE,
    x: D_LINE_X,
    y: TABLE_HEIGHT / 2,
    vx: 0,
    vy: 0,
    isPocketed: false,
    color: '#ffffff'
  });

  // 2. Build the rack of 15 balls at the apex
  // The rack is 5 rows deep:
  // Row 0: 1 ball
  // Row 1: 2 balls
  // Row 2: 3 balls
  // Row 3: 4 balls
  // Row 4: 5 balls
  
  // Specific layouts for solid/stripe configuration:
  // 8-ball (black) is always in the center of Row 2.
  // One corner of the base row must be a stripe, the other a solid.
  // The rest can be distributed. Let's list the ball numbers (1-15).
  // Solids: 1-7 (colors: yellow, blue, red, purple, orange, green, maroon)
  // 8-ball: 8 (black)
  // Stripes: 9-15 (colors: yellow, blue, red, purple, orange, green, maroon stripes)
  
  const ballColors = [
    '#ffffff', // 0 (cue)
    '#f1c40f', // 1 yellow
    '#2980b9', // 2 blue
    '#c0392b', // 3 red
    '#8e44ad', // 4 purple
    '#d35400', // 5 orange
    '#27ae60', // 6 green
    '#78281f', // 7 maroon
    '#2c3e50', // 8 black
    '#f1c40f', // 9 yellow stripe
    '#2980b9', // 10 blue stripe
    '#c0392b', // 11 red stripe
    '#8e44ad', // 12 purple stripe
    '#d35400', // 13 orange stripe
    '#27ae60', // 14 green stripe
    '#78281f'  // 15 maroon stripe
  ];

  // Specific ball indices for each position in the rack to satisfy standard rules
  // (8-ball in center, corners mixed)
  // Position indices in rack (0 to 14):
  //       0
  //      1 2
  //     3 4 5  <- index 4 must be the 8-ball (ball 8)
  //    6 7 8 9
  //  10 11 12 13 14 <- index 10 and 14 must be opposite types (e.g. ball 1 and ball 15)
  const rackOrder = [
    1,          // Row 0
    9, 2,       // Row 1
    10, 8, 3,   // Row 2 (8-ball in center)
    11, 4, 12, 5, // Row 3
    13, 6, 14, 7, 15 // Row 4 (corners: 13 (stripe) and 15 (stripe)? Wait, 13 and 15 are both stripes. Let's make corner 10 a solid or swap 15/7)
  ];
  
  // Let's swap 15 and 7 to make sure corners are opposite:
  // Position 10: 13 (stripe)
  // Position 14: 7 (solid) - perfect!

  const ballRadius = BALL_RADIUS;
  const colSpacing = ballRadius * Math.sqrt(3); // Horizontal spacing between rows
  const rowSpacing = ballRadius * 2; // Vertical spacing within a row

  let rackIndex = 0;
  for (let row = 0; row < 5; row++) {
    const startY = APEX_Y - (row * rowSpacing) / 2;
    const x = APEX_X + row * colSpacing;
    
    for (let col = 0; col <= row; col++) {
      const y = startY + col * rowSpacing;
      const num = rackOrder[rackIndex++];
      
      let type = BALL_TYPES.SOLID;
      if (num === 8) type = BALL_TYPES.BLACK;
      else if (num > 8) type = BALL_TYPES.STRIPE;

      balls.push({
        id: num,
        type: type,
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        isPocketed: false,
        color: ballColors[num]
      });
    }
  }

  return balls;
}
export const BALL_TYPES = {
  CUE: 'CUE',
  SOLID: 'SOLID',
  STRIPE: 'STRIPE',
  BLACK: 'BLACK'
};
