import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { InstructorPracticasRegistroComponent } from './practicas/instructor-practicas-registro.component';

const routes: Routes = [
  {
    path: 'practicas-registro',
    component: InstructorPracticasRegistroComponent,
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InstructorRoutingModule {}
