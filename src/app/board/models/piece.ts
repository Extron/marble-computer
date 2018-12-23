export enum Direction {
    Left = -1,
    Right = 1,
    None = 0
}

export abstract class Piece {
    /** The orientation of the piece. */
    protected m_orientation: Direction;

    /** Gets the piece's orientation. */
    get orientation() {
        return this.m_orientation;
    }

    abstract get color(): string;

    abstract get lineWidth(): number;

    constructor() {
        if (this.isSymmetric()) {
            this.m_orientation = Direction.None;
        } else {
            this.m_orientation = Direction.Left;
        }
    }


    /**
     * Takes an input ball and operates on it, dispensing it to an output direction, as well as possibly changing state.
     * @param input - The direction the ball has been input from.
     * @returns The direction the ball is output to.
     */
    abstract operate(input: Direction): Direction;

    /**
     * Renders the piece to an HTML canvas.
     * @param canvasContext - The canvas context to render to.
     * @param position - The position of the piece on the board.
     */
    render(canvasContext: CanvasRenderingContext2D, position: [number, number]): void {
        canvasContext.translate(position[0] - 0.5, position[1] - 0.5);
        canvasContext.beginPath();
        canvasContext.strokeStyle = this.color;
        canvasContext.lineWidth = this.lineWidth;
        canvasContext.lineCap = "round";
        let path = this.svgPath();
        canvasContext.stroke(new Path2D(path));
        canvasContext.translate(-position[0] + 0.5, -position[1] + 0.5);
    }

    /**
     * Animates the piece and returns an interpolated position for the ball as it moves through the piece.
     * @param time - A value between 0 and 1 indicating the amount of progress through the animation.
     * @param input - The direction the ball was input into the piece.
     * @returns - The ball's position within the piece at the specified time, in the piece's coordinates from [-0.5, -0.5] to [0.5, 0.5].
     */
    animate(time: number, input: Direction): [number, number] {
        let path = window.document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', this.ballPath(input));
        const length = path.getTotalLength();

        const point = path.getPointAtLength(time * length);
        return [point.x, point.y];
    }

    /**
     * Gets whether this piece is symmetric.
     */
    protected abstract isSymmetric(): boolean;

    /**
     * Gets the piece's SVG path for rendering.
     * @param position - The position of the piece on the board.
     * @returns The SVG path to render the piece with.
     */
    protected abstract svgPath(): string;
    
    /**
     * Gets the ball's animation path through the piece.
     * @param input - The direction the ball was input from.
     * @returns - The ball's animation path.
     */
    protected abstract ballPath(input: Direction): string;

    /**
     * Flips the orientation of this piece.
     */
    flipOrientation() {
        this.m_orientation = -this.m_orientation;
    }
}