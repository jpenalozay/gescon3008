package com.creinfor.web.rest;

import com.creinfor.domain.Alumno;
import com.creinfor.domain.Horario;
import com.creinfor.domain.Inscripcion;
import com.creinfor.domain.Persona;
import com.creinfor.domain.Programacion;
import com.creinfor.domain.ProgramacionDeshabilitacion;
import com.creinfor.domain.User;
import com.creinfor.domain.enumeration.TipoDocumentoPersona;
import com.creinfor.domain.ext.LongStringPair;
import com.creinfor.repository.ExtraProgramacionRepository;
import com.creinfor.repository.UserRepository;
import com.creinfor.service.ext.ExtraTransactionsService;
import com.creinfor.web.rest.ext.DniResponse;
import com.creinfor.web.rest.vm.LoginVM;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import javax.validation.Valid;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import tech.jhipster.web.util.HeaderUtil;

@RestController
@RequestMapping("/api")
@Transactional
public class ExtraTransactionsResource {

    private final Logger log = LoggerFactory.getLogger(ExtraTransactionsResource.class);

    private static final String ENTITY_NAME = "programacion";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ExtraTransactionsService serviceExtraTransactions;
    private final ExtraProgramacionRepository repoExtraProg;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository repoUser;

    public ExtraTransactionsResource(
        ExtraTransactionsService serviceExtraTransactions,
        ExtraProgramacionRepository repoExtraProg,
        PasswordEncoder passwordEncoder,
        UserRepository repoUser
    ) {
        this.serviceExtraTransactions = serviceExtraTransactions;
        this.repoExtraProg = repoExtraProg;
        this.passwordEncoder = passwordEncoder;
        this.repoUser = repoUser;
    }

    @PostMapping("/authenticate/extra")
    public ResponseEntity<Integer> doAuthorize(@Valid @RequestBody LoginVM loginVM) {
        boolean passhash = false;
        List<User> users;

        users = repoUser.findAll();
        for (User user : users) {
            if (!user.isActivated()) continue;
            if (!StringUtils.equals(user.getLogin(), loginVM.getUsername())) continue;
            passhash = passwordEncoder.matches(loginVM.getPassword(), user.getPassword());
            if (passhash) break;
        }

        log.info("doAuthorize: contraseña con: {}", passhash);

        return new ResponseEntity<>(passhash ? 1 : 0, HttpStatus.OK);
    }

    @GetMapping("/programacions/extra/test")
    public String doTest() {
        return "hola";
    }

    @PostMapping("/programacions/extra")
    public ResponseEntity<Programacion> doSave(@Valid @RequestBody Programacion programacion) throws URISyntaxException {
        Programacion result = serviceExtraTransactions.doSave(programacion);
        return ResponseEntity
            .created(new URI("/api/programacions/extra/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @GetMapping("/programacions/extra/instructor/last")
    public ResponseEntity<Long> getProgramacionInstructorLastId() throws URISyntaxException {
        List<Long> result;
        Long response = 0l;

        result = repoExtraProg.getLastInstructorId(Pageable.ofSize(1));
        for (Long value : result) {
            response = value;
            break;
        }
        return ResponseEntity
            .created(new URI("/api/programacions/extra/instructor/last" + response))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, response.toString()))
            .body(response);
    }

    @PostMapping("/programacion-deshabilitacions/extra")
    public ResponseEntity<ProgramacionDeshabilitacion> doSave(@Valid @RequestBody ProgramacionDeshabilitacion programacion)
        throws URISyntaxException {
        ProgramacionDeshabilitacion result = serviceExtraTransactions.doSave(programacion);
        return ResponseEntity
            .created(new URI("/api/programacion-deshabilitacions/extra/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, "programacionDeshabilitacion", result.getId().toString()))
            .body(result);
    }

    @DeleteMapping("/programacions/extra/{id}")
    public ResponseEntity<Void> deleteProgramacion(@PathVariable Long id) {
        log.debug("REST request to delete Programa : {}", id);
        serviceExtraTransactions.doDeleteProgramacion(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, "Programacion", id.toString()))
            .build();
    }

    @DeleteMapping("/programacion-deshabilitacions/extra/{id}")
    public ResponseEntity<Void> deleteProgDeshabilitacion(@PathVariable Long id) {
        log.debug("REST request to delete Programa Deshabilitacion : {}", id);
        serviceExtraTransactions.doDelete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, "programacionDeshabilitacion", id.toString()))
            .build();
    }

    @DeleteMapping("/programacion-deshabilitacions/extra")
    public ResponseEntity<ProgramacionDeshabilitacion> doDelete(@Valid @RequestBody ProgramacionDeshabilitacion programacion)
        throws URISyntaxException {
        ProgramacionDeshabilitacion result = serviceExtraTransactions.doSave(programacion);
        return ResponseEntity
            .created(new URI("/api/programacion-deshabilitacions/extra/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, "programacionDeshabilitacion", result.getId().toString()))
            .body(result);
    }

    @DeleteMapping("/horarios/extra/alumno/{horarioId}")
    public ResponseEntity<Horario> doDeleteHorarioAlumno(@PathVariable Long horarioId) throws URISyntaxException {
        Horario horario;

        horarioId = horarioId != null ? horarioId : 0l;
        horario = serviceExtraTransactions.doDeleteHorarioAlumno(horarioId);
        return ResponseEntity
            .created(new URI("/api/horarios/extra/alumno/" + horarioId))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, "HorarioAlumno", horarioId.toString()))
            .body(horario);
    }

    @PostMapping("/inscripcions/extra")
    public ResponseEntity<Inscripcion> doSave(@Valid @RequestBody Inscripcion inscripcion) throws URISyntaxException {
        Inscripcion result = serviceExtraTransactions.doSave(inscripcion);
        return ResponseEntity
            .created(new URI("/api/inscripcions/extra/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, "Inscripcion", result.getId().toString()))
            .body(result);
    }

    @GetMapping("/alumnos/find")
    public ResponseEntity<List<LongStringPair>> getAlumnosFind(@RequestParam(value = "filter", required = false) String filter) {
        List<LongStringPair> rows;

        log.debug("REST request to getAlumnosFind by filter: {}", filter);
        if (filter == null || filter.length() < 1) {
            rows = new ArrayList<>();
        } else {
            filter = "%" + filter + "%";
            rows = repoExtraProg.findAlumno(filter);
        }
        return ResponseEntity.ok().body(rows);
    }

    @GetMapping("/profesors/extra")
    public ResponseEntity<List<LongStringPair>> getInstructoresSimple() {
        List<LongStringPair> rows;

        log.debug("REST request to getInstructoresSimple by filter.");
        rows = repoExtraProg.getInstructoresSimple();
        return ResponseEntity.ok().body(rows);
    }

    @GetMapping("/alumnos/extra/{alumnoCodigo}")
    public ResponseEntity<Alumno> getAlumnoFullLoad(@PathVariable String alumnoCodigo) throws URISyntaxException {
        Alumno result = serviceExtraTransactions.getAlumnoFullLoad(alumnoCodigo);
        return ResponseEntity
            .created(new URI("/api/alumnos/extra/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, "Alumno", result.getId().toString()))
            .body(result);
    }

    @GetMapping("/personas/dni/{dni}")
    public ResponseEntity<Persona> getPersonaByDni(@PathVariable(value = "dni", required = false) String dni) throws URISyntaxException {
        final String URL = "https://apiperu.dev/api/dni/%s";
        RestTemplate rest;
        HttpHeaders headers;
        HttpEntity<Void> entity;
        Persona persona;
        String url;
        ResponseEntity<DniResponse> response;
        DniResponse resultEntity;
        Map<String, Object> result;

        dni = dni != null ? dni : "";
        url = String.format(URL, dni);

        headers = new HttpHeaders();
        headers.set("Authorization", "Bearer 4200d169257db75200535d4aa16b44ea981f54803ac4453eba1e440106c8df0c");
        headers.setContentType(MediaType.APPLICATION_JSON);

        entity = new HttpEntity<>(headers);
        rest = new RestTemplate();

        persona = new Persona();
        persona.setId(0l);
        persona.setNumeroDocumento(dni);
        persona = serviceExtraTransactions.getPersona(persona);
        if (persona == null) {
            response = rest.exchange(url, HttpMethod.GET, entity, DniResponse.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                log.info("consulta asignando datos.");
                resultEntity = response.getBody();
                if (resultEntity.isSuccess()) {
                    result = resultEntity.getData();

                    persona = new Persona();
                    persona.setId(0l);
                    persona.setApellidoPaterno(toStringSafe(result.get("apellido_paterno")));
                    persona.setApellidoMaterno(toStringSafe(result.get("apellido_materno")));
                    persona.setNombres(toStringSafe(result.get("nombres")));
                    persona.setNumeroDocumento(toStringSafe(result.get("numero")));
                    persona.setTipoDocumento(TipoDocumentoPersona.DNI);

                    persona = serviceExtraTransactions.getPersonaOrCreate(persona);
                } else {
                    throw new RuntimeException("No se encontro el DNI.");
                }
            } else {
                throw new RuntimeException("No se encontro el DNI - error api.");
            }
        }

        /*
        response = rest.exchange(url, HttpMethod.GET, entity, DniResponse.class);

        persona = new Persona();
        persona.setId(0l);
        if (response.getStatusCode() == HttpStatus.OK) {
            log.info("consulta asignando datos.");
            resultEntity = response.getBody();
            if (resultEntity.isSuccess()) {
                result = resultEntity.getData();

                persona.setApellidoPaterno(toStringSafe(result.get("apellido_paterno")));
                persona.setApellidoMaterno(toStringSafe(result.get("apellido_materno")));
                persona.setNombres(toStringSafe(result.get("nombres")));
                persona.setNumeroDocumento(toStringSafe(result.get("numero")));
                persona.setTipoDocumento(TipoDocumentoPersona.DNI);

                persona = serviceExtraTransactions.getPersonaOrCreate(persona);
            } else {
                persona.setNumeroDocumento(dni);
                persona = serviceExtraTransactions.getPersona(persona);
                if (persona == null) throw new RuntimeException("No se encontro el DNI.");
            }
        } else {
            log.info("error consulta.");
        }
        */

        return ResponseEntity
            .created(new URI("/personas/dni/" + persona.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, "Persona", persona.getId().toString()))
            .body(persona);
    }

    @PostMapping("/horarios/extra/alumno")
    public ResponseEntity<List<Horario>> doSave(@RequestBody List<Horario> horarios) throws URISyntaxException {
        List<Horario> result = serviceExtraTransactions.doSave(horarios);
        return ResponseEntity
            .created(new URI("/api/horarios/extra/alumno/" + result.size()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, "HorarioAlumno", "" + result.size()))
            .body(result);
    }

    @GetMapping("/users/extra/autorities/{username}")
    public ResponseEntity<List<String>> getAutoritiesByUsername(@PathVariable(value = "username", required = false) String username)
        throws URISyntaxException {
        List<String> autorities = repoExtraProg.getAutorities(username);
        return ResponseEntity
            .created(new URI("/users/extra/autorities/" + username))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, "Autority", "" + autorities.size()))
            .body(autorities);
    }

    private String toStringSafe(Object value) {
        return value != null ? value.toString() : "";
    }
}
