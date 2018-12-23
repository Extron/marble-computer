import { Piece, Direction } from './piece';
import { Path } from './pieces/path';
import { Cross } from './pieces/cross';
import { Terminal } from './pieces/terminal';

type Point = [number, number];

export enum BallColor {
    Blue = 0,
    Red = 1
}

export enum Coordinate {
    X = 0,
    Y = 1
}

class Peg {
    position: Point = [0, 0];
    isValid: boolean = false;
    isPieceSlot: boolean = false;

    piece: Piece | null = null;

    constructor(position: Point, isValid: boolean, isPieceSlot: boolean) {
        this.position = position;
        this.isValid = isValid;
        this.isPieceSlot = isPieceSlot;
    }

    render(canvasContext: CanvasRenderingContext2D) {
        if (this.isValid) {
            canvasContext.beginPath();
            canvasContext.arc(this.position[Coordinate.X], this.position[Coordinate.Y], 0.075, 0, 2 * Math.PI);
            canvasContext.lineWidth = 0.05;
            canvasContext.strokeStyle = "darkslategrey";
            canvasContext.stroke();

            if (this.isPieceSlot) {
                canvasContext.beginPath();
                canvasContext.arc(this.position[Coordinate.X], this.position[Coordinate.Y] + 0.15, 0.25, 0.25 * Math.PI, 0.75 * Math.PI, false);
                canvasContext.lineWidth = 0.05;
                canvasContext.strokeStyle = "darkslategrey";
                canvasContext.stroke();
            }
        }
    }
}

export class Board {
    private m_size: Point = [11, 11];
    private m_numBalls: [number, number] = [8, 8];
    private m_entryPoint: number = 2;
    private m_pegs : Peg[][] = [];
    private m_startColor: BallColor = BallColor.Blue;

    private m_prevTime: number = 0;
    private m_animationDuration: number = 0.25;
    private m_animationTime: number = 0;

    private m_currBallPos: [number, number] = [0, 0];
    private m_currBallDirection: Direction = Direction.Left;
    private m_currBallColor: BallColor = BallColor.Blue;

    private m_outputBalls: BallColor[] = [];

    constructor(size: Point) {
        this.m_size = size;

        this.initializeBoard();
    }

    private initializeBoard() {
        const halfWidth = 0.5 * (this.m_size[Coordinate.X] - 1);

        for (let i = 0; i < this.m_size[Coordinate.X]; i++) {
            let x = i - halfWidth;
            this.m_pegs[i] = [];
            for (let j = 0; j < this.m_size[Coordinate.Y]; j++) {
                let y = j;
                this.m_pegs[i][j] = new Peg([x, y], this.isValidPosition([x, y]), this.isPieceSlot([x, y]));

                if (this.m_pegs[i][j].isPieceSlot && this.m_pegs[i][j].isValid) {

                    if (j % 2 === 0) {
                        this.m_pegs[i][j].piece = new Cross();
                    } else {
                        this.m_pegs[i][j].piece = new Path();
                    }
                    //this.m_pegs[i][j].piece = new Path();
                    if (i > halfWidth ) {
                        this.m_pegs[i][j].piece.flipOrientation();
                    }
                }
            }
        }

        this.m_currBallColor = BallColor.Blue;
        this.m_currBallDirection = Direction.Left;
        this.m_currBallPos = [halfWidth - this.m_entryPoint, 0];

        this.m_prevTime = Date.now();
    }

    run() {
        let dropColor = this.m_startColor;

        while (this.m_numBalls[dropColor] > 0) {
            let ballPos: Point = [dropColor === BallColor.Blue ? -this.m_entryPoint : this.m_entryPoint, 0];
            let direction = dropColor === BallColor.Blue ? Direction.Right : Direction.Left;

            while (ballPos[Coordinate.Y] < this.m_size[Coordinate.Y]) {
                let piece = this.m_pegs[ballPos[Coordinate.X]][ballPos[Coordinate.Y]].piece;

                if (piece != null) {
                    direction = piece.operate(direction);

                    if (direction === Direction.None) {
                        // TODO: Terminate
                        return;
                    }

                    ballPos = this.dropBall(ballPos, direction);

                } else {
                    // TODO: Drop ball
                    // Currently, drop it straight down.
                    ballPos[Coordinate.Y] = this.m_size[Coordinate.Y];
                }
            }

            if (ballPos[Coordinate.X] < 0) {
                dropColor = BallColor.Blue;
            } else {
                dropColor = BallColor.Red;
            }
        }

        return;
    }

    tick() {
        const currTime = Date.now();
        const delta = currTime - this.m_prevTime;

        this.m_animationTime += delta;

        if (this.m_animationTime > this.m_animationDuration * 1000) {
            this.m_animationTime = 0;
            this.onAnimationComplete();
        }

        this.m_prevTime = currTime;
    }

    render(canvasContext: CanvasRenderingContext2D, canvasSize: [number, number]) {
        let padding = [32, 25, 0, 25];
        let xScale = (canvasSize[0] - padding[1] - padding[3]) / this.m_size[Coordinate.X];
        let yScale = (canvasSize[1] - padding[0] - padding[2]) / (this.m_size[Coordinate.Y] + 0.65 + 1);
        let scale = Math.min(xScale, yScale);

        canvasContext.setTransform(scale, 0, 0, scale, 0.5 * canvasSize[0], padding[0]);
        this.renderDispensers(canvasContext);
        canvasContext.translate(0, 1);
        const halfWidth = 0.5 * (this.m_size[Coordinate.X] - 1);
        for (let i = 0; i < this.m_size[Coordinate.X]; i++) {
            const x = i - halfWidth;
            for (let j = 0; j < this.m_size[Coordinate.Y]; j++) {
                const y = j;
                let peg = this.m_pegs[i][j];

                peg.render(canvasContext);

                if (peg.piece != null) {
                    peg.piece.render(canvasContext, [x, y]);
                }
            }
        }

        const currPeg = this.m_pegs[this.m_currBallPos[0]][this.m_currBallPos[1]];

        if (currPeg) {
            this.renderBall(canvasContext, currPeg);
        }

        this.renderCollector(canvasContext);
        canvasContext.translate(0, -1);
    }

    private renderDispensers(canvasContext: CanvasRenderingContext2D) {
        const halfWidth = 0.5 * (this.m_size[Coordinate.X] - 1);
        let path = new Path2D(`M -${halfWidth} 0.15 L -${this.m_entryPoint + 0.65} 0.65 M ${halfWidth} 0.15 L ${this.m_entryPoint + 0.65} 0.65`);

        canvasContext.beginPath();
        canvasContext.lineWidth = 0.15;
        canvasContext.strokeStyle = "darkslategrey";
        canvasContext.stroke(path);

        const ballRadius = 0.1;
        let x_0 = this.m_entryPoint + 0.65;
        let m = 0.5 / (x_0 - halfWidth);

        for (let i = 0; i < Math.min(this.m_numBalls[BallColor.Blue], 12); i++) {
            let x = -x_0 - i * ballRadius * 2;
            let y = -m * (x + halfWidth) - 2 * ballRadius + 0.15;

            canvasContext.beginPath();
            canvasContext.arc(x, y, ballRadius, 0, 2 * Math.PI);
            canvasContext.fillStyle = "blue";
            canvasContext.fill();
        }

        for (let i = 0; i < Math.min(this.m_numBalls[BallColor.Red], 12); i++) {
            let x = x_0 + i * ballRadius * 2;
            let y = m * (x - halfWidth) - 2 * ballRadius + 0.15;

            canvasContext.beginPath();
            canvasContext.arc(x, y, ballRadius, 0, 2 * Math.PI);
            canvasContext.fillStyle = "red";
            canvasContext.fill();
        }
    }

    private renderCollector(canvasContext: CanvasRenderingContext2D) {
        const halfWidth = 0.5 * (this.m_size[Coordinate.X] - 1);
        let path = new Path2D(`M -${halfWidth} ${this.m_size[1]} L ${halfWidth} ${this.m_size[1] + 0.5} l 0.2 0 l 0 -0.25`);

        canvasContext.beginPath();
        canvasContext.lineWidth = 0.15;
        canvasContext.strokeStyle = "darkslategrey";
        canvasContext.stroke(path);

        const ballRadius = 0.1;
        let x_0 = halfWidth;
        let m = 0.5 / (2 * halfWidth);
        let b = this.m_size[1] - m * -halfWidth;

        for (let i = 0; i < Math.min(this.m_outputBalls.length, 30); i++) {
            let x = x_0 - i * ballRadius * 2;
            let y = m * x + b - 2 * ballRadius;

            canvasContext.beginPath();
            canvasContext.arc(x, y, ballRadius, 0, 2 * Math.PI);
            canvasContext.fillStyle = this.m_outputBalls[i] === BallColor.Blue ? "blue" : "red";
            canvasContext.fill();
        }
    }

    private renderBall(canvasContext: CanvasRenderingContext2D, peg: Peg) {
        if (peg.piece != null) {
            let ballPos: [number, number];
            if (this.m_currBallDirection != Direction.None) {
                const rawPos = peg.piece.animate(this.m_animationTime / (this.m_animationDuration * 1000), this.m_currBallDirection);
                ballPos = [rawPos[0] + peg.position[0], rawPos[1] + peg.position[1]];
            } else {
                ballPos = [peg.position[0], peg.position[1]];
            }

            canvasContext.beginPath();
            canvasContext.arc(ballPos[Coordinate.X], ballPos[Coordinate.Y], 0.1, 0, 2 * Math.PI);
            canvasContext.fillStyle = this.m_currBallColor === BallColor.Blue ? "blue" : "red";
            canvasContext.fill();
        }
    }

    private onAnimationComplete() {
        const peg: Peg = this.m_pegs[this.m_currBallPos[0]][this.m_currBallPos[1]];

        if (peg && peg.piece != null) {
            const outDir = peg.piece.operate(this.m_currBallDirection);

            if (outDir != Direction.None) {
                this.m_currBallPos = this.dropBall(this.m_currBallPos, outDir);
                this.m_currBallDirection = -outDir;

                const halfWidth = 0.5 * (this.m_size[0] - 1);
                if ((this.m_currBallPos[0] - halfWidth != 0 && this.m_currBallPos[1] >= this.m_size[1] - 1) || (this.m_currBallPos[0] - halfWidth === 0 && this.m_currBallPos[1] >= this.m_size[1])) {
                    this.m_outputBalls.push(this.m_currBallColor);

                    if (this.m_currBallPos[0] < halfWidth) {
                        if (this.m_numBalls[BallColor.Blue] > 0) {
                            this.m_currBallColor = BallColor.Blue;
                            this.m_currBallPos = [halfWidth - this.m_entryPoint, 0];
                            this.m_currBallDirection = Direction.Left;
                            this.m_numBalls[BallColor.Blue] = this.m_numBalls[BallColor.Blue] - 1;
                        } else {
                            this.m_currBallDirection = Direction.None;
                        }
                    } else {
                        if (this.m_numBalls[BallColor.Red] > 0) {
                            this.m_currBallColor = BallColor.Red;
                            this.m_currBallPos = [halfWidth + this.m_entryPoint, 0];
                            this.m_currBallDirection = Direction.Right;
                            this.m_numBalls[BallColor.Red] = this.m_numBalls[BallColor.Red] - 1;
                        } else {
                            this.m_currBallDirection = Direction.None;
                        }
                    }
                }
            } else {
                this.m_currBallDirection = Direction.None;
            }
        }
    }

    private dropBall(position: Point, direction: Direction): Point {
        return [position[Coordinate.X] + direction, position[Coordinate.Y] + 1];
    }

    private isPieceSlot(position: Point) {
        const parity = this.m_size[Coordinate.Y] % 2;

        // If the position's y coordinate has the opposite parity as the board's height, then the piece slots will be on pegs with even x coordinates; otherwise they will be on odd x coordinates.
        if (position[Coordinate.Y] % 2 != parity) {
            return Math.abs(position[Coordinate.X] % 2) === 0;
        } else {
            return Math.abs(position[Coordinate.X] % 2) === 1;
        }
    }

    private isValidPosition(position: Point): boolean {
        // Board width is always odd, so the half width will be one minus the width, making it equal to the number of pegs on the left or right.
        const halfWidth = 0.5 * (this.m_size[Coordinate.X] - 1);

        // First, check that the position is within the board's bounds.
        if (position[Coordinate.X] < -halfWidth || position[Coordinate.X] > halfWidth || position[Coordinate.Y] < 0 || position[Coordinate.Y] > this.m_size[Coordinate.Y]) {
            return false;
        }

        // In the bottom row, only the middle peg is valid.
        if (position[Coordinate.Y] == this.m_size[Coordinate.Y] - 1 && position[Coordinate.X] != 0) {
            return false;
        }

        const y1 = -Math.abs(position[Coordinate.X]) + this.m_entryPoint - 2;
        const y2 = Math.abs(position[Coordinate.X]) - this.m_entryPoint - 2;
        
        if (position[Coordinate.Y] <= y1 || position[Coordinate.Y] <= y2) {
            return false;
        }
        
        return true;
    }
}