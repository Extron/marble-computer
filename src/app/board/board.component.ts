import {
    Component,
    ElementRef,
    ViewChild,
    NgZone,
    OnInit,
    OnDestroy,
    HostListener,
} from '@angular/core';

import { Board } from './models/board';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: [ './board.component.css' ]
})
export class BoardComponent implements OnInit, OnDestroy {

    @ViewChild('canvasContainer') containerRef: ElementRef;
    @ViewChild('canvas') canvasRef: ElementRef;

    private board: Board;
    private running: boolean;

    constructor(private ngZone: NgZone) {

    }

    ngOnInit() {
        this.board = new Board([11, 11]);

        this.running = true;
        this.ngZone.runOutsideAngular(() => { this.render(); });
    }

    ngOnDestroy() {
        this.running = false;
    }

    @HostListener('window:resize', ['$event'])
    sizeChange(event) {
        const style = getComputedStyle(this.containerRef.nativeElement);
        const w = parseInt(style.getPropertyValue("width"), 10);
        const h = parseInt(style.getPropertyValue("height"), 10);

        this.canvasRef.nativeElement.width = w;
        this.canvasRef.nativeElement.height = h;
    }

    private render() {
        let context = this.canvasRef.nativeElement.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

        this.board.tick();
        this.board.render(context, [this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height]);

        if (this.running) {
            requestAnimationFrame(() => { this.render(); });
        }
    }
}