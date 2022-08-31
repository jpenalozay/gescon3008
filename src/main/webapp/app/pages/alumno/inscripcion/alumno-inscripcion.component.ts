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
import { CommonValidateService } from 'app/core/service/common-validate.service';
import { Alumno, IAlumno } from 'app/entities/alumno/alumno.model';
import { AlumnoService } from 'app/entities/alumno/service/alumno.service';
import { IAsignaturaAdiciones } from 'app/entities/asignatura-adiciones/asignatura-adiciones.model';
import { IAsignaturaRequisito } from 'app/entities/asignatura-requisito/asignatura-requisito.model';
import { Asignatura, IAsignatura } from 'app/entities/asignatura/asignatura.model';
import { AsignaturaService } from 'app/entities/asignatura/service/asignatura.service';
import { AlumnoEstado } from 'app/entities/enumerations/alumno-estado.model';
import { AlumnoTipo } from 'app/entities/enumerations/alumno-tipo.model';
import { Estado } from 'app/entities/enumerations/estado.model';
import { InscripcionEstado } from 'app/entities/enumerations/inscripcion-estado.model';
import { InscripcionFormaPago } from 'app/entities/enumerations/inscripcion-forma-pago.model';
import { RequitisoTipo } from 'app/entities/enumerations/requitiso-tipo.model';
import { SiNo } from 'app/entities/enumerations/si-no.model';
import { TipoDocumentoVenta } from 'app/entities/enumerations/tipo-documento-venta.model';
import { TipoRequisito } from 'app/entities/enumerations/tipo-requisito.model';
import { IInscripcionAdicional, InscripcionAdicional } from 'app/entities/inscripcion-adicional/inscripcion-adicional.model';
import {
  IInscripcionAsignaturaRequisito,
  InscripcionAsignaturaRequisito,
} from 'app/entities/inscripcion-asignatura-requisito/inscripcion-asignatura-requisito.model';
import { IInscripcionDescuento, InscripcionDescuento } from 'app/entities/inscripcion-descuento/inscripcion-descuento.model';
import { IInscripcionDetalle, InscripcionDetalle } from 'app/entities/inscripcion-detalle/inscripcion-detalle.model';
import { IInscripcionPago, InscripcionPago } from 'app/entities/inscripcion-pago/inscripcion-pago.model';
import { IInscripcion, Inscripcion } from 'app/entities/inscripcion/inscripcion.model';
import { IPersona, Persona } from 'app/entities/persona/persona.model';
import { PersonaService } from 'app/entities/persona/service/persona.service';
import { IRequisitosInscripcion } from 'app/entities/requisitos-inscripcion/requisitos-inscripcion.model';
import { RequisitosInscripcionService } from 'app/entities/requisitos-inscripcion/service/requisitos-inscripcion.service';
import { SucursalSerieService } from 'app/entities/sucursal-serie/service/sucursal-serie.service';
import { ISucursalSerie } from 'app/entities/sucursal-serie/sucursal-serie.model';
import { SucursalService } from 'app/entities/sucursal/service/sucursal.service';
import { ISucursal } from 'app/entities/sucursal/sucursal.model';
import { ITeoriaHorarioCatalogo } from 'app/entities/teoria-horario-catalogo/teoria-horario-catalogo.model';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';
import { UsuarioService } from 'app/entities/usuario/service/usuario.service';
import { IUsuario } from 'app/entities/usuario/usuario.model';
import dayjs from 'dayjs/esm';
import { forkJoin, Observable } from 'rxjs';
import { nonWhiteSpace } from 'html2canvas/dist/types/css/syntax/parser';
import { IConfiguracionFormCarac } from 'app/entities/configuracion-form-carac/configuracion-form-carac.model';
import { ConfiguracionFormCaracService } from 'app/entities/configuracion-form-carac/service/configuracion-form-carac.service';
interface IAdicionalInfo {
  valSelected?: boolean;
  valNumber?: number;
  valNumberMin?: number;
  valNumberMax?: number;
  valNumberInc?: number;
  valNumberFct?: number;
  valTotal?: number;
  valMulti?: string[];
  valMultiSel?: string[];
  valMultiVal?: number[];
}

class AdicionalInfo implements IAdicionalInfo {
  constructor(
    public valSelected?: boolean,
    public valNumber?: number,
    public valNumberMin?: number,
    public valNumberMax?: number,
    public valNumberInc?: number,
    public valNumberFct?: number,
    public valTotal?: number,
    public valMulti?: string[],
    public valMultiSel?: string[],
    public valMultiVal?: number[]
  ) {}
}

@Component({
  selector: 'jhi-alumno-inscripcion',
  templateUrl: './alumno-inscripcion.component.html',
  styleUrls: ['./alumno-inscripcion.component.scss'],
})
export class AlumnoInscripcionComponent implements OnInit {
  title = 'Registro Inscripcion';

  @ViewChild('navbarAsignaturas') navAsignaturas: NgbNav | undefined;

  account?: Account;

  cacheAsignaturas?: IAsignatura[];
  cacheReqInscripcion?: IRequisitosInscripcion[];
  cacheReqInscripcionVals: AdicionalInfo[] = [];
  cacheAsignaturaAdds: IAsignaturaAdiciones[] = [];
  cacheAsignaturaReqs: IAsignaturaRequisito[] = [];
  cacheAsignaturaReqsOblig = false;
  cacheAsignaturaHorarios: ITeoriaHorarioCatalogo[] = [];
  cacheSucursales: ISucursal[] = [];
  cacheSucursalSeries: ISucursalSerie[] = [];
  cacheSucursalSeriesMap: Map<TipoDocumentoVenta, ISucursalSerie[]> = new Map<TipoDocumentoVenta, ISucursalSerie[]>();
  cacheSucursalSeriesTipos: string[] = [];
  cacheSucursalSeriesSerie: ISucursalSerie[] = [];

  document?: IInscripcion;
  documentAsig?: IInscripcionDetalle;
  documentDocuments?: Map<number, IInscripcionAsignaturaRequisito>;
  documentDescuento: IInscripcionDescuento = new InscripcionDescuento();
  documentPago = new InscripcionPago();

  selReqInscripciones: IRequisitosInscripcion[] = [];
  selPersona: IPersona = new Persona();
  selAlumno: IAlumno = new Alumno();
  selSucursalId?: number;
  selSucursalSerieId?: number;
  selHorario?: ITeoriaHorarioCatalogo;
  selAdminJwt = '';
  selAsignatura = 'navAsignaturas0';

  fechaActual = new Date();
  codigoAlumno = '';
  inscriEstado = '';
  horarioTeoria = '';
  tipoDoc = '';
  serieDoc = '';
  subTotalAdicional = '';

  formEntity?: FormGroup;

  sysAccount?: Account;

  RequitisoTipo = RequitisoTipo;
  SiNo = SiNo;

  reporteInscripcion = '';

  constructor(
    private servicePersona: PersonaService,
    private serviceAlumno: AlumnoService,
    private serviceAsignatura: AsignaturaService,
    private serviceReqInscipcion: RequisitosInscripcionService,
    private serviceSucursal: SucursalService,
    private serviceSucursalSerie: SucursalSerieService,
    private serviceCommon: CommonValidateService,
    private serviceUsuario: UsuarioService,
    private serviceAccount: AccountService,
    private serviceUser: UserService,
    private serviceConfFormCarac: ConfiguracionFormCaracService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.documentAsig = new InscripcionDetalle();
    this.document = new Inscripcion();
    this.document.inscripcionDetalles = [this.documentAsig];
    this.selReqInscripciones = [];
    // this.documentAsig.inscripcionAdicionals = [];
    this.document.inscripcionAdicionals = [];
    this.documentDocuments = new Map();
    this.documentDescuento = new InscripcionDescuento();
    this.documentDescuento.monto = 0;
    this.documentPago.monto = 0;

    this.formEntity = this.formBuilder.group({
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
    this.reporteInscripcion = 'Si';
    this.serviceConfFormCarac.query({ 'estado.equals': Estado.HABILITADO }).subscribe({
      next: (res: HttpResponse<IConfiguracionFormCarac[]>) => {
        res.body?.forEach((resp: IConfiguracionFormCarac) => {
          if (resp.estado! === 'HABILITADO' /* && resp.formularioCaracteristica! === 'ReporteInscripcionAlumno'*/) {
            this.reporteInscripcion = 'Si';
            //console.log('dataaaaaaaaaaaaaaaaaaaaaaaaa:::::::::::',resp.formularioCaracteristica!);
          }
        });
      },
    });

    this.serviceAsignatura.query({ 'activo.equals': Estado.HABILITADO }).subscribe({
      next: (res: HttpResponse<IAsignatura[]>) => {
        const respObs: Observable<HttpResponse<IAsignatura>>[] = [];
        const cacheAsignaturas: IAsignatura[] = [];

        res.body?.forEach((respAsig: IAsignatura) => {
          respObs.push(this.serviceAsignatura.find(respAsig.id!));
        });

        forkJoin(respObs).subscribe((observer: HttpResponse<IAsignatura>[]) => {
          observer.forEach((response: HttpResponse<IAsignatura>) => {
            cacheAsignaturas.push(response.body!);
          });

          const asignaturaClean = new Asignatura();
          asignaturaClean.id = 0;
          asignaturaClean.costo = 0;
          asignaturaClean.asignaturaRequisitos = [];
          asignaturaClean.horarios = [];
          asignaturaClean.adicionals = [];

          this.cacheAsignaturas = cacheAsignaturas;
          this.cacheAsignaturas.unshift(asignaturaClean);
          this.onAsignaturaSelected(asignaturaClean, true);
        });
      },
    });
    /*
    this.serviceAsignatura.query({ eagerload: true }).subscribe({
      next: (res: HttpResponse<IAsignatura[]>) => {
        const asignaturaClean = new Asignatura();
        asignaturaClean.id = 0;
        asignaturaClean.costo = 0;
        asignaturaClean.asignaturaRequisitos = [];
        asignaturaClean.horarios = [];
        asignaturaClean.adicionals = [];

        this.cacheAsignaturas = this.doFilter(res.body ?? [], (row: IAsignatura) => row.activo === Estado.HABILITADO);
        this.cacheAsignaturas.unshift(asignaturaClean);
        this.onAsignaturaSelected(asignaturaClean, true);
      },
    });
    */
    this.serviceReqInscipcion.query({ eagerload: false }).subscribe({
      next: (res: HttpResponse<IRequisitosInscripcion[]>) => {
        let info: AdicionalInfo;
        let selDisabled: boolean;

        const frmAdicionales: FormArray = this.formEntity?.get('adicionales') as FormArray;
        this.cacheReqInscripcion = this.doFilter(res.body ?? [], (row: IRequisitosInscripcion) => row.activo === Estado.HABILITADO);

        this.cacheReqInscripcion.forEach((reqIns: IRequisitosInscripcion) => {
          selDisabled = reqIns.obligatorio! === SiNo.SI;
          frmAdicionales.push(
            this.formBuilder.group({
              selected: [{ value: selDisabled, disabled: selDisabled }, Validators.required],
              total: [''],
            })
          );
        });

        this.cacheReqInscripcionVals = [];
        this.cacheReqInscripcion.forEach((req: IRequisitosInscripcion) => {
          info = new AdicionalInfo();
          info.valNumber = 0;
          info.valTotal = 0;
          info.valSelected = req.obligatorio! === SiNo.SI;
          if (req.tipoRequisito === RequitisoTipo.SELECTIVO) {
            info.valMulti = req.valores?.split(',');

            info.valMultiSel = new Array<string>(info.valMulti!.length);
            info.valMultiVal = new Array<number>(info.valMulti!.length);

            info.valMulti?.forEach((val: string, index: number) => {
              if (val.indexOf(':') >= 0) {
                const values: string[] = val.split(':');
                const amount: number = parseInt(values[1], 10);
                info.valMulti![index] = values[0];
                info.valMultiVal![index] = amount;
              } else {
                info.valMultiVal![index] = 0;
              }
            });
            info.valTotal = req.obligatorio === SiNo.SI ? req.costo! : 0;
          } else if (req.tipoRequisito === RequitisoTipo.NUMERICO) {
            const numberStruct: string[] = req.valores!.split(',');
            let evalNumber: number;

            info.valTotal = 0;
            if (numberStruct.length > 0) {
              evalNumber = Number(numberStruct[0]);
              if (!isNaN(evalNumber)) {
                info.valNumberMin = evalNumber;
                info.valNumber = evalNumber;
              }
            }
            if (numberStruct.length > 1) {
              evalNumber = Number(numberStruct[1]);
              if (!isNaN(evalNumber)) {
                info.valNumberMax = evalNumber;
              }
            }
            if (numberStruct.length > 2) {
              evalNumber = Number(numberStruct[2]);
              if (!isNaN(evalNumber)) {
                info.valNumberInc = evalNumber;
              }
            }
            if (numberStruct.length > 3) {
              evalNumber = Number(numberStruct[3]);
              if (!isNaN(evalNumber)) {
                info.valNumberFct = evalNumber;
              }
            }
            info.valTotal = info.valNumberFct! * info.valNumber * req.costo!;
          }
          this.cacheReqInscripcionVals.push(info);

          if (req.obligatorio === SiNo.SI) {
            this.selReqInscripciones.push(req);
          }
        });
      },
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

  onNavAsignaturaSelected(): void {
    let selSlide = 0;

    selSlide = parseInt(this.selAsignatura.replace('navAsignaturas', ''), 10);
    this.cacheAsignaturas?.some((asig: IAsignatura) => {
      if (asig.id === selSlide) {
        this.onAsignaturaSelected(asig);
        return true;
      }
      return false;
    });
  }

  onAsignaturaSelected(asignatura: IAsignatura, asignFocus = false): void {
    this.cacheAsignaturaReqs = [];
    this.cacheAsignaturaReqsOblig = false;
    this.cacheAsignaturaAdds = [];
    this.cacheAsignaturaHorarios = [];
    this.selHorario = undefined;

    this.documentAsig!.fechaInicio = dayjs();

    if (this.documentAsig) {
      this.documentAsig.asignatura = asignatura;
      if (asignFocus === true) {
        this.selAsignatura = this.navAsignaturas!.activeId = `navAsignaturas${asignatura.id!}`;
      }

      this.cacheAsignaturaHorarios = this.doFilter(asignatura.horarios!, (row: ITeoriaHorarioCatalogo) => row.activo === Estado.HABILITADO);
      this.selHorario = this.cacheAsignaturaHorarios.length > 0 ? this.cacheAsignaturaHorarios[0] : undefined;
      //this.horarioTeoria = String(this.selHorario?.nombre);
      this.cacheAsignaturaReqs = this.doFilter(
        asignatura.asignaturaRequisitos ?? [],
        (row: IAsignaturaRequisito) => row.activo === Estado.HABILITADO
      );
      this.cacheAsignaturaAdds = this.doFilter(
        asignatura.adicionals ?? [],
        (row: IAsignaturaAdiciones) => row.activo === Estado.HABILITADO
      );

      this.cacheAsignaturaReqs.forEach((asigReq: IAsignaturaRequisito) => {
        this.cacheAsignaturaReqsOblig = this.cacheAsignaturaReqsOblig || asigReq.tipo === TipoRequisito.OBLIGATORIO;
      });
      this.cacheAsignaturaReqsOblig = !this.cacheAsignaturaReqsOblig;
    }
  }

  doAsignaturaClearSel(): void {
    this.onAsignaturaSelected(this.cacheAsignaturas![0], true);
  }

  isCheckedAddicional(reqAdicional: IRequisitosInscripcion): boolean {
    let result = false;

    this.selReqInscripciones.some((row: IRequisitosInscripcion) => {
      if (row.id === reqAdicional.id) {
        result = true;
        return result;
      }
      return false;
    });

    return result;
  }

  onCheckedAddicional(event: any, reqAdicional: IRequisitosInscripcion, reqIndex: number): void {
    let result = false;

    if (event.currentTarget.checked) {
      if (reqAdicional.tipoRequisito !== RequitisoTipo.NUMERICO) {
        this.cacheReqInscripcionVals[reqIndex].valTotal! += reqAdicional.costo!;
      }
      result = !!this.selReqInscripciones.some((value: IRequisitosInscripcion) => {
        if (value.id === reqAdicional.id) {
          result = true;
        }
        return result;
      });
      if (!result) {
        this.selReqInscripciones.push(reqAdicional);
      }
    } else {
      let resultIndex = -1;
      if (reqAdicional.tipoRequisito !== RequitisoTipo.NUMERICO) {
        this.cacheReqInscripcionVals[reqIndex].valTotal! -= reqAdicional.costo!;
      }
      result = !!this.selReqInscripciones.some((value: IRequisitosInscripcion, index: number) => {
        if (value.id === reqAdicional.id) {
          result = true;
          resultIndex = index;
        }
        return result;
      });
      if (result) {
        this.selReqInscripciones.splice(resultIndex, 1);
      }
    }
  }

  onCheckReqAddSelectivo(event: any, reqAdicional: IRequisitosInscripcion, reqIndex: number, reqValIndex: number): void {
    const info = this.cacheReqInscripcionVals[reqIndex];
    let total = 0;

    if (event.currentTarget.checked) {
      info.valMultiSel![reqValIndex] = info.valMulti![reqValIndex];

      this.onCheckedAddicional({ currentTarget: { checked: true } }, reqAdicional, reqIndex); // TODO
    } else {
      info.valMultiSel![reqValIndex] = '';
    }

    this.selReqInscripciones.forEach((reqInscipcion: IRequisitosInscripcion) => {
      if (reqAdicional.id === reqInscipcion.id) {
        total += reqAdicional.costo!;
      }
    });

    info.valMultiSel?.forEach((value: string, ind: number) => {
      if (value) {
        total += info.valMultiVal![ind];
      }
    });
    info.valTotal = total;
  }

  onNumberReqAddSelectivo(event: any, reqAdicional: IRequisitosInscripcion, reqIndex: number): void {
    const info = this.cacheReqInscripcionVals[reqIndex];
    info.valNumber = event.currentTarget.valueAsNumber;

    info.valTotal = Math.floor(info.valNumber! * info.valNumberFct! * reqAdicional.costo!);
    if (info.valNumber! > 0) {
      this.onCheckedAddicional({ currentTarget: { checked: true } }, reqAdicional, reqIndex);
    }
  }

  getTotalAddicional(): number {
    let total = 0;
    let amount = 0;

    this.selReqInscripciones.forEach((req: IRequisitosInscripcion) => {
      this.cacheReqInscripcion!.some((reqIns: IRequisitosInscripcion, index: number) => {
        if (req.id === reqIns.id) {
          amount = Number(this.cacheReqInscripcionVals[index].valTotal!);
          total += amount;
          return true;
        }
        return false;
      });
    });
    this.subTotalAdicional = String(total);
    return total;
  }

  getTotalPrev(): number {
    let total = 0;
    let asignaturaCosto = 0;

    if (this.documentAsig?.asignatura?.costo) {
      asignaturaCosto = this.documentAsig.asignatura.costo;
    }

    total = asignaturaCosto + this.getTotalAddicional() - this.documentDescuento.monto!;
    return total;
  }

  getTotalDoc(): number {
    let total = 0;

    total = this.getTotalPrev() - (this.documentPago.monto ?? 0);
    return total;
  }

  onUploadDocuments(event: any, reqAdicional: IAsignaturaRequisito): void {
    let file: File;
    const insAdicional = new InscripcionAsignaturaRequisito();

    if (event.target.files.length > 0) {
      file = event.target.files[0];

      insAdicional.documento = file.name;
      insAdicional.imagenContentType = file.type;
      insAdicional.asignaturaRequisito = reqAdicional;

      const fr = new FileReader();
      fr.onload = (e: ProgressEvent<FileReader>) => {
        if (typeof e.target?.result === 'string') {
          const base64Data: string = e.target.result.substr(e.target.result.indexOf('base64,') + 'base64,'.length);
          insAdicional.imagen = base64Data;
        }
      };
      fr.readAsDataURL(file);

      this.documentDocuments!.set(reqAdicional.id!, insAdicional);
    } else {
      if (this.documentDocuments?.has(reqAdicional.id!)) {
        this.documentDocuments.delete(reqAdicional.id!);
      }
    }
  }

  isCheckedUpload(asigRequisito: IAsignaturaRequisito): boolean {
    let result = false;

    result = !!this.documentDocuments?.has(asigRequisito.id!);
    return result;
  }

  getUploadName(reqAdicional: IAsignaturaRequisito): string {
    let filename = '';

    if (this.isCheckedUpload(reqAdicional)) {
      filename = this.documentDocuments!.get(reqAdicional.id!)!.documento!;
      filename = `[${filename}]`;
    }

    return filename;
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
    /*
    this.servicePersona.query(query).subscribe({
      next: (res: HttpResponse<IPersona[]>) => {
        if (res.body && res.body.length > 0) {
          this.doPersonaSel(res.body[0]);
        }
      },
    });*/
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

  doSave(): void {
    let persona: IPersona = {};
    let asigReqNoSel: IAsignaturaRequisito | undefined;

    if (this.selPersona.emailPersonal && !this.formEntity?.get('personaEmail')!.valid) {
      DialogoInfoComponent.doShow(this.modalService, 'danger text-white', 'Registro Inscripcion', `No se definio un email valido.`);
      return;
    }

    this.cacheAsignaturaReqs.some((asigReq: IAsignaturaRequisito) => {
      if (asigReq.tipo === TipoRequisito.OBLIGATORIO) {
        if (!this.documentDocuments?.has(asigReq.id!)) {
          asigReqNoSel = asigReq;
          return true;
        }
      }
      return '';
    });

    if (asigReqNoSel) {
      DialogoInfoComponent.doShow(
        this.modalService,
        'danger text-white',
        'Registro Inscripcion',
        `No se selecciono un adjunto obligatorio [${asigReqNoSel.nombre!}].`
      );
      return;
    }
    if (this.documentAsig!.asignatura!.id! > 0 && !this.selHorario) {
      DialogoInfoComponent.doShow(this.modalService, 'danger text-white', 'Registro Inscripcion', `No se selecciono un horario.`);
      return;
    }

    const modalRef: NgbModalRef = DialogoConfirmarComponent.doShow(
      this.modalService,
      'Registro Inscripcion',
      '¿Desea procesar la transaccion?'
    );
    modalRef.closed.subscribe({
      next: (result: boolean) => {
        if (!result) {
          return;
        }

        persona = {
          id: this.selPersona.id,
          emailPersonal: this.selPersona.emailPersonal,
          telefonoParticular: this.selPersona.telefonoParticular,
        };
        this.servicePersona.partialUpdate(persona).subscribe({
          next: (respPersona: HttpResponse<IPersona>) => {
            if (!this.selAlumno.id) {
              const now: dayjs.Dayjs = dayjs();

              this.selAlumno.estado = AlumnoEstado.INSCRITO;
              this.selAlumno.tipo = AlumnoTipo.REGULAR;
              this.selAlumno.persona = respPersona.body!;

              let codigo = `${now.month() + 1}`.padStart(2, '0');
              codigo = `${now.year()}`.slice(-2) + codigo;
              this.serviceAlumno.query({ 'codigo.contains': codigo }).subscribe({
                next: (resp: HttpResponse<IAlumno[]>) => {
                  let nextId = 0;
                  if (resp.body!.length > 0) {
                    let alumnoCod = resp.body![resp.body!.length - 1].codigo!;
                    alumnoCod = alumnoCod.slice(-3);

                    nextId = parseInt(alumnoCod, 10);
                    nextId++;
                  } else {
                    nextId = 1;
                  }

                  const codNext = `${nextId}`.padStart(3, '0');
                  this.selAlumno.codigo = `${codigo}${codNext}`;
                  this.selAlumno.id = undefined;
                  this.serviceAlumno.create(this.selAlumno).subscribe({
                    next: (respAlumno: HttpResponse<IAlumno>) => {
                      this.selAlumno = respAlumno.body!;
                      this.doSaveProceedAlumnoRemote();
                    },
                  });
                },
              });
            } else {
              this.doSaveProceedAlumnoRemote();
            }
          },
        });
      },
    });
  }

  doSaveProceedAlumnoRemote(): void {
    let insAdicional: IInscripcionAdicional;
    let insAsigReq: IInscripcionAsignaturaRequisito;
    const insAdicionales: IInscripcionAdicional[] = [];
    const insAsigRequisito: IInscripcionAsignaturaRequisito[] = [];
    let inscripcion: IInscripcion;
    const totalDoc = this.getTotalDoc();

    inscripcion = new Inscripcion();
    inscripcion.alumno = this.selAlumno;
    inscripcion.fecha = dayjs();
    inscripcion.estado = totalDoc === 0 ? InscripcionEstado.CANCELADO : InscripcionEstado.EN_PAGOS;
    inscripcion.costoTotal = totalDoc;
    inscripcion.numeroDocumento = parseInt(this.document!.codigo!, 10);
    const serialNum = `${inscripcion.numeroDocumento}`.padStart(5, '0');
    const sucursalId = `${this.selSucursalId! % 100}`.padStart(2, '0');
    let serieNro = '';
    this.cacheSucursalSeriesSerie.some((serie: ISucursalSerie) => {
      if (serie.id === this.selSucursalSerieId) {
        serieNro = `${serie.id! % 100}`.padStart(2, '0');
        return true;
      }

      return false;
    });

    this.inscriEstado = String(inscripcion.estado);

    inscripcion.codigo = `${sucursalId}${serieNro}${serialNum}`;

    inscripcion = this.serviceCommon.convertDateFromClientFieldFecha(inscripcion);

    this.documentDocuments?.forEach((val: IInscripcionAsignaturaRequisito) => {
      insAsigReq = new InscripcionAsignaturaRequisito();
      insAsigReq.documento = val.documento;
      insAsigReq.imagenContentType = val.imagenContentType;
      insAsigReq.imagen = val.imagen;
      insAsigReq.asignaturaRequisito = val.asignaturaRequisito;
      insAsigReq.descripcion = val.asignaturaRequisito?.nombre;

      insAsigRequisito.push(insAsigReq);
    });
    this.selReqInscripciones.forEach((value: IRequisitosInscripcion) => {
      let selIndex = -1;
      insAdicional = new InscripcionAdicional();
      insAdicional.inscripcionRequisito = value;

      this.cacheReqInscripcion?.some((valueFE: IRequisitosInscripcion, index: number) => {
        if (valueFE.id === value.id) {
          selIndex = index;
        }

        return selIndex >= 0;
      });

      if (value.tipoRequisito === RequitisoTipo.SELECTIVO) {
        insAdicional.cantidad = '';
        this.cacheReqInscripcionVals[selIndex].valMultiSel?.forEach((valSel: string) => {
          if (valSel) {
            if (insAdicional.cantidad) {
              insAdicional.cantidad += ',';
            }
            insAdicional.cantidad += valSel;
          }
        });
        insAdicional.costo = this.cacheReqInscripcionVals[selIndex].valTotal;
      } else if (value.tipoRequisito === RequitisoTipo.NUMERICO) {
        insAdicional.cantidad = `${this.cacheReqInscripcionVals[selIndex].valNumber!}`;
        insAdicional.costo = this.cacheReqInscripcionVals[selIndex].valTotal;
      } else {
        insAdicional.cantidad = '1';
        insAdicional.costo = value.costo;
      }

      insAdicionales.push(insAdicional);
    });

    if (this.documentAsig!.asignatura!.id! > 0) {
      let insDetalle = new InscripcionDetalle();

      insDetalle.asignatura = this.documentAsig?.asignatura;
      insDetalle.codigo = insDetalle.asignatura?.nombre;
      if (this.documentAsig?.fechaInicio) {
        insDetalle.fechaInicio = dayjs(this.documentAsig.fechaInicio);
      }
      this.cacheAsignaturaHorarios.forEach((horario: ITeoriaHorarioCatalogo) => {
        this.horarioTeoria = String(this.selHorario?.nombre);
        if (this.selHorario && this.selHorario.id === horario.id) {
          insDetalle.horario = horario;
        }
      });
      insDetalle.inscripcionAsignaturaRequisitos = insAsigRequisito;

      insDetalle = this.serviceCommon.convertDateFromClientInsDetalle(insDetalle);
      inscripcion.inscripcionDetalles = [insDetalle];
    } else {
      inscripcion.inscripcionDetalles = [];
    }

    inscripcion.inscripcionAdicionals = insAdicionales;

    if (this.documentDescuento.monto! > 0 && this.selAdminJwt) {
      inscripcion.insDescuento = this.documentDescuento;
    }

    const inscripcionPago: IInscripcionPago = new InscripcionPago();
    inscripcionPago.fecha = inscripcion.fecha;
    inscripcionPago.formaPago = InscripcionFormaPago.EFECTIVO;
    inscripcionPago.monto = this.documentPago.monto;
    inscripcionPago.numeroDocumento = inscripcion.numeroDocumento;
    this.cacheSucursalSeries.some((serie: ISucursalSerie) => {
      if (serie.id === this.selSucursalSerieId) {
        inscripcionPago.serie = serie;
        this.serieDoc = String(serie.serie);
        return true;
      }
      return false;
    });

    inscripcion.inscripcionPagos = [inscripcionPago];

    this.serviceCommon.doSaveInscripcion(inscripcion).subscribe({
      next: (resp: HttpResponse<IInscripcion>) => {
        const sucSerie: ISucursalSerie = {};
        sucSerie.id = this.selSucursalSerieId;
        sucSerie.numeroUltimo = resp.body!.numeroDocumento;
        this.serviceSucursalSerie.partialUpdate(sucSerie).subscribe(() => {
          const modalRef = DialogoInfoComponent.doShow(
            this.modalService,
            'success text-white',
            this.title,
            `Proceso registrado satisfactoriamente. La persona fue registrada con el CODIGO de ALUMNO: ${this.selAlumno.codigo!}.`
          );

          if (this.reporteInscripcion === 'Si') {
            this.generatePdf();
          }

          modalRef.hidden.subscribe(() => {
            window.location.reload();
          });
        });
      },

      error: (err: any) => {
        let msg: string = err.error?.detail;

        if (!msg) {
          msg = err.message;
        }

        DialogoInfoComponent.doShow(this.modalService, 'danger text-white', this.title, msg);
      },
    });
  }

  get formArrayAdicionales(): FormArray {
    const formArray: FormArray = this.formEntity?.controls.adicionales as FormArray;
    return formArray;
  }

  generatePdf(): void {
    const documentDefinition = this.getDocumentDefinition();
    pdfMake.createPdf(documentDefinition).open();
  }

  getDocumentDefinition(): any {
    //sessionStorage.setItem('selPersona', JSON.stringify(this.selPersona));
    let soles = '';
    let raya = '';
    let curso = '';
    let costoCurso = '';
    let fechaNacimiento = '';
    let nacionalidad = '';
    let email = '';
    let celular = '';
    let celular2 = '';
    let domicilio = '';
    let distrito = '';
    let ocupacion = '';
    let genero = '';
    let estadoCivil = '';

    let usuario = '';
    let alumno = '';

    usuario = String(this.account?.firstName) + ' ' + String(this.account?.lastName);

    alumno =
      String(this.selPersona.nombres) + ' ' + String(this.selPersona.apellidoPaterno) + ' ' + String(this.selPersona.apellidoMaterno);

    if (String(this.documentAsig?.asignatura?.nombre) !== 'null' && String(this.documentAsig?.asignatura?.nombre).trim() !== 'undefined') {
      curso = String(this.documentAsig?.asignatura?.nombre);
    }
    if (String(this.documentAsig?.asignatura?.costo) !== '0') {
      costoCurso = String(this.documentAsig?.asignatura?.costo);
      soles = 'S/. ';
    }
    if (String(this.selPersona.fechaNacimiento) !== 'null') {
      fechaNacimiento = String(this.selPersona.fechaNacimiento);
    }
    if (String(this.selPersona.nacionalidad) !== 'null') {
      nacionalidad = String(this.selPersona.nacionalidad);
    }
    if (String(this.selPersona.emailPersonal) !== 'null') {
      email = String(this.selPersona.emailPersonal);
    }
    if (String(this.selPersona.telefonoParticular) !== 'null') {
      celular = String(this.selPersona.telefonoParticular);
    }
    if (String(this.selPersona.telefonoParticular1) !== 'null') {
      celular2 = String(this.selPersona.telefonoParticular1);
    }
    if (String(this.selPersona.direccion) !== 'null') {
      domicilio = String(this.selPersona.direccion);
    }
    if (String(this.selPersona.distrito?.distrito) !== 'null' && String(this.selPersona.distrito?.distrito).trim() !== 'undefined') {
      distrito = String(this.selPersona.distrito?.distrito);
      raya = '   - ';
    }
    if (String(this.selAlumno.ocupacion) !== 'null' && String(this.selAlumno.ocupacion).trim() !== 'undefined') {
      ocupacion = String(this.selAlumno.ocupacion);
    }
    if (String(this.selPersona.genero) !== 'null') {
      genero = String(this.selPersona.genero);
    }
    if (String(this.selPersona.estadoCivil) !== 'null') {
      estadoCivil = String(this.selPersona.estadoCivil);
    }

    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    return {
      content: [
        {
          toc: {
            title: { text: 'ESCUELA DE CONDUCTORES JORGE CHAVEZ', style: 'empresa' },
          },
        },
        {
          style: 'codalum',
          table: {
            widths: [50],
            body: [['CÓDIGO\n' + String(this.selAlumno.codigo)]],
          },
        },
        {
          text: 'FICHA DE INSCRIPCIÓN',
          style: 'header',
          tocItem: false,
        },
        { text: [{ text: 'I. DATOS DEL ALUMNO', style: 'titulo' }] },
        {
          margin: [0, 5, 0, 5],
          table: {
            headerRows: 0,
            widths: [130, 160, 80, 100],
            body: [
              [
                'Nombre Completo : ',
                {
                  colSpan: 3,
                  text:
                    String(this.selPersona.nombres) +
                    ' ' +
                    String(this.selPersona.apellidoPaterno) +
                    ' ' +
                    String(this.selPersona.apellidoMaterno),
                },
                '',
                '',
              ],
              ['Fecha de Nacimiento : ', String(fechaNacimiento), 'Documento : ', 'D.N.I'],
              ['Nacionalidad : ', String(nacionalidad), 'Número : ', String(this.selPersona.numeroDocumento)],
              ['Email : ', String(email), 'Ocupación : ', String(ocupacion)],
              ['Celular : ', String(celular), 'Genero : ', String(genero)],
              ['Celular 2 : ', String(celular2), 'Estado Civil : ', String(estadoCivil)],
              ['Domicilio : ', { colSpan: 3, text: String(domicilio) + raya + String(distrito) }, '', ''],
            ],
          },
          layout: 'lightHorizontalLines',
        },
        {
          margin: [0, 5, 0, 5],
          table: {
            widths: [280, 200],
            body: [
              [
                { text: 'II. CURSO', style: 'tituloc' },
                { text: 'ESTADO: ' + String(this.inscriEstado), style: 'tituloce' },
              ],
            ],
          },
          layout: 'noBorders',
        },
        {
          margin: [0, 5, 0, 5],
          table: {
            headerRows: 0,
            widths: [90, 70, 90, 220],
            body: [
              ['Nombre: ', { colSpan: 3, text: curso }, '', ''],
              [
                'Inicio de Curso : ',
                String(this.documentAsig?.fechaInicio?.format('DD/MM/YYYY')),
                'Horario Teoría : ',
                String(this.horarioTeoria),
              ],
              ['Costo de Curso : ', soles + costoCurso, 'Clases Extras : ', 'S/. ' + String(parseFloat(this.subTotalAdicional).toFixed(2))],
              [
                'Pago Inicial : ',
                'S/. ' + String(parseFloat(String(this.documentPago.monto)).toFixed(2)),
                'Saldo : ',
                'S/. ' + String(parseFloat(String(this.getTotalDoc())).toFixed(2)),
              ],
              ['Documento : ', String(this.tipoDoc), 'Serie Número : ', this.serieDoc + ' - ' + '000' + String(this.document?.codigo)],
            ],
          },
          layout: 'lightHorizontalLines',
        },
        { text: 'III. REGLAMENTO', style: 'titulo' },
        { text: '1. Introducción', bold: 'true', fontSize: 12, margin: [0, 5, 0, 0] },
        {
          style: 'cuerpo',
          ul: [
            'Hemos preparado el presente reglamento para proporcionarles una idea clar respecto de nuestra organización, así como también las normas y procedimientos que observaremos durante el desarrollo de su curso, por lo que agradeceremos dedicar a su lectura algo de su valioso tiempo de modo que podemos servirlo mejor. La escuela de conductores Integrales Jorge Chavez, agradece su preferencia y espera estar a la altura de sus expectativas brindandole el mejor servicio',
          ],
        },
        { text: '2. Generalidades', bold: 'true', fontSize: 12 },
        {
          style: 'cuerpo',
          ul: [
            'En el momento de matricularse cada participante deberá presentar su DNI (original y copia) y llenar una ficha de inscripción en el cual detallarán todos los datos solicitados, los mismos que tendrán carácter "Confidencial" y serán utilizados fundamentalmente para una adecuada comunicación entre el participante y la institución.',
          ],
        },
        { text: '3. Condiciones de los retiros(Temporal o Definitivo)', bold: 'true', fontSize: 12 },
        {
          style: 'cuerpo',
          type: 'lower-alpha',
          ol: [
            'El participante podrá retirarse temporal o definitivamente del curso que se encuentre matriculado presentando una solicitud dirigido a la oficina de atención al cliente, indicando el motivo del retiro. El retiro temporal podrá ser como máximo por 2 meses contados a partir de  la fecha en que presento la solicitud, cabe señalar que al retomar el curso solo podrá reprogramar sus horas pendientes de prácticas mas no las que por algún motivo perdio.',
            'El trámite de retiro temporal será aceptado sólo si el participante a cancelado el integro del curso elegido.',
            'Si el alumno dejara de asistir sin dar aviso excediendo los 30 días de inasistencia perderá la opción de tramitar su posterior reingreso sin lugar a reclamo.',
            'Si el alumno desea retirarse del cruso elegido en forma definitiva, deberá tener en cuenta lo siguiente:',
            {
              style: 'cuerpo',
              ol: [
                'El dinero NO SERÁ DEVUELTO POR NINGUN MOTIVO.',
                'En caso de accidente o problemas de fuerza mayor (defunción de un familiar directo), el alumno tendrá que presentar un justificante adjuntando los documentos requeridos por la institución y is desea, tendrá la opción de traspasar el curso restante a un familiar o amistad.',
              ],
            },
          ],
        },
        { text: String(new Intl.DateTimeFormat('es-MX', options).format(new Date(this.fechaActual))), style: 'fecha' },
        {
          style: 'firma',
          table: {
            widths: [250, 250],
            body: [
              [
                { text: '_____________________________', style: 'firmacol' },
                { text: '_____________________________', style: 'firmacol' },
              ],
              [
                { text: 'Recepcionista', style: 'firmacol1' },
                { text: 'Alumno', style: 'firmacol1' },
              ],
              [
                { text: usuario, style: 'firmacol1' },
                { text: alumno, style: 'firmacol1' },
              ],
            ],
          },
          layout: 'noBorders',
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
          decoration: 'underline',
          margin: [0, 0, 0, 20],
        },
        subHeader: {
          fontSize: 14,
          bold: false,
          alignment: 'center',
        },
        empresa: {
          fontSize: 8,
          bold: false,
          alignment: 'left',
          margin: [0, -20, 0, 20],
        },
        codalum: {
          fontSize: 11,
          bold: true,
          alignment: 'left',
          margin: [0, -8, 0, -30],
          border: [true, true, true, true],
        },
        titulo: {
          fontSize: 16,
          bold: true,
          decoration: 'underline',
        },
        tituloc: {
          fontSize: 16,
          bold: true,
          decoration: 'underline',
        },
        tituloce: {
          fontSize: 16,
          bold: true,
          border: [true, true, true, true],
        },
        datos: {
          fontSize: 14,
          bold: false,
        },
        fecha: {
          fontSize: 12,
          bold: true,
          margin: [0, 10, 0, 0],
        },
        jobTitle: {
          fontSize: 14,
          bold: true,
          italics: true,
        },
        cuerpo: {
          alignment: 'justify',
          fontSize: 10,
        },
        firma: {
          fontSize: 12,
          bold: true,
          margin: [0, 40, 0, 0],
          border: [false, false, false, false],
        },
        firmacol: {
          fontSize: 12,
          bold: true,
          alignment: 'center',
          margin: [0, -5, 0, 0],
        },
        firmacol1: {
          fontSize: 10,
          bold: false,
          alignment: 'center',
          margin: [0, -5, 0, 0],
        },
      },
    };
  }
}
