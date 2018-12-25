import { Piece } from '../piece';
import { Direction } from '../ball';

/** The cross piece outputs the ball in the direction across from the direction it came in from. */
export class Cross extends Piece {
    get color() {
        return "orange";
    }

    get lineWidth(): number {
        return 0.1;
    }

    operate(input: Direction): Direction {
        return -input;
    }

    protected svgPath(): string {
        return `
            M 0.50 0.10
            L 0.50 0.45
            L 0.65 0.55
            M 0.50 0.45
            L 0.35 0.55
            M 0.10 0.20
            L 0.00 0.55
            L 0.15 0.70
            M 0.90 0.20
            L 1.00 0.55
            L 0.85 0.70
            M 0.20 1.00
            L 0.80 1.00`;
    }

    protected ballPath(input: Direction): string {
        if (input === Direction.Left) {
            return `M -0.5 -0.5 L -0.15 -0.3 L -0.3 0 L 0 0.4 L 0.4 0.4 L 0.5 0.5`;
        } else {
            return `M 0.5 -0.5 L 0.15 -0.3 L 0.3 0 L 0 0.4 L -0.4 0.4 L -0.5 0.5`;
        }
    }
    
    protected isSymmetric(): boolean {
        return true;
    }
}