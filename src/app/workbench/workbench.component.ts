import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { PieceComponent } from '../piece/piece.component';
import { Piece } from '../board/model/piece';
import { BoardComponent } from '../board/board.component';
import { ToolboxComponent } from '../toolbox/toolbox.component';

@Component({
    selector: 'app-workbench',
    templateUrl: './workbench.component.html',
    styleUrls: ['./workbench.component.scss']
})
export class WorkbenchComponent implements OnInit {
    @ViewChild('panel')
    panel: ElementRef;

    @ViewChild('boardContainer')
    boardContainer: ElementRef;

    @ViewChild('board')
    board: BoardComponent;

    @ViewChild('toolbox')
    toolbox: ToolboxComponent;

    @ViewChild('heldPieceContainer')
    heldPieceContainer: ElementRef;
    
    @ViewChild('heldPiece')
    heldPiece: PieceComponent;

    heldPieceTranslation: { x: number, y: number };
    isHoldingPiece: boolean = false;
    lastMousePos: { x: number, y: number };

    constructor() { }

    ngOnInit() {
    }

    piecePickedUpFromToolbar(event: { piece: Piece, position: { x: number, y: number } }) {
        const panelBounds = this.panel.nativeElement.getBoundingClientRect();

        this.isHoldingPiece = true;
        this.heldPieceTranslation = { x: event.position.x - panelBounds.left, y: event.position.y - panelBounds.top };
        this.heldPiece.piece = event.piece;
        this.heldPieceContainer.nativeElement.style.transform = `translate3d(${this.heldPieceTranslation.x}px, ${this.heldPieceTranslation.y}px, 0px) translateX(-50%) translateY(-50%)`;
    }

    piecePickedUpFromBoard(event: { piece: Piece, position: { x: number, y: number } }) {
        const panelBounds = this.panel.nativeElement.getBoundingClientRect();

        this.isHoldingPiece = true;
        this.heldPieceTranslation = { x: event.position.x - panelBounds.left, y: event.position.y - panelBounds.top };
        this.heldPiece.piece = event.piece;
        this.heldPieceContainer.nativeElement.style.transform = `translate3d(${this.heldPieceTranslation.x}px, ${this.heldPieceTranslation.y}px, 0px) translateX(-50%) translateY(-50%)`;
    }

    @HostListener('mouseup', ['$event'])
    mouseUp(event: MouseEvent) {
        const mousePos = this.offsetMousePos({ x: event.pageX, y: event.pageY });

        if (this.isHoldingPiece) {
            const boardBounds = this.boardContainer.nativeElement.getBoundingClientRect();
            const isOverBoard = mousePos.x >= boardBounds.left && mousePos.x <= boardBounds.right && mousePos.y >= boardBounds.top && mousePos.y <= boardBounds.bottom;

            if (isOverBoard) {
                this.board.dropPiece(this.heldPiece.piece, mousePos);
            }

            this.isHoldingPiece = false;
        }
    }

    @HostListener('mousemove', ['$event']) 
    mouseMove(event: MouseEvent) {
        const mousePos = this.offsetMousePos({ x: event.pageX, y: event.pageY });

        if (this.isHoldingPiece) {
            const mouseDelta = { x: mousePos.x - this.lastMousePos.x, y: mousePos.y - this.lastMousePos.y };
            
            this.heldPieceTranslation.x += mouseDelta.x;
            this.heldPieceTranslation.y += mouseDelta.y;

            this.heldPieceContainer.nativeElement.style.transform = `translate3d(${this.heldPieceTranslation.x}px, ${this.heldPieceTranslation.y}px, 0px) translateX(-50%) translateY(-50%)`;
        }

        this.lastMousePos = mousePos;
    }

    private offsetMousePos(mousePos: { x: number, y: number}): { x: number, y: number} {
        return { x: mousePos.x - window.pageXOffset, y: mousePos.y - window.pageYOffset };
    }
}
