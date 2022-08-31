import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { faPrint, faFileExcel, faFilePdf, faMailBulk, faTimes } from '@fortawesome/free-solid-svg-icons';
import { CommonValidateService, INumberStringPair } from 'app/core/service/common-validate.service';
import { HttpResponse } from '@angular/common/http';
import { ILicenciaCategoria, LicenciaCategoria } from 'app/entities/licencia-categoria/licencia-categoria.model';
import { IProfesor, Profesor } from 'app/entities/profesor/profesor.model';
import dayjs from 'dayjs/esm';
import { IAlumno } from 'app/entities/alumno/alumno.model';
import { IInscripcion } from 'app/entities/inscripcion/inscripcion.model';
import { InscripcionDetalleService } from 'app/entities/inscripcion-detalle/service/inscripcion-detalle.service';
import { IInscripcionDetalle } from 'app/entities/inscripcion-detalle/inscripcion-detalle.model';
import { IAsignatura } from 'app/entities/asignatura/asignatura.model';
import { AsignaturaService } from 'app/entities/asignatura/service/asignatura.service';
import { LicenciaCategoriaService } from 'app/entities/licencia-categoria/service/licencia-categoria.service';
import { Estado } from 'app/entities/enumerations/estado.model';
import { ProfesorService } from 'app/entities/profesor/service/profesor.service';
import { Horario, IHorario } from 'app/entities/horario/horario.model';
import { HorarioService } from 'app/entities/horario/service/horario.service';
import { forkJoin, Observable } from 'rxjs';
import { ILugarSalida } from 'app/entities/lugar-salida/lugar-salida.model';
import { LugarSalidaService } from 'app/entities/lugar-salida/service/lugar-salida.service';
import { DialogoConfirmarComponent } from 'app/comps/dialogos/dialogo-confirmar.component';
import { DialogoInfoComponent } from 'app/comps/dialogos/dialogo-info.component';
import { SiNo } from 'app/entities/enumerations/si-no.model';
import { IInscripcionPago, InscripcionPago } from 'app/entities/inscripcion-pago/inscripcion-pago.model';

interface IHorarioInfo {
  selected?: boolean;
  lugarSalida?: ILugarSalida;
}

@Component({
  selector: 'jhi-programacion-practica',
  templateUrl: './programacion-practica.component.html',
  styleUrls: ['./programacion-practica.component.scss'],
})
export class ProgramacionPracticaComponent implements OnInit {
  title = 'Registro de Clases';
  iconPrint = faPrint;
  iconExcel = faFileExcel;
  iconPDF = faFilePdf;
  iconEmail = faMailBulk;
  iconTimes = faTimes;

  formEntity?: FormGroup;

  filterCategoria: ILicenciaCategoria | undefined;
  filterFechaInicio = dayjs();
  filterFechaFin = dayjs();
  filterInstructor: IProfesor | undefined;
  filterAlumno = '';

  cacheAlumnos: INumberStringPair[] = [];
  cacheLicencias: ILicenciaCategoria[] = [];
  cacheInstructores: IProfesor[] = [];
  cacheInstructoresAll: IProfesor[] = [];
  cacheInstructoresMap: Map<number, INumberStringPair> = new Map<number, INumberStringPair>();
  cacheLicCategorias: ILicenciaCategoria[] = [];
  cacheLugarSalida: ILugarSalida[] = [];

  cacheHorarios: IHorario[] = [];
  cacheHorariosInfo: IHorarioInfo[] = [];

  selAlumno: IAlumno | undefined;

  selHorarioTipo = 0;

  constructor(
    private serviceLugarSalida: LugarSalidaService,
    private serviceHorario: HorarioService,
    private serviceInstructor: ProfesorService,
    private serviceLicCategoria: LicenciaCategoriaService,
    private serviceAsignatura: AsignaturaService,
    private serviceInsDetail: InscripcionDetalleService,
    private serviceCommon: CommonValidateService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.doInit();
    this.cacheInstructoresMap.set(0, { key: 0, value: '--- TODOS ---' });

    this.serviceLugarSalida.query({}).subscribe({
      next: (resp: HttpResponse<ILugarSalida[]>) => {
        this.cacheLugarSalida = resp.body ?? [];
      },
    });
    this.serviceLicCategoria.query({ eagerload: true }).subscribe({
      next: (resp: HttpResponse<ILicenciaCategoria[]>) => {
        this.cacheLicCategorias = resp.body ?? [];
        this.cacheLicCategorias.unshift(new LicenciaCategoria(0, '--- TODOS ---'));
      },
    });
    this.serviceInstructor.query({ 'activo.equals': Estado.HABILITADO }).subscribe({
      next: (resp: HttpResponse<IProfesor[]>) => {
        this.cacheInstructoresAll = resp.body ?? [];
      },
    });
    this.serviceCommon.doInstructoSimple().subscribe({
      next: (resp: HttpResponse<INumberStringPair[]>) => {
        const simples: INumberStringPair[] = resp.body ?? [];

        simples.forEach((simple: INumberStringPair) => {
          this.cacheInstructoresMap.set(simple.key!, simple);
        });
      },
    });

    this.formEntity = this.formBuilder.group({
      filterAlumno: [''],
      filterCategoria: [''],
      filterFechaInicio: [''],
      filterFechaFin: [''],
      filterInstructor: [''],
      selHorarioTipo: [''],
      horarios: this.formBuilder.array([]),
    });
  }

  doInit(): void {
    this.filterAlumno = '';
    this.doInscripcionClean();
  }

  doInscripcionClean(): void {
    this.filterCategoria = undefined;
    this.filterFechaInicio = dayjs();
    this.filterFechaFin = dayjs();
    this.filterInstructor = undefined;

    this.cacheAlumnos = [];
    this.cacheLicencias = [];
    this.cacheInstructores = [];
    this.cacheHorarios = [];

    this.selAlumno = undefined;
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

  doAlumnoLoad(alumnoCodigo: string): void {
    this.cacheHorarios = [];
    this.cacheHorariosInfo = [];

    this.selHorarioTipo = 2;

    this.serviceCommon.getAlumnoFullLoad(alumnoCodigo).subscribe((resp: HttpResponse<IAlumno>) => {
      const alumno: IAlumno = resp.body!;

      this.selAlumno = alumno;
      this.doHorariosLoad(alumno.horarios!);
      alumno.inscripcions!.forEach((inscrip: IInscripcion) => {
        inscrip.inscripcionDetalles = [];

        this.serviceInsDetail
          .query({ 'inscripcionId.equals': inscrip.id })
          .subscribe((respInscrip: HttpResponse<IInscripcionDetalle[]>) => {
            inscrip.inscripcionDetalles = respInscrip.body ?? [];
            inscrip.inscripcionDetalles.forEach((inscripDet: IInscripcionDetalle) => {
              this.serviceAsignatura.find(inscripDet.asignatura!.id!).subscribe((respAsig: HttpResponse<IAsignatura>) => {
                inscripDet.asignatura = respAsig.body!;

                this.cacheLicCategorias = inscripDet.asignatura.categorias!;
                this.cacheLicCategorias.unshift(new LicenciaCategoria(0, '--- TODOS ---'));
                this.filterCategoria = this.cacheLicCategorias[0];
                this.onLicCategoriaSel();
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

  getAlumnoDni(): string {
    if (this.selAlumno?.persona) {
      return this.selAlumno.persona.numeroDocumento!;
    } else {
      return '';
    }
  }

  /*
  getAlumnoFoto(): string {
    if (this.selAlumno) {
      return this.selAlumno?.imagen!;
    } else {
      return '';
    }
  }
  */

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

  getAlumnoClases(): number {
    let clases = 0;
    if (this.selAlumno?.alumnoClases) {
      clases = this.selAlumno.alumnoClases.clasesTotales!;
    }
    return clases;
  }

  getAlumnoClasesAsignadas(): number {
    let clases = 0;
    if (this.selAlumno?.alumnoClases) {
      clases = this.selAlumno.alumnoClases.clasesProgramadas!;
    }
    return clases;
  }

  doPrintPDF(): void {
    if (this.selHorarioTipo !== 2) {
      return;
    }

    const DATA = document.getElementById('tblHorarios');
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 3,
    };

    html2canvas(DATA!, options)
      .then(canvas => {
        const img = canvas.toDataURL('image/PNG');

        // Add image Canvas to PDF
        const bufferX = 15;
        const bufferY = 15;
        const imgProps = (doc as any).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(img, 'PNG', bufferX, bufferY, pdfWidth, pdfHeight, undefined, 'FAST');
      })
      .then(docResult => {
        doc.save(`${new Date().toISOString()}_tutorial.pdf`);
      });
  }

  onLicCategoriaSel(): void {
    const instructores: IProfesor[] = [];

    instructores.push(new Profesor(0));
    if (this.filterCategoria) {
      const catIds: number[] = [];
      if (!this.filterCategoria.id) {
        this.cacheLicCategorias.forEach((cat: ILicenciaCategoria) => {
          catIds.push(cat.id!);
        });
      } else {
        catIds.push(this.filterCategoria.id);
      }

      this.serviceInstructor.query({ 'licenciasPermitidasId.in': catIds, 'practica.equals': SiNo.SI }).subscribe({
        next: (resp: HttpResponse<IProfesor[]>) => {
          const profs = resp.body ?? [];
          this.cacheInstructores = instructores.concat(profs);
        },
      });

      /*
      if (this.filterCategoria.id! > 0) {
        this.filterCategoria.intructores?.forEach((instructor: IProfesor) => {
          if (instructor.activo === Estado.HABILITADO) {
            instructores.push(instructor);
          }
        });
      } else {
        instructores = instructores.concat(this.cacheInstructoresAll);
      }*/
    }

    this.filterInstructor = instructores[0];
    this.cacheInstructores = instructores;
  }

  getInstructorFullname(instructorId: number): string {
    return this.cacheInstructoresMap.has(instructorId) ? this.cacheInstructoresMap.get(instructorId)!.value! : '';
  }

  doLibresFilter(): void {
    const frmHorarios: FormArray = this.formEntity?.get('horarios') as FormArray;
    const instructorIds: number[] = [];
    const filterFechaFin = this.filterFechaFin.add(1, 'day');
    const params = {
      'activo.equals': Estado.HABILITADO,
      'fechaDia.greaterThanOrEqual': this.filterFechaInicio.format('YYYY-MM-DD'),
      'fechaDia.lessThan': filterFechaFin.format('YYYY-MM-DD'),
      'alumnoId.specified': false,
    };

    frmHorarios.clear();
    this.cacheHorarios = [];
    this.cacheHorariosInfo = [];

    if (this.filterInstructor) {
      if (this.filterInstructor.id! > 0) {
        instructorIds.push(this.filterInstructor.id!);
      } else {
        this.cacheInstructores.forEach((instructor: IProfesor) => {
          if (instructor.id! > 0) {
            instructorIds.push(instructor.id!);
          }
        });
      }
      Object.assign(params, { 'instructorId.in': instructorIds });
    }

    this.serviceHorario.query(params).subscribe({
      next: (resp: HttpResponse<IHorario[]>) => {
        this.doHorariosLoad(resp.body ?? []);
      },
    });
  }

  doHorariosLoad(horariosToLoad: IHorario[]): void {
    const horarioObs: Observable<HttpResponse<IHorario>>[] = [];
    const horarios: IHorario[] = [];
    const lugarSalidaDef: ILugarSalida | undefined = this.cacheLugarSalida.length > 0 ? this.cacheLugarSalida[0] : undefined;
    let lugarSal: ILugarSalida | undefined;
    const frmHorarios: FormArray = this.formEntity?.get('horarios') as FormArray;
    let info: IHorarioInfo;

    frmHorarios.clear();
    this.cacheHorarios = [];
    this.cacheHorariosInfo = [];

    horariosToLoad.forEach((horario: IHorario) => {
      horarioObs.push(this.serviceHorario.find(horario.id!));
    });

    forkJoin(horarioObs).subscribe({
      next: (respObs: HttpResponse<IHorario>[]) => {
        respObs.forEach((respHorario: HttpResponse<IHorario>) => {
          lugarSal = undefined;
          if (respHorario.body?.lugarSalida) {
            lugarSal = respHorario.body.lugarSalida;
          }
          info = { selected: false, lugarSalida: lugarSalidaDef };
          this.cacheHorariosInfo.push(info);
          horarios.push(respHorario.body!);

          frmHorarios.push(
            this.formBuilder.group({
              selected: [{ value: false, disabled: this.isHorarioWithAlumno(respHorario.body!) }, Validators.required],
              lugarSalida: [''],
            })
          );
        });

        horarios.sort((a: IHorario, b: IHorario) => {
          if (a.fechaDia?.isSame(b.fechaDia)) {
            const eval01 = a.horarioCatalogo!.horaInicio!;
            const eval02 = b.horarioCatalogo!.horaInicio!;

            return eval01 === eval02 ? 0 : eval01 > eval02 ? 1 : -1;
          } else if (a.fechaDia?.isAfter(b.fechaDia)) {
            return 1;
          } else {
            return -1;
          }
        });
        this.cacheHorarios = horarios;
      },
    });
  }

  isHorarioWithAlumno(horario: IHorario): boolean {
    if (horario.alumno) {
      return true;
    } else {
      return false;
    }
  }

  doHorarioSave(): void {
    const horarios: IHorario[] = [];
    let horario: IHorario;

    this.cacheHorariosInfo.forEach((info: IHorarioInfo, i: number) => {
      if (info.selected) {
        horario = new Horario();
        horario.id = this.cacheHorarios[i].id;
        horario.lugarSalida = info.lugarSalida;
        horario.alumno = this.selAlumno;
        horarios.push(horario);
      }
    });

    if (horarios.length < 1) {
      return;
    }
    if (!this.selAlumno) {
      return;
    }

    const modalRef: NgbModalRef = DialogoConfirmarComponent.doShow(this.modalService, this.title, '¿Desea registrar los horarios?');
    modalRef.closed.subscribe((result: boolean) => {
      if (!result) {
        return;
      }

      this.serviceCommon.doSaveHorarios(horarios).subscribe({
        error: (err: any) => {
          const msg: string = err.error?.detail;
          DialogoInfoComponent.doShow(this.modalService, 'danger text-white', this.title, msg);
        },
        complete: () => {
          this.doAlumnoLoad(this.selAlumno!.codigo!);
          /*
          DialogoInfoComponent.doShow(
            this.modalService,
            'success text-white',
            this.title,
            'Registro procesado satisfactoriamente.'
          ).hidden.subscribe(() => {
            this.doAlumnoLoad(this.selAlumno!.codigo!);
          });
          */
        },
      });
    });
  }

  doHorarioDelete(horario: IHorario): void {
    const modalRef: NgbModalRef = DialogoConfirmarComponent.doShow(this.modalService, this.title, '¿Desea eliminar el horario?');
    modalRef.closed.subscribe((result: boolean) => {
      if (!result) {
        return;
      }

      this.serviceCommon.doDeleteHorarioAlumno(horario.id!).subscribe({
        error: (err: any) => {
          const msg: string = err.error?.detail;
          DialogoInfoComponent.doShow(this.modalService, 'danger text-white', this.title, msg);
        },
        complete: () => {
          DialogoInfoComponent.doShow(
            this.modalService,
            'success text-white',
            this.title,
            'Registro eliminado satisfactoriamente.'
          ).hidden.subscribe(() => {
            this.doAlumnoLoad(this.selAlumno!.codigo!);
          });
        },
      });
    });
  }

  doPrintReserved(): void {
    const printContents = document.getElementById('table-to-print')?.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents!;
    window.print();
    document.body.innerHTML = originalContents;
  }
}
