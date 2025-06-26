import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HuntComponentComponent } from './hunt-component/hunt-component.component';
import { CreateHuntComponent } from './create-hunt/create-hunt.component';

const routes: Routes = [
  {
    path: '',
    component: HuntComponentComponent
  },
  {
    path: 'create',
    component: CreateHuntComponent
  },
  {
    path: 'edit/:id',
    component: CreateHuntComponent
  },
  {
    path: 'view/:id',
    component: CreateHuntComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HuntRoutingModule { }

