package com.creinfor.repository;

import com.creinfor.domain.Alumno;
import com.creinfor.domain.Programacion;
import com.creinfor.domain.ext.LongStringPair;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ExtraProgramacionRepository extends JpaRepository<Programacion, Long>, JpaSpecificationExecutor<Programacion> {
    @Query(value = "select prof.id from Programacion p inner join p.profesor prof order by p.id desc")
    List<Long> getLastInstructorId(Pageable pageable);

    @Query(
        value = "select new com.creinfor.domain.ext.LongStringPair(a.id, concat('[', a.codigo, '] ', p.apellidoPaterno, ' ', p.apellidoMaterno, ', ', p.nombres)) " +
        "from Alumno a inner join a.persona p where cast(a.codigo as string) like :filter or cast(p.numeroDocumento as string) like :filter " +
        "or p.nombres like :filter or p.apellidoPaterno like :filter or p.apellidoMaterno like :filter"
    )
    List<LongStringPair> findAlumno(@Param("filter") String filter);

    @Query("select a from Alumno a where a.codigo = :alumnoCodigo")
    List<Alumno> findAlumnoByCodigo(@Param("alumnoCodigo") String alumnoCodigo);

    @Query(
        "select new com.creinfor.domain.ext.LongStringPair(p.id, concat(pe.apellidoPaterno, ' ', substring(pe.apellidoMaterno, 0, 1), '., ', pe.nombres)) from Profesor p inner join p.empleado e inner join e.persona pe where p.activo = 'HABILITADO'"
    )
    List<LongStringPair> getInstructoresSimple();

    @Query(
        "select sum(aida.numeroClasesPractica) from Alumno a inner join a.inscripcions ai inner join ai.inscripcionDetalles aid inner join aid.asignatura aida where a.id = :alumnoId"
    )
    List<Long> countClasesPracticas(@Param("alumnoId") Long alumnoId);

    @Query("select count(*) from Horario h inner join h.alumno ha where ha.id = :alumnoId and h.activo = 'HABILITADO'")
    List<Long> countClasesUsed(@Param("alumnoId") Long alumnoId);

    @Query("select ua.name from User u inner join u.authorities ua where u.login = :username")
    List<String> getAutorities(@Param("username") String username);
}
