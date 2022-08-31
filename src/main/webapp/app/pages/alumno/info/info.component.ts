import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonValidateService, INumberStringPair } from 'app/core/service/common-validate.service';
import { Alumno, IAlumno } from 'app/entities/alumno/alumno.model';
import { AlumnoService } from 'app/entities/alumno/service/alumno.service';
import { IAsignatura } from 'app/entities/asignatura/asignatura.model';
import { AsignaturaService } from 'app/entities/asignatura/service/asignatura.service';
import { InscripcionEstado } from 'app/entities/enumerations/inscripcion-estado.model';
import { IInscripcionDescuento, InscripcionDescuento } from 'app/entities/inscripcion-descuento/inscripcion-descuento.model';
import { IInscripcionDetalle } from 'app/entities/inscripcion-detalle/inscripcion-detalle.model';
import { InscripcionDetalleService } from 'app/entities/inscripcion-detalle/service/inscripcion-detalle.service';
import { IInscripcion } from 'app/entities/inscripcion/inscripcion.model';
import { InscripcionService } from 'app/entities/inscripcion/service/inscripcion.service';
import { IPersona, Persona } from 'app/entities/persona/persona.model';

@Component({
  selector: 'jhi-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent implements OnInit {
  inscripcion?: IInscripcion[];
  inscripcionDetalle?: IInscripcionDetalle[];
  filterAlumno = '';
  selAlumno: IAlumno | undefined = new Alumno();
  cacheAlumnos: INumberStringPair[] = [];
  formEntity?: FormGroup;
  selPersona: IPersona = new Persona();
  documentAsig?: IInscripcionDetalle;
  documentDescuento: IInscripcionDescuento = new InscripcionDescuento();

  constructor(
    private inscripcionService: InscripcionService,
    private formBuilder: FormBuilder,
    private alumnoService: AlumnoService,    
    private serviceCommon: CommonValidateService,
    private serviceInsDetail: InscripcionDetalleService,
    private serviceAsignatura: AsignaturaService,
    
  ) {}

  ngOnInit(): void {
    this.formEntity = this.formBuilder.group({
      filterAlumno: [''],
      personaCodigo: [''],
      personaTelefono: [''],
      personaEmail: ['', Validators.email],
      alumnoCodigo: [''],
      alumnoEstado: [''],
      fechaInicio: [''],
      horario: [''],
      insDescuentoDesc: [''],
      insDescuentoMont: [''],
      selSucursalId: [''],
      selSucursalSerieId: [''],
      incipcionCodigo: [''],
      incripcionPagoMonto: [''],
      adicionales: this.formBuilder.array([]),
    });
    this.loadAll();
    //this.doInit();
  }

  doInit(): void {
    this.filterAlumno = '';
    this.doClean();
  }

  doClean(): void {
    this.cacheAlumnos = [];
    this.selAlumno = undefined;
  }

  loadAll(): any {
    //this.alumno

    this.inscripcionService.query().subscribe((res: HttpResponse<IInscripcion[]>) => {
      this.inscripcion = res.body ?? [];
    });
  }

  doAlumnoSel(): void {
    this.selAlumno = undefined;
    if (!this.filterAlumno) {
      return;
    }

    const regex = this.filterAlumno.match(/\[(.*?)\]/);
    if (!regex || regex.length < 2) {
      return;
    }
    this.doAlumnoLoad(regex[1]);
  }

  doFilterPressKey(): void {
    this.cacheAlumnos = [];

    if (this.filterAlumno.length < 3) {
      return;
    }

    this.filterAlumno = this.filterAlumno.toUpperCase();

    this.serviceCommon.doFindAlumnos(this.filterAlumno).subscribe({
      next: (resp: HttpResponse<INumberStringPair[]>) => {
        this.cacheAlumnos = resp.body ?? [];
        this.cacheAlumnos.forEach((value: INumberStringPair) => {
          value.value = `${this.filterAlumno} - ${value.value!}`;
        });
      },
    });
  }

  doAlumnoLoad(alumnoCodigo: string): void {
    this.serviceCommon.getAlumnoFullLoad(alumnoCodigo).subscribe((resp: HttpResponse<IAlumno>) => {
      const alumno: IAlumno = resp.body!;

      this.selAlumno = alumno;

      alumno.inscripcions!.forEach((inscrip: IInscripcion) => {
        inscrip.inscripcionDetalles = [];

        this.serviceInsDetail
          .query({ 'inscripcionId.equals': inscrip.id })
          .subscribe((respInscrip: HttpResponse<IInscripcionDetalle[]>) => {
            inscrip.inscripcionDetalles = respInscrip.body ?? [];
            inscrip.inscripcionDetalles.forEach((inscripDet: IInscripcionDetalle) => {
              this.serviceAsignatura.find(inscripDet.asignatura!.id!).subscribe((respAsig: HttpResponse<IAsignatura>) => {
                inscripDet.asignatura = respAsig.body!;
              });
            });
          });
      });
    });
  }

  getAlumnoCodigo(): string {
    if (this.selAlumno) {
      return this.selAlumno.codigo!;
    } else {
      return '';
    }
  }

  getAlumnoEstado(): string {
    if (this.selAlumno) {
      return this.selAlumno.estado!;
    } else {
      return '';
    }
  }

  getAlumnoDni(): string {
    if (this.selAlumno?.persona) {
      return this.selAlumno.persona.numeroDocumento!;
    } else {
      return '';
    }
  }

  getAlumnoNombres(): string {
    if (this.selAlumno?.persona) {
      return this.selAlumno.persona.nombres!;
    } else {
      return '';
    }
  }

  getAlumnoApPaterno(): string {
    if (this.selAlumno?.persona) {
      return this.selAlumno.persona.apellidoPaterno!;
    } else {
      return '';
    }
  }

  getAlumnoApMaterno(): string {
    if (this.selAlumno?.persona) {
      return this.selAlumno.persona.apellidoMaterno!;
    } else {
      return '';
    }
  }

  getAlumnoCurso(): string {
    let response = '';
    if (this.selAlumno?.inscripcions) {
      this.selAlumno.inscripcions.forEach((inscrip: IInscripcion) => {
        inscrip.inscripcionDetalles?.forEach((inscripDet: IInscripcionDetalle) => {
          if (inscripDet.asignatura?.curso) {
            response = inscripDet.asignatura.curso.nombre!;
          }
        });
      });
    }
    return response;
  }

  getAlumnoAsignatura(): string {
    let response = '';
    if (this.selAlumno?.inscripcions) {
      this.selAlumno.inscripcions.forEach((inscrip: IInscripcion) => {
        inscrip.inscripcionDetalles?.forEach((inscripDet: IInscripcionDetalle) => {
          if (inscripDet.asignatura) {
            response = inscripDet.asignatura.nombre!;
          }
        });
      });
    }
    return response;
  }

  doPersonaFind(): void {
    const personaCodigo = this.formEntity?.controls.personaCodigo.value;
    /* const query = {
      'numeroDocumento.equals': personaCodigo,
      eagerload: false,
    };*/

    this.selPersona = new Persona();
    this.selAlumno = new Alumno(0);

    if (!personaCodigo) {
      return;
    }
    this.serviceCommon.doFindPersona(personaCodigo).subscribe({
      next: (resp: HttpResponse<IPersona>) => {
        this.doPersonaSel(resp.body!);
      },
    });
  }

  doPersonaSel(persona: IPersona): void {
    const query = {
      'personaId.equals': persona.id,
      eagerload: false,
    };

    this.selAlumno = new Alumno(0);

    this.selPersona = persona;
    this.alumnoService.query(query).subscribe({
      next: (res: HttpResponse<IAlumno[]>) => {
        if (res.body && res.body.length > 0) {
          this.selAlumno = res.body[0];
        }
      },
    });
  }

  getTotalPrev(): number {
    let total = 0;
    let asignaturaCosto = 0;

    if (this.documentAsig?.asignatura?.costo) {
      asignaturaCosto = this.documentAsig.asignatura.costo;
    }

    total = asignaturaCosto + this.documentDescuento.monto!;
    return total;
  }

}
