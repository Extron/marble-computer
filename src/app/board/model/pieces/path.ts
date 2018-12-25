import { Piece } from '../piece';
import { Direction } from '../ball';

/** The path piece always outputs the ball in the direction of its orientation. */
export class Path extends Piece {
    get color() {
        return "green";
    }

    get lineWidth(): number {
        return 0.15;
    }

    operate(input: Direction): Direction {
        return -this.m_orientation;
    }
    
    protected svgPath(): string  {
        return `M 1 0.25 L 0.25 1`;
    }

    protected ballPath(input: Direction): string {
        if (input === this.m_orientation) {
            // If the input direction is the same as the orientation, animate the ball moving in a line down the piece.
            if (input === Direction.Left) {
                return `M -0.5 -0.5 L 0.5 0.5`;
            } else {
                return `M 0.5 -0.5 L -0.5 0.5`;
            }
        } else {
            if (input === Direction.Left) {
                return `M -0.5 -0.5 Q -0.25 -0.45 0 0 L -0.5 0.5`;
            } else {
                return `M 0.5 -0.5 Q 0.25 -0.45 0 0 L 0.5 0.5`;
            }
        }
    }

    protected isSymmetric(): boolean {
        return false;
    }
}