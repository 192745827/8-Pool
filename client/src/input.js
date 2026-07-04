import { CUSHION_WIDTH, TABLE_WIDTH, TABLE_HEIGHT, BALL_RADIUS } from '../../shared/constants.js';

export class InputHandler {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Function} onShoot - Callback when a shot is fired: (angle, power) => {}
   * @param {Function} onBallMove - Callback when cue ball is dragged during ball-in-hand: (x, y) => {}
   */
  constructor(canvas, onShoot, onBallMove) {
    this.canvas = canvas;
    this.onShoot = onShoot;
    this.onBallMove = onBallMove;

    this.mouse = { x: 0, y: 0 };
    this.angle = 0;
    this.power = 0;

    this.isMouseDown = false;
    this.startDragX = 0;
    this.startDragY = 0;
    
    this.isDraggingCueBall = false;
    
    // Configurable maximum pull distance in pixels for 100% power
    this.maxPullDistance = 150;

    // HUD bindings
    this.powerSliderFill = document.getElementById('power-slider-fill');
    this.powerPercentage = document.getElementById('power-percentage');

    this.setupListeners();
  }

  setupListeners() {
    // Mouse Move
    this.canvas.addEventListener('mousemove', (e) => this.handlePointerMove(e));
    this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
    window.addEventListener('mouseup', (e) => this.handlePointerUp(e));

    // Touch Support
    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.handlePointerMove(e.touches[0]);
      }
      e.preventDefault();
    }, { passive: false });

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.handlePointerDown(e.touches[0]);
      }
      e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
      this.handlePointerUp(e);
    });
  }

  /**
   * Set dynamic options from game loop
   */
  updateState(cueBall, isMyTurn, isBallInHand, balls) {
    this.cueBall = cueBall;
    this.isMyTurn = isMyTurn;
    this.isBallInHand = isBallInHand;
    this.balls = balls;
  }

  // Get pointer coordinates relative to the playing area
  getPointerCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    // Canvas is stretched/responsive, so we must calculate scales
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    // Subtract cushion width to get table coordinate space (0-800, 0-400)
    return {
      x: canvasX - CUSHION_WIDTH,
      y: canvasY - CUSHION_WIDTH
    };
  }

  handlePointerDown(e) {
    if (!this.isMyTurn || !this.cueBall || this.cueBall.isPocketed) return;

    const coords = this.getPointerCoords(e);
    this.isMouseDown = true;
    this.startDragX = coords.x;
    this.startDragY = coords.y;

    // Check if player clicked near the cue ball to drag it (only in Ball-In-Hand)
    if (this.isBallInHand) {
      const dx = coords.x - this.cueBall.x;
      const dy = coords.y - this.cueBall.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < BALL_RADIUS * 2) {
        this.isDraggingCueBall = true;
        return;
      }
    }

    // Otherwise, start pull-back shoot power mechanism
    this.power = 0;
    this.updatePowerHUD();
  }

  handlePointerMove(e) {
    if (!this.cueBall || this.cueBall.isPocketed) return;

    const coords = this.getPointerCoords(e);
    this.mouse = coords;

    // Case 1: Dragging the cue ball under Ball-In-Hand rules
    if (this.isDraggingCueBall && this.isBallInHand && this.isMyTurn) {
      // Validate bounds so cue ball stays on table
      let targetX = Math.max(BALL_RADIUS, Math.min(TABLE_WIDTH - BALL_RADIUS, coords.x));
      let targetY = Math.max(BALL_RADIUS, Math.min(TABLE_HEIGHT - BALL_RADIUS, coords.y));

      // Make sure it doesn't overlap other balls
      let overlaps = false;
      for (const ball of this.balls) {
        if (ball.id === 0 || ball.isPocketed) continue;
        const dx = targetX - ball.x;
        const dy = targetY - ball.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < Math.pow(BALL_RADIUS * 2.2, 2)) { // slight padding
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        this.onBallMove(targetX, targetY);
      }
      return;
    }

    // Case 2: Dragging backwards to select power
    if (this.isMouseDown && this.isMyTurn && !this.isDraggingCueBall) {
      // Calculate pull back distance
      // Aim vector (from cue ball to start click location)
      const aimDx = this.startDragX - this.cueBall.x;
      const aimDy = this.startDragY - this.cueBall.y;
      const aimAngle = Math.atan2(aimDy, aimDx);
      this.angle = aimAngle; // Lock in the shoot angle during drag

      // Drag vector relative to start point
      const dragDx = this.startDragX - coords.x;
      const dragDy = this.startDragY - coords.y;

      // Project drag vector onto the opposite of the aim vector
      // Pulling backward = higher power
      const pullX = -Math.cos(aimAngle);
      const pullY = -Math.sin(aimAngle);
      
      const pullDistance = dragDx * pullX + dragDy * pullY;
      
      if (pullDistance > 0) {
        this.power = Math.min(1, pullDistance / this.maxPullDistance);
      } else {
        this.power = 0;
      }
      this.updatePowerHUD();
    } 
    // Case 3: Simple hovering to aim
    else if (!this.isMouseDown) {
      // Calculate angle from cue ball to mouse cursor
      const dx = coords.x - this.cueBall.x;
      const dy = coords.y - this.cueBall.y;
      this.angle = Math.atan2(dy, dx);
    }
  }

  handlePointerUp(e) {
    if (this.isDraggingCueBall) {
      this.isDraggingCueBall = false;
      this.isMouseDown = false;
      return;
    }

    if (this.isMouseDown && this.isMyTurn) {
      this.isMouseDown = false;
      
      // If power is high enough, fire!
      if (this.power >= 0.02) {
        console.log(`InputHandler: shooting with angle=${this.angle}, power=${this.power}`);
        this.onShoot(this.angle, this.power);
      }
      
      this.power = 0;
      this.updatePowerHUD();
    }
  }

  updatePowerHUD() {
    const percent = Math.round(this.power * 100);
    if (this.powerSliderFill) {
      // Vertical bar height or horizontal width depending on media query layout
      // We set height/width of style
      const isMobile = window.innerWidth <= 900;
      if (isMobile) {
        this.powerSliderFill.style.width = `${percent}%`;
        this.powerSliderFill.style.height = `100%`;
      } else {
        this.powerSliderFill.style.height = `${percent}%`;
        this.powerSliderFill.style.width = `100%`;
      }
    }
    if (this.powerPercentage) {
      this.powerPercentage.textContent = `${percent}%`;
    }
  }
}
