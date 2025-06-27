import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RiddleComponentComponent } from './riddle-component/riddle-component.component';
import { CreateRiddleComponent } from './create-riddle/create-riddle.component';
import { RiddleScannerComponent } from './riddle-scanner/riddle-scanner.component';

const routes: Routes = [
  {
    path: '',
    component: RiddleComponentComponent
  },
  {
    path: 'create',
    component: CreateRiddleComponent
  },
  {
    path: 'edit/:id',
    component: CreateRiddleComponent
  },
  {
    path: 'view/:id',
    component: CreateRiddleComponent
  },
  {
    path: 'scanner/:huntId',
    component: RiddleScannerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RiddleRoutingModule { } 