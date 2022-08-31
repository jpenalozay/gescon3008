package com.creinfor.service.ext;

import com.creinfor.domain.Alumno;
import com.creinfor.domain.AlumnoClases;
import com.creinfor.domain.Asignatura;
import com.creinfor.domain.AsignaturaRequisito;
import com.creinfor.domain.Automovil;
import com.creinfor.domain.Dia;
import com.creinfor.domain.Fecha;
import com.creinfor.domain.Horario;
import com.creinfor.domain.HorarioCatalogo;
import com.creinfor.domain.HorarioDeshabilitacion;
import com.creinfor.domain.Inscripcion;
import com.creinfor.domain.InscripcionAdicional;
import com.creinfor.domain.InscripcionAsignaturaRequisito;
import com.creinfor.domain.InscripcionDescuento;
import com.creinfor.domain.InscripcionDetalle;
import com.creinfor.domain.InscripcionPago;
import com.creinfor.domain.LugarSalida;
import com.creinfor.domain.Persona;
import com.creinfor.domain.Profesor;
import com.creinfor.domain.Programacion;
import com.creinfor.domain.ProgramacionDeshabilitacion;
import com.creinfor.domain.RequisitosInscripcion;
import com.creinfor.domain.SucursalSerie;
import com.creinfor.domain.TeoriaHorarioCatalogo;
import com.creinfor.domain.enumeration.Estado;
import com.creinfor.domain.enumeration.HorarioTipo;
import com.creinfor.domain.enumeration.ProgramacionEstado;
import com.creinfor.domain.enumeration.TipoDocumentoPersona;
import com.creinfor.repository.AlumnoClasesRepository;
import com.creinfor.repository.AlumnoRepository;
import com.creinfor.repository.AsignaturaRepository;
import com.creinfor.repository.AsignaturaRequisitoRepository;
import com.creinfor.repository.AutomovilRepository;
import com.creinfor.repository.DiaRepository;
import com.creinfor.repository.ExtraProgramacionRepository;
import com.creinfor.repository.FechaRepository;
import com.creinfor.repository.HorarioCatalogoRepository;
import com.creinfor.repository.HorarioDeshabilitacionRepository;
import com.creinfor.repository.HorarioRepository;
import com.creinfor.repository.InscripcionAdicionalRepository;
import com.creinfor.repository.InscripcionAsignaturaRequisitoRepository;
import com.creinfor.repository.InscripcionDescuentoRepository;
import com.creinfor.repository.InscripcionDetalleRepository;
import com.creinfor.repository.InscripcionPagoRepository;
import com.creinfor.repository.InscripcionRepository;
import com.creinfor.repository.LugarSalidaRepository;
import com.creinfor.repository.PersonaRepository;
import com.creinfor.repository.ProfesorRepository;
import com.creinfor.repository.ProgramacionDeshabilitacionRepository;
import com.creinfor.repository.ProgramacionRepository;
import com.creinfor.repository.RequisitosInscripcionRepository;
import com.creinfor.repository.SucursalSerieRepository;
import com.creinfor.repository.TeoriaHorarioCatalogoRepository;
import com.creinfor.service.FechaQueryService;
import com.creinfor.service.HorarioQueryService;
import com.creinfor.service.PersonaQueryService;
import com.creinfor.service.criteria.FechaCriteria;
import com.creinfor.service.criteria.HorarioCriteria;
import com.creinfor.service.criteria.HorarioCriteria.EstadoFilter;
import com.creinfor.service.criteria.PersonaCriteria;
import com.creinfor.service.criteria.PersonaCriteria.TipoDocumentoPersonaFilter;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.apache.commons.lang3.math.NumberUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.filter.LocalDateFilter;
import tech.jhipster.service.filter.LongFilter;
import tech.jhipster.service.filter.StringFilter;

@Service
public class ExtraTransactionsService {

    private final Logger log = LoggerFactory.getLogger(ExtraTransactionsService.class);

    private final AutomovilRepository repoAutomovil;
    private final ProfesorRepository repoProfesor;
    private final HorarioCatalogoRepository repoHorarioCat;
    private final HorarioRepository repoHorario;
    private final HorarioQueryService servHorario;
    private final DiaRepository repoDia;
    private final FechaRepository repoFecha;
    private final FechaQueryService servFecha;
    private final ProgramacionRepository repoProgramacion;
    private final PersonaRepository repoPersona;
    private final PersonaQueryService servPersona;
    private final AlumnoRepository repoAlumno;
    private final AlumnoClasesRepository repoAlumnoClases;
    private final InscripcionRepository repoInscripcion;
    private final AsignaturaRepository repoAsignatura;
    private final TeoriaHorarioCatalogoRepository repoTeoriaHorario;
    private final InscripcionDetalleRepository repoInsDetalle;
    private final AsignaturaRequisitoRepository repoAsigRequisito;
    private final InscripcionAsignaturaRequisitoRepository repoInsAsigRequisito;
    private final RequisitosInscripcionRepository repoReqInscripcion;
    private final InscripcionAdicionalRepository repoInsAdicional;
    private final InscripcionPagoRepository repoInsPago;
    private final InscripcionDescuentoRepository repoInsDescuento;
    private final SucursalSerieRepository repoSucSerie;
    private final ProgramacionDeshabilitacionRepository repoProgDeshabilitacion;
    private final HorarioDeshabilitacionRepository repoHorarioDeshab;
    private final ExtraProgramacionRepository repoExtra;
    private final LugarSalidaRepository repoLugarSalida;

    public ExtraTransactionsService(
        AutomovilRepository repoAutomovil,
        ProfesorRepository repoProfesor,
        HorarioCatalogoRepository repoHorarioCat,
        HorarioRepository repoHorario,
        HorarioQueryService servHorario,
        DiaRepository repoDia,
        FechaRepository repoFecha,
        FechaQueryService servFecha,
        ProgramacionRepository repoProgramacion,
        PersonaQueryService servPersona,
        PersonaRepository repoPersona,
        AlumnoRepository repoAlumno,
        AlumnoClasesRepository repoAlumnoClases,
        InscripcionRepository repoInscripcion,
        AsignaturaRepository repoAsignatura,
        TeoriaHorarioCatalogoRepository repoTeoriaHorario,
        InscripcionDetalleRepository repoInsDetalle,
        AsignaturaRequisitoRepository repoAsigRequisito,
        InscripcionAsignaturaRequisitoRepository repoInsAsigRequisito,
        RequisitosInscripcionRepository repoReqInscripcion,
        InscripcionAdicionalRepository repoInsAdicional,
        InscripcionPagoRepository repoInsPago,
        InscripcionDescuentoRepository repoInsDescuento,
        SucursalSerieRepository repoSucSerie,
        ProgramacionDeshabilitacionRepository repoProgDeshabilitacion,
        HorarioDeshabilitacionRepository repoHorarioDeshab,
        ExtraProgramacionRepository repoExtra,
        LugarSalidaRepository repoLugarSalida
    ) {
        this.repoAutomovil = repoAutomovil;
        this.repoProfesor = repoProfesor;
        this.repoHorarioCat = repoHorarioCat;
        this.repoHorario = repoHorario;
        this.servHorario = servHorario;
        this.repoDia = repoDia;
        this.repoFecha = repoFecha;
        this.servFecha = servFecha;
        this.repoProgramacion = repoProgramacion;
        this.servPersona = servPersona;
        this.repoPersona = repoPersona;
        this.repoAlumno = repoAlumno;
        this.repoAlumnoClases = repoAlumnoClases;
        this.repoInscripcion = repoInscripcion;
        this.repoAsignatura = repoAsignatura;
        this.repoTeoriaHorario = repoTeoriaHorario;
        this.repoInsDetalle = repoInsDetalle;
        this.repoAsigRequisito = repoAsigRequisito;
        this.repoInsAsigRequisito = repoInsAsigRequisito;
        this.repoReqInscripcion = repoReqInscripcion;
        this.repoInsAdicional = repoInsAdicional;
        this.repoInsPago = repoInsPago;
        this.repoInsDescuento = repoInsDescuento;
        this.repoSucSerie = repoSucSerie;
        this.repoProgDeshabilitacion = repoProgDeshabilitacion;
        this.repoHorarioDeshab = repoHorarioDeshab;
        this.repoExtra = repoExtra;
        this.repoLugarSalida = repoLugarSalida;
    }

    @Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW)
    public Programacion doSave(Programacion prog) {
        LocalDate fechaInicio;
        LocalDate fechaFin;
        LocalDate fechaFinEval;
        Set<HorarioCatalogo> horarioCatalogos;
        Set<HorarioCatalogo> dbHorarioCats;
        Set<Dia> dias;
        Map<Long, Dia> dbDias;
        HorarioCatalogo dbHorarioCat;
        Automovil auto;
        Profesor instructor;
        long dayDiff;
        Set<Horario> horarios;
        Horario horario;
        int dayOfWeek;
        Duration duration;

        log.info("Iniciando registro de programacion.");

        fechaInicio = prog.getFechaInicio();
        fechaFin = prog.getFechaFin();
        if (fechaInicio == null) throw new RuntimeException("No se definio una fecha de inicio.");
        if (fechaFin == null) throw new RuntimeException("No se definio una fecha de fin.");
        fechaFinEval = fechaFin.plusDays(1);

        duration = Duration.between(fechaInicio.atStartOfDay(), fechaFinEval.atStartOfDay());
        dayDiff = duration.toDays();
        log.info("Evaluacion dias de diferencia: {}.", dayDiff);
        if (dayDiff < 1) throw new RuntimeException("No exiten dias en el intervalo de fechas.");

        auto = prog.getAutomovil();
        auto = validateField(Automovil.class, Long.class, auto, "automovil", repoAutomovil);
        instructor = prog.getProfesor();
        instructor = validateField(Profesor.class, Long.class, instructor, "instructor", repoProfesor);

        horarioCatalogos = prog.getHorarioCatalogos();
        dbHorarioCats = new HashSet<>();
        if (horarioCatalogos != null) {
            for (HorarioCatalogo horarioCatalogo : horarioCatalogos) {
                try {
                    dbHorarioCat = validateField(HorarioCatalogo.class, Long.class, horarioCatalogo, "Horario Catalogo", repoHorarioCat);
                    dbHorarioCats.add(dbHorarioCat);
                } catch (RuntimeException e) {
                    log.warn("Error al filtar horarioCatalogo: {}.", e.getMessage());
                }
            }
        }
        if (dbHorarioCats.size() < 1) throw new RuntimeException("No se seleccionaron los horarios a trabajar.");

        dias = prog.getDias();
        dbDias = new HashMap<>();
        if (dias != null) {
            for (Dia dia : dias) {
                try {
                    dia = validateFieldId(Dia.class, Long.class, dia, "Dia", repoDia);
                    dbDias.put(dia.getId(), dia);
                } catch (RuntimeException e) {
                    log.warn("Error al filtar Dia: {}.", e.getMessage());
                }
            }
        }

        List<LocalDate> filterDias = new ArrayList<>();

        log.info("buscando FECHAS UTC");
        for (LocalDate fechaEval = fechaInicio; fechaEval.isBefore(fechaFinEval); fechaEval = fechaEval.plusDays(1)) {
            dayOfWeek = fechaEval.getDayOfWeek().getValue();
            if (!dbDias.containsKey((long) dayOfWeek)) continue;

            filterDias.add(fechaEval);
        }

        if (filterDias.size() < 1) throw new RuntimeException("No existen fechas a seleccionar.");

        LocalDateFilter filter;
        FechaCriteria criterioFecha;
        List<Fecha> dbFechas;
        HorarioCriteria criteriaHorario;
        LongFilter filterInstructorId;
        LongFilter filterHorarioCatId;
        LongFilter filterFechaId;
        EstadoFilter filterEstado;
        long count;

        criteriaHorario = new HorarioCriteria();
        filterInstructorId = new LongFilter();
        filterHorarioCatId = new LongFilter();
        filterFechaId = new LongFilter();
        filterEstado = new EstadoFilter();

        filter = new LocalDateFilter();
        filter.setIn(filterDias);
        criterioFecha = new FechaCriteria();
        criterioFecha.setFecha(filter);

        filterEstado.setEquals(Estado.HABILITADO);

        dbFechas = servFecha.findByCriteria(criterioFecha);
        if (dbFechas.size() < 1) throw new RuntimeException("No existen fechas a procesar.");

        horarios = new HashSet<>();
        for (Fecha dbFecha : dbFechas) {
            for (Dia dbDia : dbDias.values()) {
                dayOfWeek = dbFecha.getFecha().getDayOfWeek().getValue();
                if (dayOfWeek != dbDia.getId()) continue;

                for (HorarioCatalogo horarioCat : dbHorarioCats) {
                    filterFechaId.setEquals(dbFecha.getId());
                    filterHorarioCatId.setEquals(horarioCat.getId());
                    filterInstructorId.setEquals(instructor.getId());

                    criteriaHorario.setActivo(filterEstado);
                    criteriaHorario.setFechaId(filterFechaId);
                    criteriaHorario.setHorarioCatalogoId(filterHorarioCatId);
                    criteriaHorario.setInstructorId(filterInstructorId);

                    count = servHorario.countByCriteria(criteriaHorario);
                    if (count > 0) throw new RuntimeException("Ya existe un horario registrado para esta fecha.");

                    horario = new Horario();
                    horario.setActivo(Estado.HABILITADO);
                    horario.setAutomovil(auto);
                    horario.setFecha(dbFecha);
                    horario.setFechaDiaSem(dbDia.getId().intValue());
                    horario.setHorarioCatalogo(horarioCat);
                    horario.setTipo(HorarioTipo.ADMINISTRACION);
                    horario.setFechaDia(dbFecha.getFecha());
                    horario.setInstructor(instructor);

                    horarios.add(horario);
                }
            }
        }

        log.info("Finalizando validacion y se asignaran {} horario(s).", horarios.size());
        if (horarios.size() < 1) throw new RuntimeException("No se pudieron registrar horarios.");

        Programacion dbProg;

        dbProg = new Programacion();
        dbProg.setAutomovil(auto);
        dbProg.setCodigo(UUID.randomUUID().toString());
        dbProg.setDias(new HashSet<>(dbDias.values()));
        dbProg.setEstado(ProgramacionEstado.PROGRAMADO);
        dbProg.setFechaInicio(fechaInicio);
        dbProg.setFechaFin(fechaFin);
        dbProg.setHorarioCatalogos(dbHorarioCats);
        dbProg.setHorarios(horarios);
        dbProg.setProfesor(instructor);
        dbProg.setDeshabilitaciones(0);
        dbProg.setFecha(Instant.now());
        dbProg.nombreUsuario(prog.getNombreUsuario());

        log.info("programacion: registrando nuevo.");
        dbProg = repoProgramacion.save(dbProg);

        log.info("horarios: registrando nuevos [{}].", dbProg.getId());
        for (Horario horarioNew : horarios) {
            horarioNew.setProgramacion(dbProg);
            repoHorario.save(horarioNew);
        }
        log.info("programacion: completando nuevo.");

        return dbProg;
    }

    @Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW)
    public ProgramacionDeshabilitacion doSave(ProgramacionDeshabilitacion deshabilitacion) {
        ProgramacionDeshabilitacion dbDeshabilitacion;
        Set<HorarioDeshabilitacion> horarioDeshabs;
        HorarioDeshabilitacion dbHorarioDeshab;
        Programacion dbProgramacion;
        Horario dbHorario;
        Fecha dbFecha;
        Set<Fecha> dbFechas;
        HorarioCatalogo dbHorarioCat;
        Map<Long, HorarioCatalogo> mapHorarioCats;
        Set<HorarioCatalogo> dbHorarioCats;

        mapHorarioCats = new HashMap<>();
        dbFechas = new HashSet<>();
        if (deshabilitacion.getFechas() != null) {
            for (Fecha fecha : deshabilitacion.getFechas()) {
                dbFecha = validateFieldId(Fecha.class, Long.class, fecha, "fecha", repoFecha);
                dbFechas.add(dbFecha);
            }
        }
        log.info("Se registraran {} fechas", dbFechas.size());

        if (dbFechas.size() < 1) throw new RuntimeException("No se seleccionaron fechas a eliminar.");
        if (
            (horarioDeshabs = deshabilitacion.getHorarioDeshabilitaciones()) == null || horarioDeshabs.size() < 1
        ) throw new RuntimeException("No se definieron horarios a deshabilitar.");

        log.info("Validando Programacion.");
        dbProgramacion = validateFieldId(Programacion.class, Long.class, deshabilitacion.getProgramacion(), "automovil", repoProgramacion);

        log.info("deshabilitacion: Iniciando registro.");
        dbDeshabilitacion = new ProgramacionDeshabilitacion();
        dbDeshabilitacion.setActivo(Estado.HABILITADO);
        dbDeshabilitacion.setCodigo(UUID.randomUUID().toString());
        dbDeshabilitacion.setDescripcion(deshabilitacion.getDescripcion());
        dbDeshabilitacion.setProgramacion(dbProgramacion);
        dbDeshabilitacion.setFecha(Instant.now());
        dbDeshabilitacion.setFechas(dbFechas);
        dbDeshabilitacion.setNombreUsuario(deshabilitacion.getNombreUsuario());

        dbDeshabilitacion = repoProgDeshabilitacion.save(dbDeshabilitacion);
        log.info("deshabilitacion: Finalizando registro.");

        for (HorarioDeshabilitacion horarioDeshab : horarioDeshabs) {
            dbHorario = validateField(Horario.class, Long.class, horarioDeshab.getHorario(), "Horario", repoHorario);
            if (dbHorario.getAlumno() != null) throw new RuntimeException("Existe un horario con alumno asignado.");

            dbHorario.setActivo(Estado.DESHABILITADO);

            dbHorario = repoHorario.save(dbHorario);

            dbHorarioCat = dbHorario.getHorarioCatalogo();
            mapHorarioCats.put(dbHorarioCat.getId(), dbHorarioCat);

            dbHorarioDeshab = new HorarioDeshabilitacion();
            dbHorarioDeshab.setActivo(Estado.HABILITADO);
            dbHorarioDeshab.setProgramacionDeshabilitacion(dbDeshabilitacion);
            dbHorarioDeshab.setTipo(HorarioTipo.ADMINISTRACION);
            dbHorarioDeshab.setHorario(dbHorario);

            repoHorarioDeshab.save(dbHorarioDeshab);
        }
        log.info("deshabilitacion: Finalizando registro horarios.");

        dbHorarioCats = new HashSet<>(mapHorarioCats.values());
        dbDeshabilitacion.setHorarioCatalogos(dbHorarioCats);
        log.info("deshabilitacion: Guandando catalogo horarios.");

        dbDeshabilitacion = repoProgDeshabilitacion.save(dbDeshabilitacion);

        return dbDeshabilitacion;
    }

    @Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW)
    public Programacion doDeleteProgramacion(Long id) {
        Programacion dbProgramacion;

        log.info("doDeleteProgramacion: Iniciando deshabilitacion de programacion {}", id);
        dbProgramacion = repoProgramacion.getById(id);
        if (dbProgramacion == null) throw new RuntimeException("No se encontro la programacion a eliminar.");
        if (dbProgramacion.getEstado() != ProgramacionEstado.PROGRAMADO) throw new RuntimeException(
            "La programacion seleccionada ya se encuentra DESHABILITADA."
        );

        for (Horario dbHorario : dbProgramacion.getHorarios()) {
            if (dbHorario.getAlumno() != null) throw new RuntimeException("Existe un horario con alumno asignado.");

            dbHorario.setActivo(Estado.DESHABILITADO);
            repoHorario.save(dbHorario);
        }

        dbProgramacion.setEstado(ProgramacionEstado.DESHABILITADO);

        dbProgramacion = repoProgramacion.save(dbProgramacion);
        log.info("doDeleteProgramacion: Finalizando deshabilitacion de programacion {}", id);
        return dbProgramacion;
    }

    @Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW)
    public ProgramacionDeshabilitacion doDelete(Long id) {
        ProgramacionDeshabilitacion dbDeshabilitacion;
        Horario dbHorario;
        HorarioCriteria horarioCriteria;
        HorarioCriteria horarioCriteriaIns;
        EstadoFilter filterEstado;
        LongFilter filterFechaId;
        LongFilter filterAutomovilId;
        LongFilter filterHorarioCatId;
        LongFilter filterInstructorId;
        long count;

        dbDeshabilitacion = repoProgDeshabilitacion.getById(id);
        if (dbDeshabilitacion == null) throw new RuntimeException("No se encontro el ID a eliminar.");

        filterFechaId = new LongFilter();
        filterHorarioCatId = new LongFilter();
        filterAutomovilId = new LongFilter();
        filterInstructorId = new LongFilter();
        filterEstado = new EstadoFilter();
        filterEstado.setEquals(Estado.HABILITADO);
        horarioCriteria = new HorarioCriteria();
        horarioCriteria.setActivo(filterEstado);
        horarioCriteriaIns = new HorarioCriteria();
        horarioCriteriaIns.setActivo(filterEstado);
        for (HorarioDeshabilitacion horarioDeshab : dbDeshabilitacion.getHorarioDeshabilitaciones()) {
            horarioDeshab.setActivo(Estado.DESHABILITADO);
            horarioDeshab = repoHorarioDeshab.save(horarioDeshab);

            dbHorario = horarioDeshab.getHorario();

            filterFechaId.setEquals(dbHorario.getFecha().getId());
            filterHorarioCatId.setEquals(dbHorario.getHorarioCatalogo().getId());
            filterAutomovilId.setEquals(dbHorario.getAutomovil().getId());

            horarioCriteria.setFechaId(filterFechaId);
            horarioCriteria.setHorarioCatalogoId(filterHorarioCatId);
            horarioCriteria.setAutomovilId(filterAutomovilId);

            log.info("Iniciando validacion de rehabilitacion horario.");
            count = servHorario.countByCriteria(horarioCriteria);
            log.info("Finalizando validacion de rehabilitacion horario {}.", count);

            if (count > 0) throw new RuntimeException("No se puede rehabilitar un horario, ya existe un registro asociado.");

            filterInstructorId.setEquals(dbHorario.getInstructor().getId());

            horarioCriteriaIns.setFechaId(filterFechaId);
            horarioCriteriaIns.setHorarioCatalogoId(filterHorarioCatId);
            horarioCriteriaIns.setInstructorId(filterInstructorId);

            count = servHorario.countByCriteria(horarioCriteriaIns);
            if (count > 0) throw new RuntimeException("No se puede rehabilitar un horario, el instructor ya cubrio el turno/fecha.");

            dbHorario.setActivo(Estado.HABILITADO);
            dbHorario = repoHorario.save(dbHorario);
        }

        dbDeshabilitacion.setActivo(Estado.DESHABILITADO);
        dbDeshabilitacion = repoProgDeshabilitacion.save(dbDeshabilitacion);

        return dbDeshabilitacion;
    }

    @Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW)
    public Horario doDeleteHorarioAlumno(Long horarioId) {
        Horario dbHorario;
        Alumno dbAlumno;
        AlumnoClases dbAlumnoClases;

        dbHorario = repoHorario.getById(horarioId);
        if (dbHorario == null) throw new RuntimeException("No se encontro el horario seleccionado.");
        if ((dbAlumno = dbHorario.getAlumno()) == null) throw new RuntimeException(
            "El horario seleccionado no tiene registrado un alumno."
        );
        if (dbHorario.getActivo() != Estado.HABILITADO) throw new RuntimeException("El horario seleccionado ya esta deshabilitada.");

        dbAlumnoClases = dbAlumno.getAlumnoClases();
        dbAlumnoClases.setClasesProgramadas(dbAlumnoClases.getClasesProgramadas() - 1);
        repoAlumnoClases.save(dbAlumnoClases);

        dbHorario.setAlumno(null);
        dbHorario = repoHorario.save(dbHorario);
        return dbHorario;
    }

    @Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW)
    public List<Horario> doSave(List<Horario> horarios) {
        List<Horario> dbHorarios;
        Horario dbHorario;
        Alumno dbAlumno;
        AlumnoClases dbAlumnoClases;
        LugarSalida dbLugarSalida;
        long clasesPracticas = 0l;
        long clasesUsadas = 0l;
        HorarioCriteria criterioHorario;
        LongFilter filterHorarioCatId;
        LongFilter filterFechaId;
        LongFilter filterAlumnoId;
        EstadoFilter filterEstado;
        long count;

        filterAlumnoId = new LongFilter();
        filterHorarioCatId = new LongFilter();
        filterFechaId = new LongFilter();
        filterEstado = new EstadoFilter();
        filterEstado.setEquals(Estado.HABILITADO);

        criterioHorario = new HorarioCriteria();
        criterioHorario.setActivo(filterEstado);

        dbHorarios = new ArrayList<>();
        for (Horario horario : horarios) {
            dbHorario = validateField(Horario.class, Long.class, horario, "Horario", repoHorario);
            dbAlumno = validateFieldId(Alumno.class, Long.class, horario.getAlumno(), "Alumno", repoAlumno);
            dbLugarSalida = validateFieldId(LugarSalida.class, Long.class, horario.getLugarSalida(), "LugarSalida", repoLugarSalida);

            dbAlumnoClases = dbAlumno.getAlumnoClases();

            if (dbHorario.getAlumno() != null) throw new RuntimeException("El horario seleccionado ya se encuentra ocupado.");

            filterAlumnoId.setEquals(dbAlumno.getId());
            filterHorarioCatId.setEquals(dbHorario.getHorarioCatalogo().getId());
            filterFechaId.setEquals(dbHorario.getFecha().getId());

            criterioHorario.setAlumnoId(filterAlumnoId);
            criterioHorario.setFechaId(filterFechaId);
            criterioHorario.setHorarioCatalogoId(filterHorarioCatId);

            count = servHorario.countByCriteria(criterioHorario);
            if (count > 0) throw new RuntimeException("Ya existe un registro en la misma fecha y turno.");

            dbHorario.setAlumno(dbAlumno);
            dbHorario.setLugarSalida(dbLugarSalida);

            dbAlumnoClases.setClasesProgramadas(dbAlumnoClases.getClasesProgramadas() + 1);
            if (dbAlumnoClases.getClasesProgramadas() > dbAlumnoClases.getClasesTotales()) throw new RuntimeException(
                String.format(
                    "Ya se sobrepasaron el limite de clases a registrar [permitido: %s] [usados: %s]",
                    dbAlumnoClases.getClasesTotales(),
                    dbAlumnoClases.getClasesProgramadas()
                )
            );

            repoAlumnoClases.save(dbAlumnoClases);

            dbHorario = repoHorario.save(dbHorario);
            dbHorarios.add(dbHorario);
        }

        return dbHorarios;
    }

    @Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW)
    public Inscripcion doSave(Inscripcion inscripcion) {
        Inscripcion dbInscripcion;
        InscripcionDetalle dbDetalle;
        Asignatura dbAsignatura;
        Alumno dbAlumno;
        AlumnoClases dbAlumnoClases;
        TeoriaHorarioCatalogo dbHorario;
        InscripcionAsignaturaRequisito dbInsAsigRequisito;
        AsignaturaRequisito dbAsigRequisito;
        InscripcionAdicional dbInsAdicional;
        RequisitosInscripcion dbReqInscripcion;
        InscripcionDescuento dbInsDescuento;
        InscripcionDescuento insDescuento;
        InscripcionPago dbInsPago;
        SucursalSerie dbSucSerie;

        dbAlumno = validateFieldId(Alumno.class, Long.class, inscripcion.getAlumno(), "ALUMNO", repoAlumno);
        log.info("Validando ALUMNO: {}", dbAlumno.getCodigo());

        dbAlumnoClases = dbAlumno.getAlumnoClases();
        if (dbAlumnoClases == null) {
            dbAlumnoClases = new AlumnoClases();
            dbAlumnoClases.setClasesProgramadas(0);
            dbAlumnoClases.setClasesRealizadas(0);
            dbAlumnoClases.setClasesTotales(0);
            dbAlumnoClases.setAlumno(dbAlumno);

            dbAlumnoClases = repoAlumnoClases.save(dbAlumnoClases);
        }

        dbInscripcion = new Inscripcion();
        dbInscripcion.setAlumno(dbAlumno);
        dbInscripcion.setCodigo(inscripcion.getCodigo());
        dbInscripcion.setCostoTotal(inscripcion.getCostoTotal());
        dbInscripcion.setEstado(inscripcion.getEstado());
        dbInscripcion.setFecha(inscripcion.getFecha());
        dbInscripcion.setNumeroDocumento(inscripcion.getNumeroDocumento());

        dbInscripcion = repoInscripcion.save(dbInscripcion);

        log.info("Inscripcion Detalles: Iniciando registro de [{}].", inscripcion.getInscripcionDetalles().size());
        for (InscripcionDetalle detalle : inscripcion.getInscripcionDetalles()) {
            dbAsignatura = validateField(Asignatura.class, Long.class, detalle.getAsignatura(), "ASIGNATURA", repoAsignatura);
            dbHorario = validateField(TeoriaHorarioCatalogo.class, Long.class, detalle.getHorario(), "HORARIO", repoTeoriaHorario);

            dbAlumnoClases.setClasesTotales(dbAlumnoClases.getClasesTotales() + dbAsignatura.getNumeroClasesPractica());

            dbDetalle = new InscripcionDetalle();
            dbDetalle.setInscripcion(dbInscripcion);
            dbDetalle.setAsignatura(dbAsignatura);
            dbDetalle.setCodigo(detalle.getCodigo());
            dbDetalle.setFechaInicio(detalle.getFechaInicio());
            dbDetalle.setHorario(dbHorario);

            dbDetalle = repoInsDetalle.save(dbDetalle);

            log.info("Ins. Asignatura Requisito: Iniciando registro de [{}].", detalle.getInscripcionAsignaturaRequisitos().size());
            for (InscripcionAsignaturaRequisito insAsigRequisito : detalle.getInscripcionAsignaturaRequisitos()) {
                dbAsigRequisito =
                    validateField(
                        AsignaturaRequisito.class,
                        Long.class,
                        insAsigRequisito.getAsignaturaRequisito(),
                        "AsignaturaRequisito",
                        repoAsigRequisito
                    );

                dbInsAsigRequisito = new InscripcionAsignaturaRequisito();
                dbInsAsigRequisito.setInscripcionDetalle(dbDetalle);
                dbInsAsigRequisito.setAsignaturaRequisito(dbAsigRequisito);
                dbInsAsigRequisito.setDescripcion(insAsigRequisito.getDescripcion());
                dbInsAsigRequisito.setDocumento(insAsigRequisito.getDocumento());
                dbInsAsigRequisito.setImagen(insAsigRequisito.getImagen());
                dbInsAsigRequisito.setImagenContentType(insAsigRequisito.getImagenContentType());

                dbInsAsigRequisito = repoInsAsigRequisito.save(dbInsAsigRequisito);
            }
            log.info("Ins. Asignatura Requisito: Finalizando registro de [{}].", detalle.getInscripcionAsignaturaRequisitos().size());
        }
        log.info("Inscripcion Detalles: Finalizando registro de [{}].", inscripcion.getInscripcionDetalles().size());

        log.info("Ins. Adicionales: Iniciando registro de [{}].", inscripcion.getInscripcionAdicionals().size());
        for (InscripcionAdicional insAdicional : inscripcion.getInscripcionAdicionals()) {
            dbReqInscripcion =
                validateField(
                    RequisitosInscripcion.class,
                    Long.class,
                    insAdicional.getInscripcionRequisito(),
                    "RequisitoInscripcion",
                    repoReqInscripcion
                );

            if (dbReqInscripcion.getNombreCorto().equals("CM")) {
                dbAlumnoClases.setClasesTotales(dbAlumnoClases.getClasesTotales() + NumberUtils.toInt(insAdicional.getCantidad()));
            }

            dbInsAdicional = new InscripcionAdicional();
            dbInsAdicional.setCantidad(insAdicional.getCantidad());
            dbInsAdicional.setCosto(insAdicional.getCosto());
            dbInsAdicional.setDescripcion(insAdicional.getDescripcion());
            dbInsAdicional.setDocumento(insAdicional.getDocumento());
            dbInsAdicional.setImagen(insAdicional.getImagen());
            dbInsAdicional.setImagenContentType(insAdicional.getImagenContentType());
            dbInsAdicional.setInscripcion(dbInscripcion);
            dbInsAdicional.setInscripcionRequisito(dbReqInscripcion);

            dbInsAdicional = repoInsAdicional.save(dbInsAdicional);
        }
        log.info("Ins. Adicionales: Finalizando registro de [{}].", inscripcion.getInscripcionAdicionals().size());

        log.info("Ins. Pago: Iniciando registro de [{}].", inscripcion.getInscripcionPagos().size());
        for (InscripcionPago insPago : inscripcion.getInscripcionPagos()) {
            log.info("Sucursal Serie: Iniciando registro de [{}].");
            dbSucSerie = validateField(SucursalSerie.class, Long.class, insPago.getSerie(), "SucursalSerie", repoSucSerie);
            log.info("Sucursal Serie: Finalizando registro de [{}].");

            dbInsPago = new InscripcionPago();
            dbInsPago.setFecha(insPago.getFecha());
            dbInsPago.setFormaPago(insPago.getFormaPago());
            dbInsPago.setInscripcion(dbInscripcion);
            dbInsPago.setMonto(insPago.getMonto());
            dbInsPago.setPlazoPago(insPago.getPlazoPago());
            dbInsPago.setSerie(dbSucSerie);
            dbInsPago.setNumeroDocumento(inscripcion.getNumeroDocumento());

            dbInsPago = repoInsPago.save(dbInsPago);
        }
        log.info("Ins. Pago: Finalizando registro [{}].", inscripcion.getInscripcionPagos().size());

        log.info("Ins. Descuento: Iniciando registro.");
        if ((insDescuento = inscripcion.getInsDescuento()) != null) {
            dbInsDescuento = new InscripcionDescuento();
            dbInsDescuento.setDescripcion(insDescuento.getDescripcion());
            dbInsDescuento.setInscripcion(dbInscripcion);
            dbInsDescuento.setMonto(insDescuento.getMonto());

            repoInsDescuento.save(dbInsDescuento);
        }
        log.info("Ins. Descuento: Finalizando registro.");

        dbInscripcion = repoInscripcion.findById(dbInscripcion.getId()).get();
        return dbInscripcion;
    }

    private <T, S> T validateField(Class<T> clsEntity, Class<S> clsFieldId, T entity, String entityDesc, JpaRepository<T, S> repoEntity)
        throws RuntimeException {
        Estado estado;

        entity = validateFieldId(clsEntity, clsFieldId, entity, entityDesc, repoEntity);

        estado = getGenericField(clsEntity, Estado.class, entity, "getActivo");
        if (estado != Estado.HABILITADO) throw new RuntimeException(String.format("El %s seleccionado no esta HABILITADO.", entityDesc));

        return entity;
    }

    private <T, S> T validateFieldId(Class<T> clsEntity, Class<S> clsFieldId, T entity, String entityDesc, JpaRepository<T, S> repoEntity)
        throws RuntimeException {
        S entityId;

        if (entity == null) throw new RuntimeException(String.format("No se selecciono un %s.", entityDesc));

        entityId = getGenericField(clsEntity, clsFieldId, entity, "getId");
        entity = repoEntity.getById(entityId);
        if (entity == null) throw new RuntimeException(String.format("No existe el %s seleccionado", entityDesc));

        return entity;
    }

    @SuppressWarnings("unchecked")
    private <T, S> S getGenericField(Class<T> clsInstance, Class<S> clsField, T instance, String methodName) {
        Method method;
        Object value;
        S result = null;

        try {
            method = clsInstance.getMethod(methodName);
            value = method.invoke(instance);

            if (value != null) {
                if (clsField.isInstance(value)) result = (S) value;
            }
        } catch (
            NoSuchMethodException | SecurityException | IllegalAccessException | IllegalArgumentException | InvocationTargetException e
        ) {
            throw new RuntimeException(e);
        }

        return result;
    }

    public Persona getPersonaOrCreate(Persona persona) {
        Persona dbPersona;

        dbPersona = getPersona(persona);
        if (dbPersona == null) {
            dbPersona = repoPersona.save(persona);
        }

        return dbPersona;
    }

    public Persona getPersona(Persona persona) {
        PersonaCriteria criteria;
        StringFilter filterNroDoc;
        TipoDocumentoPersonaFilter filterTipoDoc;
        List<Persona> personas;

        log.info("Filtrando por NRO DOC [{}]", persona.getNumeroDocumento());
        filterNroDoc = new StringFilter();
        filterNroDoc.setEquals(persona.getNumeroDocumento());
        filterTipoDoc = new TipoDocumentoPersonaFilter();
        filterTipoDoc.setEquals(TipoDocumentoPersona.DNI);

        criteria = new PersonaCriteria();
        criteria.setNumeroDocumento(filterNroDoc);
        criteria.setTipoDocumento(filterTipoDoc);

        personas = servPersona.findByCriteria(criteria);
        for (Persona dbPersona : personas) {
            return dbPersona;
        }

        return null;
    }

    @Transactional(readOnly = true)
    public Alumno getAlumnoFullLoad(String alumnoCodigo) {
        Alumno dbAlumno = null;
        List<Alumno> alumnos;
        int size;

        alumnoCodigo = alumnoCodigo != null ? alumnoCodigo : "";
        alumnos = repoExtra.findAlumnoByCodigo(alumnoCodigo);
        for (Alumno alumno : alumnos) {
            dbAlumno = alumno;
        }
        if (dbAlumno == null) throw new RuntimeException("No se encontro el alumno seleccionado.");

        dbAlumno.getPersona();
        size = dbAlumno.getInscripcions().size();
        log.info("obteniendo %s inscripciones", size);
        for (Inscripcion dbInscripcion : dbAlumno.getInscripcions()) {
            size = dbInscripcion.getInscripcionDetalles().size();
            log.info("obteniendo %s inscripciones detalle", size);
            for (InscripcionDetalle insDet : dbInscripcion.getInscripcionDetalles()) {
                log.info("obteniendo asignatura");
                insDet.getAsignatura();
            }
        }
        dbAlumno.getHorarios().size();

        return dbAlumno;
    }
}
