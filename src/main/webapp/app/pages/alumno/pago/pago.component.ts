import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbNav } from '@ng-bootstrap/ng-bootstrap';
import { DialogoConfirmarComponent } from 'app/comps/dialogos/dialogo-confirmar.component';
import { DialogoInfoComponent } from 'app/comps/dialogos/dialogo-info.component';
import { DialogoValidarUsuarioComponent } from 'app/comps/dialogos/dialogo-validar-usuario.component';
import { Account } from 'app/core/auth/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { CommonValidateService, INumberStringPair } from 'app/core/service/common-validate.service';
import { Alumno, IAlumno } from 'app/entities/alumno/alumno.model';
import { AlumnoService } from 'app/entities/alumno/service/alumno.service';
import { AlumnoEstado } from 'app/entities/enumerations/alumno-estado.model';
import { AlumnoTipo } from 'app/entities/enumerations/alumno-tipo.model';
import { Estado } from 'app/entities/enumerations/estado.model';
import { InscripcionEstado } from 'app/entities/enumerations/inscripcion-estado.model';
import { InscripcionFormaPago } from 'app/entities/enumerations/inscripcion-forma-pago.model';
import { SiNo } from 'app/entities/enumerations/si-no.model';
import { TipoDocumentoVenta } from 'app/entities/enumerations/tipo-documento-venta.model';
import { IInscripcionDescuento, InscripcionDescuento } from 'app/entities/inscripcion-descuento/inscripcion-descuento.model';
import { IInscripcionDetalle, InscripcionDetalle } from 'app/entities/inscripcion-detalle/inscripcion-detalle.model';
import { IInscripcionPago, InscripcionPago } from 'app/entities/inscripcion-pago/inscripcion-pago.model';
import { IInscripcion, Inscripcion } from 'app/entities/inscripcion/inscripcion.model';
import { IPersona, Persona } from 'app/entities/persona/persona.model';
import { PersonaService } from 'app/entities/persona/service/persona.service';
import { IRequisitosInscripcion } from 'app/entities/requisitos-inscripcion/requisitos-inscripcion.model';
import { SucursalSerieService } from 'app/entities/sucursal-serie/service/sucursal-serie.service';
import { ISucursalSerie } from 'app/entities/sucursal-serie/sucursal-serie.model';
import { SucursalService } from 'app/entities/sucursal/service/sucursal.service';
import { ISucursal } from 'app/entities/sucursal/sucursal.model';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';
import { UsuarioService } from 'app/entities/usuario/service/usuario.service';
import { IUsuario } from 'app/entities/usuario/usuario.model';
import dayjs from 'dayjs/esm';
import { forkJoin, Observable } from 'rxjs';
import { nonWhiteSpace } from 'html2canvas/dist/types/css/syntax/parser';
import { IConfiguracionFormCarac } from 'app/entities/configuracion-form-carac/configuracion-form-carac.model';
import { ConfiguracionFormCaracService } from 'app/entities/configuracion-form-carac/service/configuracion-form-carac.service';
import { IAsignaturaAdiciones } from 'app/entities/asignatura-adiciones/asignatura-adiciones.model';
import { InscripcionDetalleService } from 'app/entities/inscripcion-detalle/service/inscripcion-detalle.service';
import { AsignaturaService } from 'app/entities/asignatura/service/asignatura.service';
import { IAsignatura } from 'app/entities/asignatura/asignatura.model';

@Component({
  selector: 'jhi-pago',
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.scss'],
})
export class PagoComponent implements OnInit {
  title = 'Registro Inscripcion';
  account?: Account;
  cacheSucursales: ISucursal[] = [];
  cacheSucursalSeries: ISucursalSerie[] = [];
  cacheSucursalSeriesMap: Map<TipoDocumentoVenta, ISucursalSerie[]> = new Map<TipoDocumentoVenta, ISucursalSerie[]>();
  cacheSucursalSeriesTipos: string[] = [];
  cacheSucursalSeriesSerie: ISucursalSerie[] = [];
  document?: IInscripcion;
  documentAsig?: IInscripcionDetalle;
  documentDescuento: IInscripcionDescuento = new InscripcionDescuento();
  documentPago = new InscripcionPago();
  selReqInscripciones: IRequisitosInscripcion[] = [];
  selPersona: IPersona = new Persona();
  selAlumno: IAlumno | undefined = new Alumno();
  selSucursalId?: number;
  selSucursalSerieId?: number;
  selAdminJwt = '';
  selAsignatura = 'navAsignaturas0';
  fechaActual = new Date();
  codigoAlumno = '';
  inscriEstado = '';
  tipoDoc = '';
  serieDoc = '';
  subTotalAdicional = '';
  formEntity?: FormGroup;
  sysAccount?: Account;
  SiNo = SiNo;
  cacheAsignaturaAdds: IAsignaturaAdiciones[] = [];
  filterAlumno = '';
  cacheAlumnos: INumberStringPair[] = [];

  constructor(
    private servicePersona: PersonaService,
    private serviceAlumno: AlumnoService,
    private serviceSucursalSerie: SucursalSerieService,
    private serviceCommon: CommonValidateService,
    private serviceUsuario: UsuarioService,
    private serviceAccount: AccountService,
    private serviceUser: UserService,
    private serviceConfFormCarac: ConfiguracionFormCaracService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private serviceInsDetail: InscripcionDetalleService,
    private serviceAsignatura: AsignaturaService
  ) {}

  ngOnInit(): void {
    this.doInit();
    this.documentAsig = new InscripcionDetalle();
    this.document = new Inscripcion();
    this.document.inscripcionDetalles = [this.documentAsig];
    this.documentDescuento = new InscripcionDescuento();
    this.documentDescuento.monto = 0;
    this.documentPago.monto = 0;

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

    this.serviceAccount.identity().subscribe(account => {
      if (account) {
        this.account = account;
      }
    });

    this.serviceAccount.getAuthenticationState().subscribe((resp: Account | null) => {
      if (resp) {
        this.sysAccount = resp;

        this.serviceUser.query().subscribe({
          next: (respUsers: HttpResponse<IUser[]>) => {
            const users: IUser[] = respUsers.body ?? [];
            users.forEach((user: IUser) => {
              if (resp.login === user.login) {
                this.serviceUsuario.query({ 'userId.equals': user.id! }).subscribe({
                  next: (respUsuario: HttpResponse<IUsuario[]>) => {
                    respUsuario.body?.some((usuario: IUsuario) => {
                      this.serviceUsuario.find(usuario.id!).subscribe({
                        next: (respUsuarioLoad: HttpResponse<IUsuario>) => {
                          const sucursalIds: number[] = [];
                          const sucursales = respUsuarioLoad.body!.sucursals ?? [];

                          this.cacheSucursales = this.doFilter(sucursales, (row: ISucursal) => row.activo === Estado.HABILITADO);
                          this.cacheSucursales.forEach((sucursal: ISucursal) => {
                            sucursalIds.push(sucursal.id!);
                          });
                          if (sucursalIds.length > 0) {
                            this.serviceSucursalSerie
                              .query({ 'activo.equals': Estado.HABILITADO, 'sucursalId.in': sucursalIds })
                              .subscribe({
                                next: (respSeries: HttpResponse<ISucursalSerie[]>) => {
                                  const series: ISucursalSerie[] = respSeries.body ?? [];

                                  if (series.length > 0) {
                                    this.selSucursalId = series[0].sucursal?.id;
                                    this.onSucursalSel();
                                  }
                                },
                              });
                          }
                        },
                      });
                      return true;
                    });
                  },
                });
              }
            });
          },
        });
      }
    });
  }

  isAdminRole(values: string[]): boolean {
    const evalRol: boolean = values.some((value: string) => {
      if (value === 'ROL_ADMINISTRADOR' || value === 'ROLE_ADMIN') {
        return true;
      }
      return false;
    });

    return evalRol;
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

  getTotalPrevTotal(): number {
    let total = 0;
    let asignaturaCosto = 0;

    if (this.documentAsig?.asignatura?.costo) {
      asignaturaCosto = this.documentAsig.asignatura.costo;
    }

    total = asignaturaCosto;
    return total;
  }

  getTotalDoc(): number {
    let total = 0;

    total = this.getTotalPrev() - (this.documentPago.monto ?? 0);
    return total;
  }

  getTotalTotal(): number {
    let totalTotal = 0;

    totalTotal = this.getTotalPrev();
    return totalTotal;
  }

  onSucursalSel(): void {
    this.cacheSucursalSeries = [];
    this.cacheSucursalSeriesMap.clear();
    this.cacheSucursalSeriesTipos = [];
    this.cacheSucursalSeriesSerie = [];
    this.selSucursalSerieId = 0;
    this.document!.codigo = '';

    this.serviceSucursalSerie.query({ 'sucursalId.equals': this.selSucursalId, 'activo.equals': 'HABILITADO' }).subscribe({
      next: (res: HttpResponse<IAsignaturaAdiciones[]>) => {
        const mapTipo = this.cacheSucursalSeriesMap;
        let series: ISucursalSerie[];

        this.cacheSucursalSeries = res.body ?? [];
        this.cacheSucursalSeries.forEach((ss: ISucursalSerie) => {
          if (!mapTipo.has(ss.tipoDocumento!)) {
            series = [];
            mapTipo.set(ss.tipoDocumento!, series);
          } else {
            series = mapTipo.get(ss.tipoDocumento!)!;
          }
          series.push(ss);
          //this.tipoDoc = series
        });
        this.cacheSucursalSeriesTipos = Array.from(this.cacheSucursalSeriesMap.keys());
        if (this.cacheSucursalSeriesTipos.length > 0) {
          this.onSucursalTipoSel({ target: { value: this.cacheSucursalSeriesTipos[0] } });
        }
      },
    });
  }

  onSucursalTipoSel(event: any): void {
    this.cacheSucursalSeriesSerie = [];
    this.selSucursalSerieId = 0;
    this.document!.codigo = '';

    if (event.target.value) {
      if (this.cacheSucursalSeriesMap.has(event.target.value)) {
        this.tipoDoc = String(event.target.value);
        this.cacheSucursalSeriesSerie = this.cacheSucursalSeriesMap.get(event.target.value)!;
        if (this.cacheSucursalSeriesSerie.length > 0) {
          this.selSucursalSerieId = this.cacheSucursalSeriesSerie[0].id;
          this.onSucursalSerieSel();
        }
      }
    }
  }

  onSucursalSerieSel(): void {
    this.cacheSucursalSeriesSerie.some((serie: ISucursalSerie) => {
      if (serie.id === this.selSucursalSerieId) {
        this.serieDoc = String(serie.serie);
        this.document!.codigo = `${serie.numeroUltimo! + 1}`;
        this.document!.numeroDocumento = serie.numeroUltimo;
        return true;
      }

      return false;
    });
  }

  doPersonaFind(): void {
    const personaCodigo = this.formEntity?.controls.personaCodigo.value;
    //const alumnoEstado = this.formEntity?.controls.alumnoEstado.value;
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
      error: (err: any) => {
        const msg: string = err.error?.detail;
        const modalRef = DialogoInfoComponent.doShow(this.modalService, 'danger text-white', this.title, msg);
        modalRef.componentInstance.innerHtml = `Para el registro visitar <a href="/persona">Aqui</a>`;
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
    this.serviceAlumno.query(query).subscribe({
      next: (res: HttpResponse<IAlumno[]>) => {
        if (res.body && res.body.length > 0) {
          this.selAlumno = res.body[0];
        }
      },
    });
  }

  doAdminValidate(): void {
    if (this.selAdminJwt) {
      this.selAdminJwt = '';
      this.documentDescuento.descripcion = '';
      this.documentDescuento.monto = 0;

      return;
    }
    const isValid = this.isAdminRole(this.sysAccount!.authorities);
    if (isValid) {
      this.selAdminJwt = '1';
      return;
    }
    const modalRef = DialogoValidarUsuarioComponent.doShow(this.modalService);
    modalRef.closed.subscribe({
      next: (value: string) => {
        this.selAdminJwt = value;
      },
    });
  }

  doFilter<T>(values: T[], fnEval: (row: T) => boolean): T[] {
    const result: T[] = [];

    values.forEach((row: T) => {
      if (fnEval(row)) {
        result.push(row);
      }
    });
    return result;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////

  doInit(): void {
    this.filterAlumno = '';
    this.doClean();
  }

  doClean(): void {
    this.cacheAlumnos = [];
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
}
