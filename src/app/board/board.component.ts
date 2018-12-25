import {
    Component,
    ElementRef,
    ViewChild,
    NgZone,
    OnInit,
    OnDestroy,
    HostListener,
    Output,
    EventEmitter,
} from '@angular/core';

import { Board, BoardConfiguration } from './model/board';
import { Piece } from './model/piece';
import { MatDialog } from '@angular/material';
import { BoardConfigurationComponent } from '../board-configuration/board-configuration.component';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit, OnDestroy {

    //#region View Elements

    @ViewChild('canvasContainer') containerRef: ElementRef;
    @ViewChild('canvas') canvasRef: ElementRef;
    @ViewChild('pieceWidget') pieceWidget: ElementRef;

    //#endregion


    //#region Events

    @Output()
    piecePickedUp: EventEmitter<{ piece: Piece, position: { x: number, y: number } }> = new EventEmitter<{ piece: Piece, position: { x: number, y: number } }>();

    //#endregion


    //#region Fields

    boardConfiguration: BoardConfiguration = new BoardConfiguration();
    board: Board;
    selectedPiece: Piece = null;
    running: boolean;

    //#endregion


    //#region Constructors

    constructor(private ngZone: NgZone, private dialog: MatDialog) { }

    //#endregion


    //#region Lifecycle Methods

    ngOnInit() {
        this.board = new Board(this.boardConfiguration);

        this.setCanvasSize();

        this.running = true;
        this.ngZone.runOutsideAngular(() => { this.render(); });
    }

    ngOnDestroy() {
        this.running = false;
    }

    //#endregion


    //#region Event Handlers

    @HostListener('window:resize', ['$event'])
    sizeChange(event) {
        this.setCanvasSize();
    }


    start() {
        this.selectPiece(null);
        this.board.start();
    }

    pause() {
        this.board.stop();
    }

    restart() {
        this.board.reset();
    }

    configureBoard() {
        let newConfiguration = new BoardConfiguration();
        newConfiguration.size = { w: this.boardConfiguration.size.w, h: this.boardConfiguration.size.h };
        newConfiguration.numBlueBalls = this.boardConfiguration.numBlueBalls;
        newConfiguration.numRedBalls = this.boardConfiguration.numRedBalls;
        newConfiguration.startingColor = this.boardConfiguration.startingColor;
        newConfiguration.entryPoint = this.boardConfiguration.entryPoint;

        const dialogRef = this.dialog.open(BoardConfigurationComponent, { width: '250px', data: newConfiguration });

        dialogRef.afterClosed().subscribe(result => {
            if (result != null) {
                this.boardConfiguration = result;
                this.board.configure(this.boardConfiguration);
            }
        });
    }

    clearBoard() {
        this.board.clear();
        this.selectPiece(null);
    }

    clickBoard(event: MouseEvent) {
        const mousePos = { x: event.pageX - window.pageXOffset, y: event.pageY - window.pageYOffset };
        const canvasBounds = this.canvasRef.nativeElement.getBoundingClientRect();
        const localPos = this.board.canvasPosToBoardPos({ x: mousePos.x - canvasBounds.left, y: mousePos.y - canvasBounds.top }, { w: this.canvasRef.nativeElement.width, h: this.canvasRef.nativeElement.height });

        this.selectPiece(this.board.getPieceAt(localPos));
    }

    dragBoard(event: DragEvent) {
        const mousePos = { x: event.pageX - window.pageXOffset, y: event.pageY - window.pageYOffset };
        const canvasBounds = this.canvasRef.nativeElement.getBoundingClientRect();
        const localPos = this.board.canvasPosToBoardPos({ x: mousePos.x - canvasBounds.left, y: mousePos.y - canvasBounds.top }, { w: this.canvasRef.nativeElement.width, h: this.canvasRef.nativeElement.height });

        const piece = this.board.getPieceAt(localPos);

        if (piece != null) {
            const canvasPos = this.board.boardPosToCanvasPos({ x: piece.position.x, y: piece.position.y }, { w: this.canvasRef.nativeElement.width, h: this.canvasRef.nativeElement.height });
            this.board.removePiece(piece);
            this.selectPiece(null);
            this.piecePickedUp.emit({ piece: piece, position: { x: canvasPos.x + canvasBounds.left, y: canvasPos.y + canvasBounds.top } });
        }

        event.preventDefault();
    }

    deleteSelectedPiece(event: MouseEvent) {
        if (this.selectedPiece != null) {
            this.board.removePiece(this.selectedPiece);
            this.selectedPiece = null;
        }

        event.stopPropagation();
    }

    flipSelectedPiece(event: MouseEvent) {
        if (this.selectedPiece != null) {
            this.selectedPiece.flipOrientation();
        }

        event.stopPropagation();
    }

    //#endregion


    //#region Public Methods

    dropPiece(piece: Piece, position: { x: number, y: number }) {
        const canvasBounds = this.canvasRef.nativeElement.getBoundingClientRect();
        const localPos = this.board.canvasPosToBoardPos({ x: position.x - canvasBounds.left, y: position.y - canvasBounds.top }, { w: this.canvasRef.nativeElement.width, h: this.canvasRef.nativeElement.height });

        if (this.board.placePiece(piece, localPos)) {
            this.selectPiece(piece);
        } else {
            this.selectPiece(null);
        }
    }

    //#endregion


    //#region Private Methods

    private render() {
        let context = this.canvasRef.nativeElement.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

        this.board.tick();
        this.board.render(context, { w: this.canvasRef.nativeElement.width, h: this.canvasRef.nativeElement.height });

        if (this.running) {
            requestAnimationFrame(() => { this.render(); });
        }
    }

    private setCanvasSize() {
        const style = getComputedStyle(this.containerRef.nativeElement);
        const w = parseInt(style.getPropertyValue("width"), 10);
        const h = parseInt(style.getPropertyValue("height"), 10);

        this.canvasRef.nativeElement.width = w;
        this.canvasRef.nativeElement.height = h;
    }

    private selectPiece(piece: Piece) {
        this.selectedPiece = piece;

        if (this.selectedPiece != null) {
            const canvasPos = this.board.boardPosToCanvasPos({ x: this.selectedPiece.position.x, y: this.selectedPiece.position.y + 0.5 }, { w: this.canvasRef.nativeElement.width, h: this.canvasRef.nativeElement.height });
            this.pieceWidget.nativeElement.style.transform = `translate3d(${canvasPos.x}px, ${canvasPos.y}px, 0px) translateX(-50%)`;
        }
    }

    //#endregion
}