import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { AlumnoInscripcionComponent } from './inscripcion/alumno-inscripcion.component';
import { ProgramacionPracticaComponent } from './practica/programacion-practica.component';
import { PagoComponent } from './pago/pago.component';
import { InfoComponent } from './info/info.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'inscripcion',
  },
  {
    path: 'inscripcion',
    component: AlumnoInscripcionComponent,
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'reg-practicas',
    component: ProgramacionPracticaComponent,
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'pago',
    component: PagoComponent,
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'info',
    component: InfoComponent,
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AlumnoRoutingModule {}
