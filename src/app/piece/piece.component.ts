import {
    Component,
    ViewChild,
    ElementRef,
    OnInit,
    Input
} from '@angular/core';
import { Piece } from '../board/model/piece';

@Component({
    selector: 'app-piece',
    templateUrl: './piece.component.html',
    styleUrls: ['./piece.component.scss']
})
export class PieceComponent implements OnInit {
    private _piece: Piece;

    get piece() {
        return this._piece;
    }

    @Input()
    set piece(value: Piece) {
        this._piece = value;
        this.renderPiece();
    }
    
    @ViewChild('canvas')
    canvasRef: ElementRef;


    constructor() { }

    ngOnInit() {
        if (this._piece) {
            this.renderPiece();  
        }      
    }

    private renderPiece() {
        let context = this.canvasRef.nativeElement.getContext('2d');

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

        let padding = 12;
        context.setTransform(100 - 2 * padding, 0, 0, 100 - 2 * padding, 50, 50);
        this._piece.render(context, true);
    }
}
