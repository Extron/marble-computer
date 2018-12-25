import { Direction } from './ball';

export abstract class Piece {
    /** The orientation of the piece. */
    protected m_orientation: Direction;
    protected _rotation: number = 0;

    /** Gets the piece's orientation. */
    get orientation() {
        return this.m_orientation;
    }


    /** The position of the piece on the board. */
    protected _position: { x: number, y: number } = { x: 0, y: 0 };

    /** Gets the piece's board position. */
    get position() {
        return this._position;
    }


    /** The color of the piece to use when rendering. */
    abstract get color(): string;

    /** The line width of the piece to use when rendering. */
    abstract get lineWidth(): number;


    constructor() {
        if (this.isSymmetric()) {
            this.m_orientation = Direction.None;
        } else {
            this.m_orientation = Direction.Right;
        }
    }


    /**
     * Takes an input ball and operates on it, dispensing it to an output direction, as well as possibly changing state.
     * @param input - The direction the ball has been input from.
     * @returns The direction the ball is output to.
     */
    abstract operate(input: Direction): Direction;

    /**
     * Attaches this piece to the board at the specified position.
     * @param position - The board position to attach the piece at.
     */
    attachToBoard(position: { x: number, y: number }) {
        this._position = position;
    }

    /**
     * Removes this piece from the board.
     */
    removeFromBoard() {
        this._position = { x: 0, y: 0 };
    }

    /**
     * Renders the piece to an HTML canvas.
     * @param canvasContext - The canvas context to render to.
     * @param position - The position of the piece on the board.
     */
    render(canvasContext: CanvasRenderingContext2D, showShadow: boolean = false): void {
        const transform = canvasContext.getTransform();

        const scale = this.m_orientation < 0 ? -1 : 1;
        canvasContext.translate(this._position.x, this._position.y);
        canvasContext.rotate(this._rotation);
        canvasContext.translate(-this._position.x, -this._position.y);
        canvasContext.translate(this._position.x - scale * 0.5, this._position.y - 0.5);
        canvasContext.scale(scale, 1);

        canvasContext.beginPath();
        canvasContext.strokeStyle = this.color;
        canvasContext.lineWidth = this.lineWidth;
        canvasContext.lineCap = "round";

        if (showShadow) {
            canvasContext.shadowColor = "darkgrey";
            canvasContext.shadowBlur = 4;
            canvasContext.shadowOffsetY = 4;
        }

        let path = this.svgPath();
        canvasContext.stroke(new Path2D(path));
        canvasContext.setTransform(transform);

        if (showShadow) {
            canvasContext.shadowColor = "transparent";
            canvasContext.shadowBlur = 0;
            canvasContext.shadowOffsetY = 0;
        }
    }

    /**
     * Animates the piece and returns an interpolated position for the ball as it moves through the piece.
     * @param time - A value between 0 and 1 indicating the amount of progress through the animation.
     * @param input - The direction the ball was input into the piece.
     * @returns - The ball's position within the piece at the specified time, in the piece's coordinates from [-0.5, -0.5] to [0.5, 0.5].
     */
    animate(time: number, input: Direction): { x: number, y: number } {
        this.onAnimate(time);

        let path = window.document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', this.ballPath(input));
        const length = path.getTotalLength();

        const point = path.getPointAtLength(time * length);
        return point;``
    }

    protected onAnimate(time: number) { }

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