import { Piece } from '../piece';
import { Direction } from '../ball';

/** The bit piece outputs the ball in the direction opposite of its orientation and flips its orientation after the operation. */
export class Bit extends Piece {
    get color() {
        return "blue";
    }

    get lineWidth(): number {
        return 0.15;
    }

    operate(input: Direction): Direction {
        this._rotation = 0;
        const output = -this.m_orientation;
        this.flipOrientation();
        return output;
    }

    protected onAnimate(time: number) {
        this._rotation = -this.m_orientation * (0.5 + 0.5 * Math.tanh(10 * (time - 0.5))) * 0.5 * Math.PI;
    }

    protected svgPath(): string {
        return 'M 0.8 0.2 L 0.375 0.62 L 0.75 1 M 0.375 0.625 L 0 0.25 M 0.8 0.2 v 0.3 M 0.8 0.2 h -0.3';
    }

    protected ballPath(input: Direction): string {
        if (input === this.m_orientation) {
            // If the input direction is the same as the orientation, animate the ball moving in a line down the piece.
            if (input === Direction.Left) {
                return `M -0.5 -0.5 Q -0.35 -0.5 -0.20 -0.4 L 0 -0.4 Q 0.25 -0.35 0.25 0 L 0.5 0.5`;
            } else {
                return `M 0.5 -0.5 Q 0.35 -0.5 0.20 -0.4 L 0 -0.4 Q -0.25 -0.35 -0.25 0 L -0.5 0.5`;
            }
        } else {
            if (input === Direction.Left) {
                return `M -0.5 -0.5 Q -0.25 -0.45 -0.1 0 L -0.5 0.5`;
            } else {
                return `M 0.5 -0.5 Q 0.25 -0.45 0.1 0 L 0.5 0.5`;
            }
        }
    }

    protected isSymmetric(): boolean {
        return false;
    }
}