import { NgModule } from '@angular/core';

import { ComponentesRoutingModule } from './componentes-routing.module';
import { DialogoValidarUsuarioComponent } from './dialogos/dialogo-validar-usuario.component';
import { SharedModule } from 'app/shared/shared.module';
import { DialogoInfoComponent } from './dialogos/dialogo-info.component';
import { DialogoConfirmarComponent } from './dialogos/dialogo-confirmar.component';

@NgModule({
  declarations: [DialogoValidarUsuarioComponent, DialogoInfoComponent, DialogoConfirmarComponent],
  imports: [SharedModule, ComponentesRoutingModule],
  exports: [DialogoValidarUsuarioComponent, DialogoInfoComponent],
})
export class ComponentesModule {}
