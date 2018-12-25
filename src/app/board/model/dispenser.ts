import { Ball, BallColor, Direction } from './ball';

export class Dispenser {
    /** Gets the height of the dispenser in board units. */
    static get height() {
        return 0.65;
    }

    
    private m_balls: { blue: number, red: number } = { blue: 2, red: 2 };
    private m_entryPoint: number = 2;
 
    private readonly m_maxBalls = 12; 

    /** Gets the number of blue balls in the dispenser. */
    get numBlueBalls() {
        return this.m_balls.blue;
    }

    /** Gets the number of red balls in the dispenser. */
    get numRedBalls() {
        return this.m_balls.red;
    }

    /** Gets the peg that the balls will enter at when dispensed. */
    get entryPoint() {
        return this.m_entryPoint
    }

    /** Sets the peg that the balls will enter at when dispensed. */
    set entryPoint(value: number) {
        this.m_entryPoint = value;
    }

    dispenseBall(ballColor: BallColor): Ball {
        if (ballColor === BallColor.Blue) {
            if (this.m_balls.blue > 0) {
                this.m_balls.blue--;
                return new Ball({ x: -this.m_entryPoint, y: 0}, Direction.Left, BallColor.Blue);
            } else {
                return null;
            }
        } else {
            if (this.m_balls.red > 0) {
                this.m_balls.red--;
                return new Ball({ x: this.m_entryPoint, y: 0}, Direction.Right, BallColor.Red);
            } else {
                return null;
            }
        }
    }

    fillBalls(numBlueBalls: number, numRedBalls: number) {
        this.m_balls.blue = numBlueBalls;
        this.m_balls.red = numRedBalls;
    }

    render(canvasContext: CanvasRenderingContext2D, boardSize: { w: number, h: number }) {
        const halfWidth = 0.5 * (boardSize.w - 1);
        let path = new Path2D(`M -${halfWidth} 0.15 L -${this.m_entryPoint + 0.65} 0.65 M ${halfWidth} 0.15 L ${this.m_entryPoint + 0.65} 0.65`);

        canvasContext.beginPath();
        canvasContext.lineWidth = 0.15;
        canvasContext.lineCap = "round";
        canvasContext.strokeStyle = "darkslategrey";
        canvasContext.stroke(path);

        let x_0 = this.m_entryPoint + 0.65;
        let m = 0.5 / (x_0 - halfWidth);

        for (let i = 0; i < Math.min(this.m_balls.blue, this.m_maxBalls); i++) {
            let x = -x_0 - i * Ball.ballSize * 2;
            let y = -m * (x + halfWidth) - 2 * Ball.ballSize + 0.15;

            canvasContext.beginPath();
            canvasContext.arc(x, y, Ball.ballSize, 0, 2 * Math.PI);
            canvasContext.fillStyle = "blue";
            canvasContext.fill();
        }

        for (let i = 0; i < Math.min(this.m_balls.red, this.m_maxBalls); i++) {
            let x = x_0 + i * Ball.ballSize * 2;
            let y = m * (x - halfWidth) - 2 * Ball.ballSize + 0.15;

            canvasContext.beginPath();
            canvasContext.arc(x, y, Ball.ballSize, 0, 2 * Math.PI);
            canvasContext.fillStyle = "red";
            canvasContext.fill();
        }
    }
}