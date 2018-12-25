export enum BallColor {
    Blue = "Blue",
    Red = "Red"
}

export enum Direction {
    Left = -1,
    Right = 1,
    None = 0
}

export class Ball {
    static get ballSize() {
        return 0.1;
    }

    private m_position: { x: number, y: number };
    get position() { return this.m_position; }

    private m_direction: Direction;
    get direction() { return this.m_direction; }

    private m_color: BallColor;
    get color() { return this.m_color; }

    constructor(position: { x: number, y: number }, direction: Direction, color: BallColor) {
        this.m_position = position;
        this.m_direction = direction;
        this.m_color = color;
    }

    render(canvasContext: CanvasRenderingContext2D, canvasPos: { x: number, y: number }): void {
        canvasContext.beginPath();
            canvasContext.arc(canvasPos.x, canvasPos.y, Ball.ballSize, 0, 2 * Math.PI);
            canvasContext.fillStyle = this.m_color;
            canvasContext.fill();
    }

    drop(direction: Direction): void {
        this.m_position.x += direction;
        this.m_position.y++;
        this.m_direction = -direction;
    }

    isAtBottom(boardSize: { w: number, h: number }): boolean {
        return (this.m_position.x != 0 && this.m_position.y >= boardSize.h - 1) || (this.m_position.x === 0 && this.m_position.y >= boardSize.h);
    }
}