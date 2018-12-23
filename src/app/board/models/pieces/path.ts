import { Piece, Direction } from '../piece';

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
    
    protected svgPath() {
        if (this.m_orientation === Direction.Right) {
            return `M 1 0.25 L 0.25 1`;
        } else {
            return `M 0 0.25 L 0.75 1`;
        }
    }

    protected ballPath(input: Direction): string {
        if (input === this.m_orientation) {
            // If the input direction is the same as the orientation, animate the ball moving in a line down the piece.
            let start: [number, number];
            let end: [number, number];

            if (input === Direction.Left) {
                start = [-0.5, -0.5];
                end = [0.5, 0.5];
            } else {
                start = [0.5, -0.5];
                end = [-0.5, 0.5];
            }

            return `M ${start[0]} ${start[1]} L ${end[0]} ${end[1]}`;
        } else {
            // TODO: Animate the ball first falling from the input corner onto the piece, then rolling down.
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