import { Piece } from './piece';
import { Dispenser } from './dispenser';
import { Collector } from './collector';
import { BallColor, Direction, Ball } from './ball';

class Peg {
    position: {x: number, y: number } = {x: 0, y: 0 };
    isValid: boolean = false;
    isPieceSlot: boolean = false;

    piece: Piece | null = null;

    constructor(position: {x: number, y: number }, isValid: boolean, isPieceSlot: boolean) {
        this.position = position;
        this.isValid = isValid;
        this.isPieceSlot = isPieceSlot;
    }

    render(canvasContext: CanvasRenderingContext2D) {
        if (this.isValid) {
            canvasContext.beginPath();
            canvasContext.arc(this.position.x, this.position.y, 0.075, 0, 2 * Math.PI);
            canvasContext.lineWidth = 0.05;
            canvasContext.strokeStyle = "darkslategrey";
            canvasContext.stroke();

            if (this.isPieceSlot) {
                canvasContext.beginPath();
                canvasContext.arc(this.position.x, this.position.y + 0.15, 0.25, 0.25 * Math.PI, 0.75 * Math.PI, false);
                canvasContext.lineWidth = 0.05;
                canvasContext.strokeStyle = "darkslategrey";
                canvasContext.stroke();
            }

            if (this.piece != null) {
                this.piece.render(canvasContext);
            }
        }
    }
}

export class BoardConfiguration {
    size: { w: number, h: number } = { w: 11, h: 11 };
    startingColor: BallColor = BallColor.Blue;
    numBlueBalls: number = 8;
    numRedBalls: number = 8;
    entryPoint: number = 2;
}

export class Board {
    private readonly padding = { top: 64, left: 25, bottom: 64, right: 25 };

    private _configuration: BoardConfiguration;

    get size() {
        return this._configuration.size;
    }

    get halfWidth() { return 0.5 * (this.size.w - 1); }

    
    private m_pegs : Peg[][] = [];
    private m_dispenser: Dispenser = new Dispenser();
    private m_collector: Collector = new Collector();

    private m_prevTime: number = 0;
    private m_animationDuration: number = 0.25;
    private m_animationTime: number = 0;

    private m_currBall: Ball = null;

    private m_running: boolean = false;
    get running() {
        return this.m_running;
    }

    get animationSpeed() {
        return 1 / this.m_animationDuration;
    }

    set animationSpeed(value: number) {
        this.m_animationDuration = 1 / value;
    }
    
    constructor(boardConfiguration: BoardConfiguration) {
        this.configure(boardConfiguration);
    }

    configure(boardConfiguration: BoardConfiguration) {
        this._configuration = boardConfiguration;

        for (let i = 0; i < this.size.w; i++) {
            let x = i - this.halfWidth;
            this.m_pegs[i] = [];
            for (let j = 0; j < this.size.h; j++) {
                let y = j;
                let pos = { x: x, y: y };
                this.m_pegs[i][j] = new Peg(pos, this.isValidPosition(pos), this.isPieceSlot(pos));
            }
        }

        this.m_dispenser.entryPoint = this._configuration.entryPoint;
        this.m_dispenser.fillBalls(this._configuration.numBlueBalls, this._configuration.numRedBalls);
    }

    start() {
        this.m_running = true;
        this.m_prevTime = Date.now();

        if (this.m_currBall === null) {
            this.m_animationTime = 0;
            this.m_currBall = this.m_dispenser.dispenseBall(this._configuration.startingColor);
        }
    }
    
    stop() {
        this.m_running = false;
    }

    reset() {
        this.stop();
        this.m_animationTime = 0;

        this.m_dispenser.fillBalls(this._configuration.numBlueBalls, this._configuration.numRedBalls);
        this.m_collector.clear();
        this.m_currBall = null;
    }

    canvasPosToBoardPos(canvasPosition: { x: number, y: number}, canvasSize: { w: number, h: number }): { x: number, y: number } {
        let xScale = (canvasSize.w - this.padding.left - this.padding.right) / this.size.w;
        let yScale = (canvasSize.h - this.padding.top - this.padding.bottom) / (this.size.h + Dispenser.height + Collector.height);
        let scale = Math.min(xScale, yScale);

        return { x: (canvasPosition.x - 0.5 * canvasSize.w) / scale, y: (canvasPosition.y - this.padding.top) / scale - 1};
    }

    boardPosToCanvasPos(boardPosition: { x: number, y: number}, canvasSize: { w: number, h: number }): { x: number, y: number } {
        let xScale = (canvasSize.w - this.padding.left - this.padding.right) / this.size.w;
        let yScale = (canvasSize.h - this.padding.top - this.padding.bottom) / (this.size.h + Dispenser.height + Collector.height);
        let scale = Math.min(xScale, yScale);

        return { x: scale * boardPosition.x + 0.5 * canvasSize.w, y: (boardPosition.y + 1) * scale + this.padding.top };
    }

    clear() {
        for (let i = 0; i < this.size.w; i++) {
            for (let j = 0; j < this.size.h; j++) {
                this.m_pegs[i][j].piece = null;
            }
        }
    }

    placePiece(piece: Piece, position: { x: number, y: number }): boolean {
        const pegPos = this.findNearestPieceSlot(position);

        if (pegPos != null) {
            let peg = this.m_pegs[pegPos.x + this.halfWidth][pegPos.y];
            peg.piece = piece;
            piece.attachToBoard(peg.position);
            return true;
        } else {
            return false;
        }
    }

    removePiece(piece: Piece) {
        let peg = this.m_pegs[piece.position.x + this.halfWidth][piece.position.y];

        if (peg != null) {
            peg.piece.removeFromBoard();
            peg.piece = null;
        }
    }

    getPieceAt(position: { x: number, y: number }): Piece {
        const pegPos = this.findNearestPieceSlot(position);

        if (pegPos != null) {
            let peg = this.m_pegs[pegPos.x + this.halfWidth][pegPos.y];
            return peg.piece;
        } else {
            return null;
        }
    };

    private findNearestPieceSlot(position: { x: number, y: number }): { x: number, y: number } {
        const parityDiff = Math.abs((this.size.h - 1) % 2 - Math.round(position.y) % 2);
        const pegPos = { x: Math.round(0.5 * (position.x - parityDiff)) * 2 + parityDiff, y: Math.round(position.y) };

        if (this.isValidPosition(pegPos) && this.isPieceSlot(pegPos)) {
            return pegPos;
        } else {
            return null;
        }
    }

    tick() {
        if (this.m_running) {
            const currTime = Date.now();
            const delta = currTime - this.m_prevTime;

            this.m_animationTime += delta;

            if (this.m_animationTime > this.m_animationDuration * 1000) {
                this.m_animationTime = 0;
                this.onAnimationComplete();
            }

            this.m_prevTime = currTime;
        }
    }

    render(canvasContext: CanvasRenderingContext2D, canvasSize: { w: number, h: number }) {
        let xScale = (canvasSize.w - this.padding.left - this.padding.right) / this.size.w;
        let yScale = (canvasSize.h - this.padding.top - this.padding.bottom) / (this.size.h + Dispenser.height + Collector.height);
        let scale = Math.min(xScale, yScale);

        canvasContext.setTransform(scale, 0, 0, scale, 0.5 * canvasSize.w, this.padding.top);

        this.renderBackground(canvasContext);

        this.m_dispenser.render(canvasContext, this.size);

        canvasContext.translate(0, 1);

        for (let i = 0; i < this.size.w; i++) {
            for (let j = 0; j < this.size.h; j++) {
                this.m_pegs[i][j].render(canvasContext);
            }
        }

        if (this.m_currBall) {
            const currPeg = this.m_pegs[this.m_currBall.position.x + this.halfWidth][this.m_currBall.position.y];

            if (currPeg) {
                this.renderBall(canvasContext, currPeg);
            }
        }

        this.m_collector.render(canvasContext, this.size);
        canvasContext.translate(0, -1);
    }

    private renderBall(canvasContext: CanvasRenderingContext2D, peg: Peg) {
        if (peg.piece != null && this.m_currBall) {
            let ballPos: { x: number, y: number };
            if (this.m_currBall.direction != Direction.None) {
                const rawPos = peg.piece.animate(this.m_animationTime / (this.m_animationDuration * 1000), this.m_currBall.direction);
                ballPos = { x: rawPos.x + peg.position.x, y: rawPos.y + peg.position.y};
            } else {
                ballPos = peg.position;
            }

            this.m_currBall.render(canvasContext, ballPos);
        }
    }

    private renderBackground(canvasContext: CanvasRenderingContext2D) {
        const x = -this.halfWidth - 0.5, y = -0.5;
        const w = this.size.w, h = this.size.h + Dispenser.height + Collector.height + 1;
        const r = 1;

        const path = new Path2D(`
            M ${x} ${y + r}
            A ${r} ${r} 0 0 1 ${x + r} ${y}
            H ${x + w - r}
            A ${r} ${r} 0 0 1 ${x + w} ${y + r}
            V ${y + h - r}
            A ${r} ${r} 0 0 1 ${x + w - r} ${y + h}
            H ${x + r}
            A ${r} ${r} 0 0 1 ${x} ${y + h - r}
            z
        `);

        canvasContext.beginPath();
        canvasContext.shadowBlur = 20;
        canvasContext.shadowColor = "darkgrey";
        canvasContext.shadowOffsetY = 4;
        canvasContext.fillStyle = "white";
        canvasContext.fill(path);

        canvasContext.shadowColor = "transparent";
        canvasContext.shadowBlur = 0;
        canvasContext.shadowOffsetY = 0;

        canvasContext.strokeStyle = "black";
        canvasContext.lineWidth = 0.03;
        canvasContext.stroke(path);
    }

    private onAnimationComplete() {
        const peg: Peg = this.m_pegs[this.m_currBall.position.x + this.halfWidth][this.m_currBall.position.y];

        if (peg && peg.piece != null) {
            const outDir = peg.piece.operate(this.m_currBall.direction);

            if (outDir === Direction.None) {
                this.stop();
                return;
            }

            this.m_currBall.drop(outDir);

            if (this.m_currBall.isAtBottom(this.size)) {
                this.m_collector.collectBall(this.m_currBall);

                if (this.m_currBall.position.x < 0) {
                    this.m_currBall = this.m_dispenser.dispenseBall(BallColor.Blue);
                } else {
                    this.m_currBall = this.m_dispenser.dispenseBall(BallColor.Red);
                }

                if (this.m_currBall === null) {
                    this.stop();
                }
            }
        }
    }

    private isPieceSlot(position: {x: number, y: number }) {
        const parity = this.size.h % 2;

        // If the position's y coordinate has the opposite parity as the board's height, then the piece slots will be on pegs with even x coordinates; otherwise they will be on odd x coordinates.
        if (position.y % 2 != parity) {
            return Math.abs(position.x % 2) === 0;
        } else {
            return Math.abs(position.x % 2) === 1;
        }
    }

    private isValidPosition(position: {x: number, y: number }): boolean {
        // Board width is always odd, so the half width will be one minus the width, making it equal to the number of pegs on the left or right.
        const halfWidth = 0.5 * (this.size.w - 1);

        // First, check that the position is within the board's bounds.
        if (position.x < -halfWidth || position.x > halfWidth || position.y < 0 || position.y > this.size.h) {
            return false;
        }

        // In the bottom row, only the middle peg is valid.
        if (position.y == this.size.h - 1 && position.x != 0) {
            return false;
        }

        const y1 = -Math.abs(position.x) + this.m_dispenser.entryPoint - 2;
        const y2 = Math.abs(position.x) - this.m_dispenser.entryPoint - 2;
        
        if (position.y <= y1 || position.y <= y2) {
            return false;
        }
        
        return true;
    }
}