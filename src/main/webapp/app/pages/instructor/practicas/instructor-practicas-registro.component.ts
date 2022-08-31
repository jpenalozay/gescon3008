import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { IDia } from 'app/entities/dia/dia.model';
import { DiaService } from 'app/entities/dia/service/dia.service';
import { IEmpleado } from 'app/entities/empleado/empleado.model';
import { EmpleadoService } from 'app/entities/empleado/service/empleado.service';
import { Estado } from 'app/entities/enumerations/estado.model';
import { SiNo } from 'app/entities/enumerations/si-no.model';
import { IPersona } from 'app/entities/persona/persona.model';
import { PersonaService } from 'app/entities/persona/service/persona.service';
import { IProfesor } from 'app/entities/profesor/profesor.model';
import { IProgramacion, Programacion } from 'app/entities/programacion/programacion.model';
import {
  IProgramacionDeshabilitacion,
  ProgramacionDeshabilitacion,
} from 'app/entities/programacion-deshabilitacion/programacion-deshabilitacion.model';
import { ProfesorService } from 'app/entities/profesor/service/profesor.service';
import { map } from 'rxjs';
import dayjs from 'dayjs/esm';
import { IHorarioCatalogo } from 'app/entities/horario-catalogo/horario-catalogo.model';
import { HorarioCatalogoService } from 'app/entities/horario-catalogo/service/horario-catalogo.service';
import { IAutomovil } from 'app/entities/automovil/automovil.model';
import { AutomovilService } from 'app/entities/automovil/service/automovil.service';
import { HorarioService } from 'app/entities/horario/service/horario.service';
import { IHorario } from 'app/entities/horario/horario.model';
import { CommonValidateService } from 'app/core/service/common-validate.service';
import { ProgramacionEstado } from 'app/entities/enumerations/programacion-estado.model';
import { DialogoInfoComponent } from 'app/comps/dialogos/dialogo-info.component';
import { DialogoConfirmarComponent } from 'app/comps/dialogos/dialogo-confirmar.component';
import { ProgramacionService } from 'app/entities/programacion/service/programacion.service';
import { ProgramacionDeshabilitacionService } from 'app/entities/programacion-deshabilitacion/service/programacion-deshabilitacion.service';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { HorarioTipo } from 'app/entities/enumerations/horario-tipo.model';
import { HorarioDeshabilitacion, IHorarioDeshabilitacion } from 'app/entities/horario-deshabilitacion/horario-deshabilitacion.model';
import { IFecha } from 'app/entities/fecha/fecha.model';

interface IProfIdEntity<T> {
  profesorId?: number;
  entity?: T;
}

interface IProgOption {
  selected: boolean;
  count: number;
}

@Component({
  selector: 'jhi-instructor-practicas-registro',
  templateUrl: './instructor-practicas-registro.component.html',
  styleUrls: ['./instructor-practicas-registro.component.scss'],
})
export class InstructorPracticasRegistroComponent implements OnInit {
  title = 'Programacion Instructor';

  cacheDias: IDia[] = [];
  cacheInstructores: IProfesor[] = [];
  cacheInstructoresPersona: Map<number, IPersona> = new Map<number, IPersona>();
  cacheHorarios: IHorarioCatalogo[] = [];
  cacheHorariosUsed: IHorario[] = [];
  cacheAutos: IAutomovil[] = [];
  cacheProgramaciones: IProgramacion[] = [];
  cacheProgramacionesOps: IProgOption[] = [];
  cacheProgDeshabilitaciones: IProgramacionDeshabilitacion[] = [];
  cacheProgDeshabilitacionesSel: boolean[] = [];
  cacheDiasMap: Map<number, IDia> = new Map<number, IDia>();

  selDeshabilitaciones = 0;
  selProgramRow = -1;
  selInstructorId?: number;
  selAutomovilId?: number;
  selDias: number[] = [];
  selHorarios: number[] = [];
  selAutos: string[] = [];

  selDeshabDias: IDia[] = [];
  selDeshabTurnos: IHorarioCatalogo[] = [];
  selDeshabHorarios: IHorario[] = [];

  sysAccount?: Account;

  deshabDescripcion = '';

  document: IProgramacion = new Programacion();

  formEntity?: FormGroup;

  SiNo = SiNo;

  constructor(
    private serviceDia: DiaService,
    private serviceHorarioCatalogo: HorarioCatalogoService,
    private serviceHorario: HorarioService,
    private serviceInstructor: ProfesorService,
    private serviceEmpleado: EmpleadoService,
    private servicePersona: PersonaService,
    private serviceAutomovil: AutomovilService,
    private serviceCommon: CommonValidateService,
    private serviceProgramacion: ProgramacionService,
    private serviceProgDeshabilitacion: ProgramacionDeshabilitacionService,
    private serviceAccount: AccountService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.selInstructorId = undefined;
    this.selDias = [];
    this.cacheDias = [];
    this.cacheInstructores = [];
    this.cacheProgramaciones = [];
    this.cacheInstructoresPersona.clear();

    this.document.fechaInicio = dayjs();
    this.document.fechaFin = dayjs();

    this.serviceAccount.getAuthenticationState().subscribe((resp: Account | null) => {
      if (resp) {
        this.sysAccount = resp;
      }
    });

    this.serviceAutomovil.query({ 'activo.equals': Estado.HABILITADO }).subscribe((resp: HttpResponse<IAutomovil[]>) => {
      this.cacheAutos = resp.body ?? [];
      this.selAutos = new Array<string>(this.cacheAutos.length);
    });
    this.serviceDia.query({}).subscribe({
      next: (resp: HttpResponse<IDia[]>) => {
        const frmDias: FormArray = this.formEntity?.get('dias') as FormArray;

        this.cacheDias = resp.body ?? [];

        this.selDias = new Array<number>(this.cacheDias.length);

        frmDias.clear();
        this.cacheDias.forEach((dia: IDia) => {
          this.cacheDiasMap.set(dia.id!, dia);
          frmDias.push(
            this.formBuilder.group({
              dia: [''],
            })
          );
        });
      },
    });
    this.serviceHorarioCatalogo.query({ 'activo.equals': Estado.HABILITADO }).subscribe({
      next: (resp: HttpResponse<IHorarioCatalogo[]>) => {
        const frmHorarios: FormArray = this.formEntity?.get('horarios') as FormArray;

        this.cacheHorarios = resp.body ?? [];
        this.selHorarios = new Array<number>(this.cacheHorarios.length);

        frmHorarios.clear();
        this.cacheHorarios.forEach(() => {
          frmHorarios.push(
            this.formBuilder.group({
              horario: [''],
            })
          );
        });
      },
    });
    this.serviceInstructor.query({ 'activo.equals': Estado.HABILITADO, 'practica.equals': SiNo.SI }).subscribe({
      next: (resp: HttpResponse<IProfesor[]>) => {
        this.cacheInstructores = resp.body ?? [];

        this.serviceCommon.getProgramacionInstructorLastId().subscribe((respLastId: number) => {
          this.selInstructorId = respLastId;
          this.onInstructorSel();
        });

        this.cacheInstructores.forEach((instructor: IProfesor) => {
          if (!instructor.empleado || !instructor.empleado.id) {
            return;
          }
          this.serviceEmpleado
            .find(instructor.empleado.id)
            .pipe(
              map((respEmp: HttpResponse<IEmpleado>) => {
                const instructorEmpleado: IProfIdEntity<IEmpleado> = {};

                instructorEmpleado.profesorId = instructor.id;
                instructorEmpleado.entity = respEmp.body ?? {};
                return instructorEmpleado;
              })
            )
            .subscribe({
              next: (instructorEmpleado: IProfIdEntity<IEmpleado>) => {
                this.servicePersona
                  .find(instructorEmpleado.entity!.persona!.id!)
                  .pipe(
                    map((respPers: HttpResponse<IPersona>) => {
                      const instructorPersona: IProfIdEntity<IPersona> = {};

                      instructorPersona.profesorId = instructorEmpleado.profesorId;
                      instructorPersona.entity = respPers.body ?? {};
                      return instructorPersona;
                    })
                  )
                  .subscribe({
                    next: (instructorPersona: IProfIdEntity<IPersona>) => {
                      this.cacheInstructoresPersona.set(instructorPersona.profesorId!, instructorPersona.entity!);
                    },
                  });
              },
            });
        });
      },
    });

    this.formEntity = this.formBuilder.group({
      instructorId: [''],
      automovilId: [''],
      fechaInicio: [''],
      fechaFin: [''],
      selProgram: [''],
      selDeshabilitacion: [''],
      deshabDescripcion: [''],
      dias: this.formBuilder.array([]),
      horarios: this.formBuilder.array([]),
      deshabDias: this.formBuilder.array([]),
      deshabTurnos: this.formBuilder.array([]),
      deshabHorarios: this.formBuilder.array([]),
    });
  }

  getInstructorPersona(instructorId: number): IPersona | undefined {
    return this.cacheInstructoresPersona.get(instructorId);
  }

  isAutomovilStatusCheck(): boolean {
    const selDays: number[] = [];
    const selHorarios: number[] = [];
    let checkStatus = true;

    checkStatus = !!this.document.fechaInicio;
    checkStatus = checkStatus && !!this.document.fechaFin;

    this.selDias.forEach((status: number, index: number) => {
      if (status && status > 0) {
        selDays.push(this.cacheDias[index].id!);
      }
    });
    this.selHorarios.forEach((status: number, index: number) => {
      if (status && status > 0) {
        selHorarios.push(this.cacheHorarios[index].id!);
      }
    });

    checkStatus = checkStatus && selDays.length > 0;
    checkStatus = checkStatus && selHorarios.length > 0;

    return checkStatus;
  }

  doAutomovilStatusCheck(): void {
    const selDays: number[] = [];
    const selHorarios: number[] = [];
    const autoIds: number[] = [];
    let checkStatus = true;
    const mapAutosIdIndex: Map<number, number> = new Map<number, number>();

    this.selAutomovilId = undefined;
    this.cacheHorariosUsed = [];

    checkStatus = !!this.document.fechaInicio;
    checkStatus = checkStatus && !!this.document.fechaFin;

    this.selDias.forEach((status: number, index: number) => {
      if (status && status > 0) {
        selDays.push(this.cacheDias[index].id!);
      }
    });
    this.selHorarios.forEach((status: number, index: number) => {
      if (status && status > 0) {
        selHorarios.push(this.cacheHorarios[index].id!);
      }
    });

    checkStatus = checkStatus && selDays.length > 0;
    checkStatus = checkStatus && selHorarios.length > 0;

    this.cacheAutos.forEach((auto: IAutomovil, index: number) => {
      autoIds.push(auto.id!);
      this.selAutos[index] = 'text-success';
      mapAutosIdIndex.set(auto.id!, index);
    });

    checkStatus = this.isAutomovilStatusCheck();

    if (checkStatus && autoIds.length > 0) {
      const query = {
        'automovilId.in': autoIds,
        'fechaDiaSem.in': selDays,
        'fechaDia.greaterThanOrEqual': this.document.fechaInicio?.format('YYYY-MM-DD'),
        'fechaDia.lessThan': this.document.fechaFin?.add(1, 'DAY').format('YYYY-MM-DD'),
        'horarioCatalogoId.in': selHorarios,
        'activo.equals': Estado.HABILITADO,
      };

      this.serviceHorario.query(query).subscribe({
        next: (resp: HttpResponse<IHorario[]>) => {
          const horarios: IHorario[] = resp.body ?? [];

          this.cacheHorariosUsed = horarios;
          horarios.forEach((horarioFilter: IHorario) => {
            const horarioIndex = mapAutosIdIndex.get(horarioFilter.automovil!.id!)!;
            this.selAutos[horarioIndex] = 'text-secondary';
          });
        },
      });
    }
  }

  doAutomovilShowInfo(auto: IAutomovil): void {
    const horarios: IHorario[] = [];
    let desc = '';
    let persona = '';
    let instructor: IPersona;

    this.cacheHorariosUsed.forEach((horario: IHorario) => {
      if (horario.automovil!.id! === auto.id) {
        horarios.push(horario);
        if (desc.length > 0) {
          desc = `${desc}<br/>\n`;
        }
        instructor = this.cacheInstructoresPersona.get(horario.instructor!.id!)!;
        persona = `${instructor.apellidoPaterno!}, ${instructor.nombres!}`;
        desc += `${horario.fechaDia!.format('YYYY-MM-DD')} - ${horario.horarioCatalogo!.horaInicio!} ${horario.horarioCatalogo!
          .horaFin!} - ${persona}`;
      }
    });

    const modalRef: NgbModalRef = DialogoInfoComponent.doShow(
      this.modalService,
      'danger text-white',
      this.title,
      'Detalle de conflictos...'
    );
    modalRef.componentInstance.innerHtml = desc;
  }

  doSave(): void {
    const programacion: IProgramacion = new Programacion();

    programacion.codigo = 'myvalmyval';
    programacion.automovil = { id: this.selAutomovilId };
    programacion.dias = [];
    programacion.estado = ProgramacionEstado.PROGRAMADO;
    programacion.fechaInicio = this.document.fechaInicio;
    programacion.fechaFin = this.document.fechaFin;
    programacion.horarioCatalogos = [];
    programacion.profesor = { id: this.selInstructorId };
    programacion.nombreUsuario = this.sysAccount?.login;

    this.selDias.forEach((value: number, index: number) => {
      if (value > 0) {
        programacion.dias?.push(this.cacheDias[index]);
      }
    });
    this.selHorarios.forEach((value: number, index: number) => {
      if (value > 0) {
        programacion.horarioCatalogos?.push(this.cacheHorarios[index]);
      }
    });

    if (programacion.horarioCatalogos.length < 1) {
      DialogoInfoComponent.doShow(this.modalService, 'danger text-white', this.title, `No se seleccionaron horarios a trabajar.`);
      return;
    }
    if (programacion.dias.length < 1) {
      DialogoInfoComponent.doShow(this.modalService, 'danger text-white', this.title, `No se seleccionaron dias de la semana a trabajar.`);
      return;
    }
    if (!programacion.profesor.id || programacion.profesor.id < 1) {
      DialogoInfoComponent.doShow(this.modalService, 'danger text-white', this.title, `No se selecciono un instructor.`);
      return;
    }
    if (!programacion.automovil.id || programacion.automovil.id < 1) {
      DialogoInfoComponent.doShow(this.modalService, 'danger text-white', this.title, `No se selecciono un automovil.`);
      return;
    }

    const modalRef: NgbModalRef = DialogoConfirmarComponent.doShow(this.modalService, this.title, '¿Desea procesar la transaccion?');
    modalRef.closed.subscribe({
      next: (result: boolean) => {
        if (!result) {
          return;
        }
        this.serviceCommon.doSaveProgramacion(programacion).subscribe({
          error: (err: any) => {
            const msg: string = err.error?.detail;
            DialogoInfoComponent.doShow(this.modalService, 'danger text-white', 'Registro Programacion', msg);
          },
          complete: () => {
            DialogoInfoComponent.doShow(
              this.modalService,
              'success text-white',
              this.title,
              'Registro procesado satisfactoriamente.'
            ).hidden.subscribe(() => {
              window.location.reload();
            });
          },
        });
      },
    });
  }

  doDelete(): void {
    if ((!this.selProgramRow && this.selProgramRow !== 0) || this.selProgramRow < 0) {
      return;
    }
    const programacionId: number = this.cacheProgramaciones[this.selProgramRow].id!;
    if (!programacionId) {
      return;
    }

    const modalRef: NgbModalRef = DialogoConfirmarComponent.doShow(this.modalService, this.title, '¿Desea Eliminar la Programacion?');
    modalRef.closed.subscribe((result: boolean) => {
      if (!result) {
        return;
      }

      this.serviceCommon.doDeleteProgramacion(programacionId).subscribe({
        error: (err: any) => {
          const msg: string = err.error?.detail;
          DialogoInfoComponent.doShow(this.modalService, 'danger text-white', 'Registro Programacion', msg);
        },
        complete: () => {
          DialogoInfoComponent.doShow(
            this.modalService,
            'success text-white',
            this.title,
            'Registro procesado satisfactoriamente.'
          ).hidden.subscribe(() => {
            this.onInstructorSel();
          });
        },
      });
    });
  }

  onInstructorSel(): void {
    let instructorId = 0;
    this.cacheProgramaciones = [];
    this.selProgramRow = -1;
    this.selDeshabilitaciones = 0;

    if (this.selInstructorId) {
      instructorId = this.selInstructorId!;
    }

    this.serviceProgramacion.query({ 'estado.equals': ProgramacionEstado.PROGRAMADO, 'profesorId.equals': instructorId }).subscribe({
      next: (resp: HttpResponse<IProgramacion[]>) => {
        this.cacheProgramaciones = resp.body ?? [];
        this.cacheProgramacionesOps = new Array<IProgOption>(this.cacheProgramaciones.length);
        this.cacheProgramaciones = this.cacheProgramaciones.reverse();
        this.cacheProgramaciones.forEach((prog: IProgramacion, indexProg: number) => {
          this.cacheProgramacionesOps[indexProg] = { selected: false, count: 0 };
          this.serviceProgramacion.find(prog.id!).subscribe((selProg: HttpResponse<IProgramacion>) => {
            prog.dias = selProg.body?.dias;
            prog.horarioCatalogos = selProg.body?.horarioCatalogos;
          });
          this.serviceCommon
            .queryProgDeshabilitacionesCount({ 'programacionId.equals': prog.id, 'activo.equals': 'HABILITADO' })
            .subscribe({
              next: (respCount: HttpResponse<number>) => {
                this.cacheProgramacionesOps[indexProg].count = respCount.body!;
              },
            });
        });
      },
    });
  }

  getDiasFromProgramacion(programacion: IProgramacion): string {
    let diasInfo = '';
    programacion.dias?.forEach((dia: IDia) => {
      if (diasInfo.length > 0) {
        diasInfo += ' ';
      }
      diasInfo += dia.nombreCorto;
    });
    return diasInfo;
  }

  getHorariosFromProgramacion(programacion: IProgramacion): string {
    let horariosInfo = '';
    programacion.horarioCatalogos?.forEach((horario: IHorarioCatalogo) => {
      if (horariosInfo.length > 0) {
        horariosInfo += ', ';
      }
      horariosInfo += `${horario.horaInicio!} - ${horario.horaFin!}`;
    });
    return horariosInfo;
  }

  get formArrayDias(): FormArray {
    const formArray: FormArray = this.formEntity?.controls.dias as FormArray;
    return formArray;
  }

  get formArrayHorarios(): FormArray {
    const formArray: FormArray = this.formEntity?.controls.horarios as FormArray;
    return formArray;
  }

  onProgramacionSel(): void {
    let size = 0;
    this.deshabDescripcion = '';
    this.cacheProgDeshabilitaciones = [];

    this.selDeshabilitaciones = 0;
    const programacion = this.cacheProgramaciones[this.selProgramRow];

    const deshabDias: FormArray = this.formEntity?.get('deshabDias') as FormArray;
    const deshabTurnos: FormArray = this.formEntity?.get('deshabTurnos') as FormArray;
    const deshabHorarios: FormArray = this.formEntity?.get('deshabHorarios') as FormArray;

    deshabDias.clear();
    deshabTurnos.clear();
    deshabHorarios.clear();

    size = programacion.dias ? programacion.dias.length : 0;
    this.selDeshabDias = new Array<IDia>(size);
    size = programacion.horarioCatalogos ? programacion.horarioCatalogos.length : 0;
    this.selDeshabTurnos = new Array<IHorarioCatalogo>(size);
    size = programacion.horarios ? programacion.horarios.length : 0;
    this.selDeshabHorarios = new Array<IHorario>(size);

    programacion.horarioCatalogos?.forEach(() => {
      deshabTurnos.push(
        this.formBuilder.group({
          horarioCat: [''],
        })
      );
    });
    programacion.dias?.forEach(() => {
      deshabDias.push(
        this.formBuilder.group({
          dia: [''],
        })
      );
    });

    const params = {
      'programacionId.equals': programacion.id,
      'activo.equals': Estado.HABILITADO,
    };

    this.serviceProgDeshabilitacion.query(params).subscribe({
      next: (resp: HttpResponse<IProgramacionDeshabilitacion[]>) => {
        const progDeshabs: IProgramacionDeshabilitacion[] = [];
        const response: IProgramacionDeshabilitacion[] = resp.body ?? [];

        this.cacheProgDeshabilitacionesSel = new Array<boolean>(response.length);
        this.cacheProgDeshabilitaciones = progDeshabs;
        response.forEach((progDeshab: IProgramacionDeshabilitacion) => {
          this.serviceProgDeshabilitacion.find(progDeshab.id!).subscribe((respPD: HttpResponse<IProgramacionDeshabilitacion>) => {
            progDeshabs.push(respPD.body!);
          });
        });
      },
    });
  }

  onDeshabilitacionFilter(): void {
    const horarioCats: number[] = [];
    const diaSemanas: number[] = [];
    const programacion = this.cacheProgramaciones[this.selProgramRow];
    const deshabHorarios: FormArray = this.formEntity?.get('deshabHorarios') as FormArray;

    deshabHorarios.clear();

    this.selDeshabTurnos.forEach((horarioCat: IHorarioCatalogo | undefined, index: number) => {
      if (horarioCat) {
        horarioCats.push(programacion.horarioCatalogos![index].id!);
      }
    });
    this.selDeshabDias.forEach((dia: IDia | undefined, index: number) => {
      if (dia) {
        diaSemanas.push(programacion.dias![index].id!);
      }
    });

    if (horarioCats.length < 1 || diaSemanas.length < 1) {
      return;
    }

    const params = {
      'activo.equals': Estado.HABILITADO,
      'tipo.equals': HorarioTipo.ADMINISTRACION,
      'programacionId.equals': programacion.id,
      'fechaDiaSem.in': diaSemanas,
      'horarioCatalogoId.in': horarioCats,
    };

    this.serviceHorario.query(params).subscribe({
      next: (respHorarios: HttpResponse<IHorario[]>) => {
        programacion.horarios = respHorarios.body ?? [];
        this.selDeshabHorarios = new Array<IHorario>(programacion.horarios.length);
        programacion.horarios.forEach(() => {
          deshabHorarios.push(
            this.formBuilder.group({
              horario: [''],
            })
          );
        });
      },
    });
  }

  getProgDeshabHorarioCats(progDeshab: IProgramacionDeshabilitacion): string {
    let response = '';

    progDeshab.horarioCatalogos?.forEach((horarioCat: IHorarioCatalogo) => {
      if (response) {
        response += ', ';
      }

      response = `${response} ${this.getHorarioCatalogoInfo(horarioCat)}`;
    });
    return response;
  }

  getHorarioCatalogoInfo(horarioCatalogo: IHorarioCatalogo): string {
    let response = '';

    response = `${horarioCatalogo.horaInicio!} - ${horarioCatalogo.horaFin!}`;
    return response;
  }

  doSaveDeshabilitacion(): void {
    const title = 'Registro Deshabilitacion';
    const mapFechas: Map<number, IFecha> = new Map<number, IFecha>();
    const horarioDeshabs: IHorarioDeshabilitacion[] = [];
    let horarioDeshab: IHorarioDeshabilitacion;
    const programacion = this.cacheProgramaciones[this.selProgramRow];
    const deshabilitacion = new ProgramacionDeshabilitacion();
    let horarioSel;

    this.selDeshabHorarios.forEach((horario: IHorario | undefined, index: number) => {
      if (horario) {
        horarioSel = programacion.horarios![index];
        horarioDeshab = new HorarioDeshabilitacion();
        horarioDeshab.horario = horarioSel;
        horarioDeshab.activo = Estado.HABILITADO;
        horarioDeshabs.push(horarioDeshab);
        mapFechas.set(horarioSel.fecha!.id!, horarioSel.fecha!);
      }
    });

    const fechas = Array.from(mapFechas.values());

    if (horarioDeshabs.length < 1) {
      return;
    }

    deshabilitacion.descripcion = this.deshabDescripcion;
    deshabilitacion.horarioDeshabilitaciones = horarioDeshabs;
    deshabilitacion.fechas = fechas;
    deshabilitacion.programacion = programacion;
    deshabilitacion.activo = Estado.HABILITADO;
    deshabilitacion.codigo = 'abcdef';
    deshabilitacion.nombreUsuario = this.sysAccount?.login;

    const modalRef: NgbModalRef = DialogoConfirmarComponent.doShow(this.modalService, title, '¿Desea procesar la transaccion?');
    modalRef.closed.subscribe((result: boolean) => {
      if (!result) {
        return;
      }

      this.serviceCommon.doSaveProgramacionDeshabilitacion(deshabilitacion).subscribe({
        error: (err: any) => {
          const msg: string = err.error?.detail;
          DialogoInfoComponent.doShow(this.modalService, 'danger text-white', title, msg);
        },
        complete: () => {
          DialogoInfoComponent.doShow(
            this.modalService,
            'success text-white',
            title,
            'Registro procesado satisfactoriamente.'
          ).hidden.subscribe(() => {
            this.onInstructorSel();
          });
        },
      });
    });
  }

  doDeleteDeshabilitacion(progDeshabilitacionId: number): void {
    const title = 'Registro Deshabilitacion';

    const modalRef: NgbModalRef = DialogoConfirmarComponent.doShow(this.modalService, title, '¿Desea eliminar la deshabilitacion?');
    modalRef.closed.subscribe((result: boolean) => {
      if (!result) {
        return;
      }

      this.serviceCommon.doDeleteProgramacionDeshabilitacion(progDeshabilitacionId).subscribe({
        error: (err: any) => {
          const msg: string = err.error?.detail;
          DialogoInfoComponent.doShow(this.modalService, 'danger text-white', title, msg);
        },
        complete: () => {
          DialogoInfoComponent.doShow(
            this.modalService,
            'success text-white',
            title,
            'Registro procesado satisfactoriamente.'
          ).hidden.subscribe(() => {
            this.onInstructorSel();
          });
        },
      });
    });
  }

  generatePdf(): void {
    const documentDefinition = this.getDocumentDefinition();
    pdfMake.createPdf(documentDefinition).open();
  }

  getDocumentDefinition(): any {
    return {
      content: [
        {
          toc: {
            title: { text: 'Ficha de Inscripción', style: 'header' },
          },
        },
        {
          text: 'NUEVO A1',
          style: 'header',
          tocItem: false,
        },
        {
          columns: [
            [
              {
                text: 'Nombre Completo : ' + 'José Luis Peñaloza Yaurivilca',
                style: 'name',
              },
              {
                text: 'Fecha de Nacimiento : ' + '01/10/1980',
              },
              {
                text: 'Email : ' + 'jpenalozay@creinfor.com',
              },
              {
                text: 'Celular : ' + '975393900',
              },
              {
                text: 'Domicilio : ' + 'Calle Tizón y Bueno 553 Jesus Maria - Lima',
              },
            ],
            [
              {
                text: 'Nombre Completo : ' + 'José Luis Peñaloza Yaurivilca',
                style: 'name',
              },
              {
                text: 'Fecha de Nacimiento : ' + '01/10/1980',
              },
              {
                text: 'Email : ' + 'jpenalozay@creinfor.com',
              },
              {
                text: 'Celular : ' + '975393900',
              },
              {
                text: 'Domicilio : ' + 'Calle Tizón y Bueno 553 Jesus Maria - Lima',
              },
            ],
          ],
        },
        {
          layout: 'lightHorizontalLines', // optional
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: ['*', 'auto', 100, '*'],

            body: [
              [{ text: '1.DATOS DEL ALUMNO', bold: true }, '', '', ''],
              ['Nombre:', 'Value 2', 'Value 3', 'Value 4'],
              ['Fecha Nacimiento:', 'Val 2', 'Val 3', 'Val 4'],
              ['Email:', 'Val 2', 'Val 3', 'Val 4'],
              ['Celular:', 'Val 2', 'Val 3', 'Val 4'],
              ['Domicilio:', 'Val 2', 'Val 3', 'Val 4'],
            ],
          },
        },
      ],
      info: {
        title: 'Ficha Inscripción',
        author: 'Creifor',
        subject: 'jlpy',
        keywords: 'FICHA DE INSCRIPCION',
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
        },
        name: {
          fontSize: 16,
          bold: true,
        },
        jobTitle: {
          fontSize: 14,
          bold: true,
          italics: true,
        },
        sign: {
          italics: true,
        },
      },
    };
  }
}
