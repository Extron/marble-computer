import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppComponent } from './app.component';
import { BoardComponent } from './board/board.component';
import { ToolboxComponent } from './toolbox/toolbox.component';
import { PieceComponent } from './piece/piece.component';
import { WorkbenchComponent } from './workbench/workbench.component';
import { BoardConfigurationComponent } from './board-configuration/board-configuration.component';

@NgModule({
    declarations: [
        AppComponent,
        BoardComponent,
        ToolboxComponent,
        PieceComponent,
        WorkbenchComponent,
        BoardConfigurationComponent
    ],
    entryComponents: [
        BoardConfigurationComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,

        MatButtonModule,
        MatSelectModule,
        MatSliderModule,
        MatIconModule,
        MatToolbarModule,
        MatGridListModule,
        MatCardModule,
        MatInputModule,
        MatFormFieldModule,
        MatDialogModule,

        DragDropModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
