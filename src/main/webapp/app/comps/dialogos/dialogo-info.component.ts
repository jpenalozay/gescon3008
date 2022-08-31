import { Component } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'jhi-dialogo-info',
  templateUrl: './dialogo-info.component.html',
  styleUrls: ['./dialogo-info.component.scss'],
})
export class DialogoInfoComponent {
  classAlert = 'secondary';
  title = 'Accion';
  message = 'Info accion.';
  innerHtml = '';

  constructor(public modal: NgbActiveModal) {}

  static doShow(modalService: NgbModal, classAlert: string, title: string, message: string): NgbModalRef {
    const modalRef = modalService.open(DialogoInfoComponent, {});
    if (classAlert) {
      modalRef.componentInstance.classAlert = classAlert;
    }
    if (title) {
      modalRef.componentInstance.title = title;
    }
    if (message) {
      modalRef.componentInstance.message = message;
    }

    return modalRef;
  }
}
