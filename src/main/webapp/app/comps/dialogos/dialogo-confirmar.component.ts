import { Component } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'jhi-dialogo-confirmar',
  templateUrl: './dialogo-confirmar.component.html',
  styleUrls: ['./dialogo-confirmar.component.scss'],
})
export class DialogoConfirmarComponent {
  title = 'Accion';
  message = 'Pregunta accion.';

  constructor(public modal: NgbActiveModal) {}

  static doShow(modalService: NgbModal, title: string, message: string): NgbModalRef {
    const modalRef = modalService.open(DialogoConfirmarComponent, {});
    if (title) {
      modalRef.componentInstance.title = title;
    }
    if (message) {
      modalRef.componentInstance.message = message;
    }

    return modalRef;
  }
}
