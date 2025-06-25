import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HuntRoutingModule } from './hunt-routing.module';
import { HuntComponentComponent } from './hunt-component/hunt-component.component';

@NgModule({
  declarations: [HuntComponentComponent],
  imports: [
    CommonModule,
    HuntRoutingModule
  ]
})
export class HuntModule { }

