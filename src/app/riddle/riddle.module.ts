import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiddleRoutingModule } from './riddle-routing.module';
import { RiddleComponentComponent } from './riddle-component/riddle-component.component';
import { CreateRiddleComponent } from './create-riddle/create-riddle.component';
import { RiddleScannerComponent } from './riddle-scanner/riddle-scanner.component';
import { ReactiveFormsModule } from "@angular/forms";
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [RiddleComponentComponent, CreateRiddleComponent, RiddleScannerComponent],
  imports: [
    CommonModule,
    RiddleRoutingModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatButtonModule
  ]
})
export class RiddleModule { } 