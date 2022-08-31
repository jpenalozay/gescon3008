import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IProgramacion } from 'app/entities/programacion/programacion.model';
import { Login } from 'app/login/login.model';
import { map, Observable } from 'rxjs';
import { ApplicationConfigService } from '../config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';

import { DATE_FORMAT } from 'app/config/input.constants';
import { EntityResponseType } from 'app/entities/programacion/service/programacion.service';
import { EntityResponseType as InsEntityResponseType } from 'app/entities/inscripcion/service/inscripcion.service';
import { EntityResponseType as AlumnoEntityResponseType } from 'app/entities/alumno/service/alumno.service';
import { EntityArrayResponseType as HorarioEntityArrayResponseType } from 'app/entities/horario/service/horario.service';
import dayjs from 'dayjs/esm';
import { IPersona } from 'app/entities/persona/persona.model';
import { IInscripcion } from 'app/entities/inscripcion/inscripcion.model';
import { IInscripcionDetalle } from 'app/entities/inscripcion-detalle/inscripcion-detalle.model';
import { IProgramacionDeshabilitacion } from 'app/entities/programacion-deshabilitacion/programacion-deshabilitacion.model';
import { EntityResponseType as ProgDeshabEntityResponseType } from 'app/entities/programacion-deshabilitacion/service/programacion-deshabilitacion.service';
import { IAlumno } from 'app/entities/alumno/alumno.model';
import { IHorario } from 'app/entities/horario/horario.model';

type JwtToken = {
  id_token: string;
};

interface IFechaField {
  fecha?: dayjs.Dayjs;
}

export interface INumberStringPair {
  key?: number;
  value?: string;
}

export class NumberStringPair implements INumberStringPair {
  constructor(public key?: number, public value?: string) {}
}

@Injectable({
  providedIn: 'root',
})
export class CommonValidateService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api');

  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  check(credentials: Login): Observable<number> {
    const url = this.applicationConfigService.getEndpointFor('api/authenticate/extra');

    return this.http.post<number>(url, credentials);
  }

  doTest(): Observable<ArrayBuffer> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    const url = this.applicationConfigService.getEndpointFor('api/programacions/extra/test');

    return this.http.get<ArrayBuffer>(url, { headers });
  }

  getProgramacionInstructorLastId(): Observable<number> {
    const url = this.applicationConfigService.getEndpointFor('api/programacions/extra/instructor/last');
    return this.http.get<number>(url);
  }

  doSaveProgramacion(programacion: IProgramacion): Observable<EntityResponseType> {
    const url = this.applicationConfigService.getEndpointFor('api/programacions/extra');
    const copy = this.convertDateFromClient(programacion);
    return this.http
      .post<IProgramacion>(url, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  doSaveProgramacionDeshabilitacion(progDeshabilitacion: IProgramacionDeshabilitacion): Observable<ProgDeshabEntityResponseType> {
    const url = this.applicationConfigService.getEndpointFor('api/programacion-deshabilitacions/extra');
    return this.http.post<IProgramacionDeshabilitacion>(url, progDeshabilitacion, { observe: 'response' });
  }

  doDeleteProgramacion(programacionId: number): Observable<HttpResponse<{}>> {
    const url = this.applicationConfigService.getEndpointFor(`api/programacions/extra/${programacionId}`);
    return this.http.delete(url, { observe: 'response' });
  }

  doDeleteProgramacionDeshabilitacion(progDeshabilitacionId: number): Observable<HttpResponse<{}>> {
    const url = this.applicationConfigService.getEndpointFor(`api/programacion-deshabilitacions/extra/${progDeshabilitacionId}`);
    return this.http.delete(url, { observe: 'response' });
  }

  doDeleteHorarioAlumno(horarioId: number): Observable<HttpResponse<{}>> {
    const url = this.applicationConfigService.getEndpointFor(`api/horarios/extra/alumno/${horarioId}`);
    return this.http.delete(url, { observe: 'response' });
  }

  doSaveInscripcion(inscripcion: IInscripcion): Observable<InsEntityResponseType> {
    const url = this.applicationConfigService.getEndpointFor('api/inscripcions/extra');
    return this.http.post<IInscripcion>(url, inscripcion, { observe: 'response' });
  }

  doSaveHorarios(horarios: IHorario[]): Observable<HorarioEntityArrayResponseType> {
    const url = this.applicationConfigService.getEndpointFor('api/horarios/extra/alumno');
    return this.http.post<IHorario[]>(url, horarios, { observe: 'response' });
  }

  doFindPersona(dniNro: string): Observable<EntityResponseType> {
    const url = this.applicationConfigService.getEndpointFor(`api/personas/dni/${dniNro}`);

    return this.http.get<IPersona>(url, { observe: 'response' }).pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  getAlumnoFullLoad(alumnoCodigo: string): Observable<AlumnoEntityResponseType> {
    const url = this.applicationConfigService.getEndpointFor(`api/alumnos/extra/${alumnoCodigo}`);

    return this.http.get<IAlumno>(url, { observe: 'response' });
  }

  queryProgDeshabilitacionesCount(req?: any): Observable<HttpResponse<number>> {
    const url = this.applicationConfigService.getEndpointFor('api/programacion-deshabilitacions/count');
    const options = createRequestOption(req);
    return this.http.get<number>(url, { params: options, observe: 'response' });
  }

  doFindAlumnos(filterData: string): Observable<HttpResponse<INumberStringPair[]>> {
    filterData = encodeURIComponent(filterData);
    const url = this.applicationConfigService.getEndpointFor(`api/alumnos/find`);

    const options = {
      filter: filterData,
    };
    return this.http.get<INumberStringPair[]>(url, { params: options, observe: 'response' });
  }

  doInstructoSimple(): Observable<HttpResponse<INumberStringPair[]>> {
    const url = this.applicationConfigService.getEndpointFor(`api/profesors/extra`);

    return this.http.get<INumberStringPair[]>(url, { observe: 'response' });
  }

  doAutorities(username: string): Observable<HttpResponse<string[]>> {
    const url = this.applicationConfigService.getEndpointFor(`api/users/extra/autorities/${username}`);

    return this.http.get<string[]>(url, { observe: 'response' });
  }

  public convertDateFromClientInsDetalle(inscripcionDetalle: IInscripcionDetalle): IInscripcionDetalle {
    return Object.assign({}, inscripcionDetalle, {
      fechaInicio: inscripcionDetalle.fechaInicio?.isValid() ? inscripcionDetalle.fechaInicio.format(DATE_FORMAT) : undefined,
    });
  }

  public convertDateFromClientFieldFecha<T extends IFechaField>(inscripcion: T): T {
    return Object.assign({}, inscripcion, {
      fecha: inscripcion.fecha?.isValid() ? inscripcion.fecha.toJSON() : undefined,
    });
  }

  protected convertDateFromClient(programacion: IProgramacion): IProgramacion {
    return Object.assign({}, programacion, {
      fechaInicio: programacion.fechaInicio?.isValid() ? programacion.fechaInicio.format(DATE_FORMAT) : undefined,
      fechaFin: programacion.fechaFin?.isValid() ? programacion.fechaFin.format(DATE_FORMAT) : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.fechaInicio = res.body.fechaInicio ? dayjs(res.body.fechaInicio) : undefined;
      res.body.fechaFin = res.body.fechaFin ? dayjs(res.body.fechaFin) : undefined;
    }
    return res;
  }
}
