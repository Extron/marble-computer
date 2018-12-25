import { BallColor, Ball } from './ball';

export class Collector {
    /** Gets the height of the dispenser in board units. */
    static get height() {
        return 1;
    }

    
    private m_collectedBalls: Ball[] = [];


    collectBall(ball: Ball) {
        this.m_collectedBalls.push(ball);
    }

    clear() {
        this.m_collectedBalls = [];
    }

    render(canvasContext: CanvasRenderingContext2D, boardSize: { w: number, h: number }): void {
        const halfWidth = 0.5 * (boardSize.w - 1);
        let path = new Path2D(`M -${halfWidth} ${boardSize.h} L ${halfWidth} ${boardSize.h + 0.5} l 0.2 0 l 0 -0.25`);

        canvasContext.beginPath();
        canvasContext.lineWidth = 0.15;
        canvasContext.lineCap = "round";
        canvasContext.strokeStyle = "darkslategrey";
        canvasContext.stroke(path);

        let x_0 = halfWidth;
        let m = 0.5 / (2 * halfWidth);
        let b = boardSize.h - m * -halfWidth;

        for (let i = 0; i < Math.min(this.m_collectedBalls.length, 30); i++) {
            let x = x_0 - i * Ball.ballSize * 2;
            let y = m * x + b - 2 * Ball.ballSize;

            this.m_collectedBalls[i].render(canvasContext, { x: x, y: y });
        }
    }
}