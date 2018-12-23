import { Piece, Direction } from '../piece';

/** The terminal piece outputs nothing, instead holding the ball and terminating the program. */
export class Terminal extends Piece {
    get color() {
        return "black";
    }

    get lineWidth(): number {
        return 0.15;
    }

    operate(input: Direction): Direction {
        return Direction.None;
    }

    protected svgPath() {
        return `
            M 0.15 0.35
            A 0.25 0.35 0 0 0 0 0.65
            H 1
            A 0.25 0.35 0 0 0 0.85 0.35`;
    }

    protected ballPath(input: Direction): string {
        if (input == Direction.Left) {
            return 'M -0.5 -0.5 Q -0.25 -0.45 0 0 L 0.40 0 L 0 0';
        } else {
            return 'M 0.5 -0.5 Q 0.25 -0.45 0 0 L -0.40 0 L 0 0';
        }
    }

    protected isSymmetric(): boolean {
        return true;
    }
}