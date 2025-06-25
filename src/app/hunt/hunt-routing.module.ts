import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HuntComponentComponent } from './hunt-component/hunt-component.component';

const routes: Routes = [
  {
    path: '',
    component: HuntComponentComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HuntRoutingModule { }

