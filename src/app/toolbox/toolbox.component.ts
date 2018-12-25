import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Piece } from '../board/model/piece';
import { Path } from '../board/model/pieces/path';
import { Cross } from '../board/model/pieces/cross';
import { Terminal } from '../board/model/pieces/terminal';
import { Bit } from '../board/model/pieces/bit';

@Component({
    selector: 'app-toolbox',
    templateUrl: './toolbox.component.html',
    styleUrls: ['./toolbox.component.scss']
})
export class ToolboxComponent implements OnInit {

    @Output()
    piecePickedUp: EventEmitter<{ piece: Piece, position: { x: number, y: number } }> = new EventEmitter<{ piece: Piece, position: { x: number, y: number } }>();

    pieces: { piece: Piece, type: string }[] = [
        { piece: new Path(), type: "path" },
        { piece: new Cross(), type: "cross" },
        { piece: new Terminal(), type: "terminal" },
        { piece: new Bit(), type: "bit" }
    ];

    constructor() { }

    ngOnInit() {
    }

    dragPiece(event: DragEvent, pieceType: string) {
        const elemBounds = (event.target as HTMLElement).getBoundingClientRect();
        this.piecePickedUp.emit({ piece: this.createPieceFromType(pieceType), position: { x: elemBounds.left + 0.5 * elemBounds.width, y: elemBounds.top + 0.5 * elemBounds.height } });

        // Prevent the actual dragging logic from running, we just want to intercept this event and handle the dragging our own way.
        event.preventDefault();
    }

    private createPieceFromType(type: string): Piece {
        switch (type) {
        case "path":
            return new Path();

        case "cross":
            return new Cross();

        case "terminal":
            return new Terminal();

        case "bit":
            return new Bit();
        }
    }
}
