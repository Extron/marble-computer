import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BoardConfiguration } from '../board/model/board';

@Component({
    selector: 'app-board-configuration',
    templateUrl: './board-configuration.component.html',
    styleUrls: ['./board-configuration.component.scss']
})
export class BoardConfigurationComponent {
    constructor(public dialog: MatDialogRef<BoardConfigurationComponent>, @Inject(MAT_DIALOG_DATA) public data: BoardConfiguration) { }

    cancel() {
        this.dialog.close();
    }
}
