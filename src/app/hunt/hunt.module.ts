import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HuntRoutingModule } from './hunt-routing.module';
import { HuntComponentComponent } from './hunt-component/hunt-component.component';
import { CreateHuntComponent } from './create-hunt/create-hunt.component';
import { ReactiveFormsModule } from "@angular/forms";
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [HuntComponentComponent, CreateHuntComponent],
  imports: [
    CommonModule,
    HuntRoutingModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatButtonModule
  ]
})
export class HuntModule { }

