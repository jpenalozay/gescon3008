import { NgModule } from '@angular/core';

import { InstructorRoutingModule } from './instructor-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { ComponentesModule } from 'app/comps/componentes.module';
import { InstructorPracticasRegistroComponent } from './practicas/instructor-practicas-registro.component';

@NgModule({
  declarations: [InstructorPracticasRegistroComponent],
  imports: [SharedModule, ComponentesModule, InstructorRoutingModule],
})
export class InstructorModule {}
