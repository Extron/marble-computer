import { Piece, Direction } from '../piece';

/** The bit piece outputs the ball in the direction opposite of its orientation and flips its orientation after the operation. */
export class Bit extends Piece {
    get color() {
        return "blue";
    }

    get lineWidth(): number {
        return 0.15;
    }

    operate(input: Direction): Direction {
        const output = -this.m_orientation;
        this.flipOrientation();
        return output;
    }

    protected svgPath() {
        return '';
    }

    protected ballPath(input: Direction): string {
        return '';
    }

    protected isSymmetric(): boolean {
        return false;
    }
}