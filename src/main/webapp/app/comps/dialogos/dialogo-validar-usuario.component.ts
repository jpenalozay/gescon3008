import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonValidateService } from 'app/core/service/common-validate.service';
import { Login } from 'app/login/login.model';

@Component({
  selector: 'jhi-dialogo-validar-usuario',
  templateUrl: './dialogo-validar-usuario.component.html',
  styleUrls: ['./dialogo-validar-usuario.component.scss'],
})
export class DialogoValidarUsuarioComponent implements OnInit {
  formLogin?: FormGroup;

  fieldUser = '';
  fieldPass = '';

  isValid = true;

  constructor(private serviceCommonValidate: CommonValidateService, public modal: NgbActiveModal, private formBuilder: FormBuilder) {}

  static doShow(modalService: NgbModal): NgbModalRef {
    const modalRef = modalService.open(DialogoValidarUsuarioComponent, {
      size: 'sm',
    });
    return modalRef;
  }

  ngOnInit(): void {
    this.formLogin = this.formBuilder.group({
      username: [''],
      password: [''],
    });
  }

  doValidar(): void {
    this.isValid = false;

    const credential: Login = new Login(this.fieldUser, this.fieldPass, false);
    this.serviceCommonValidate.check(credential).subscribe({
      next: (jwt: number) => {
        if (jwt < 1) {
          return;
        }
        this.serviceCommonValidate.doAutorities(this.fieldUser).subscribe({
          next: (resp: HttpResponse<string[]>) => {
            const roles: string[] = resp.body ?? [];

            this.isValid = roles.some((rol: string) => {
              if (rol === 'ROL_ADMINISTRADOR' || rol === 'ROLE_ADMIN') {
                this.modal.close(jwt);
                return true;
              }
              return false;
            });
          },
        });
      },
    });

    return;
  }
}
