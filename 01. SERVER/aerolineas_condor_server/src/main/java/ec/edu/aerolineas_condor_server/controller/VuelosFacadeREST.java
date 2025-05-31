/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package ec.edu.aerolineas_condor_server.controller;

import ec.edu.aerolineas_condor_server.model.Vuelos;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

/**
 *
 * @author Drouet
 */
@Stateless
@Path("vuelos")
public class VuelosFacadeREST extends AbstractFacade<Vuelos> {

    @PersistenceContext(unitName = "my_persistence_unit")
    private EntityManager em;

    public VuelosFacadeREST() {
        super(Vuelos.class);
    }

    @POST
    @Override
    @Consumes({MediaType.APPLICATION_JSON})
    public void create(Vuelos entity) {
        super.create(entity);
    }

    @PUT
    @Path("{id}")
    @Consumes({MediaType.APPLICATION_JSON})
    public void edit(@PathParam("id") Integer id, Vuelos entity) {
        super.edit(entity);
    }

    @DELETE
    @Path("{id}")
    public void remove(@PathParam("id") Integer id) {
        super.remove(super.find(id));
    }

    @GET
    @Path("{id}")
    @Produces({MediaType.APPLICATION_JSON})
    public Vuelos find(@PathParam("id") Integer id) {
        return super.find(id);
    }

    @GET
    @Override
    @Produces({MediaType.APPLICATION_JSON})
    public List<Vuelos> findAll() {
        return super.findAll();
    }

    @GET
    @Path("{from}/{to}")
    @Produces({MediaType.APPLICATION_JSON})
    public List<Vuelos> findRange(@PathParam("from") Integer from, @PathParam("to") Integer to) {
        return super.findRange(new int[]{from, to});
    }

    @GET
    @Path("count")
    @Produces(MediaType.TEXT_PLAIN)
    public String countREST() {
        return String.valueOf(super.count());
    }
    
    @GET
    @Path("buscar")
    @Produces(MediaType.APPLICATION_JSON)
    public List<Vuelos> buscarPorCiudadesOrdenadoPorValorDesc(
            @QueryParam("origen") String ciudadOrigen,
            @QueryParam("destino") String ciudadDestino,
            @QueryParam("horaSalida") String horaSalidaStr) throws ParseException {

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Date inicio = sdf.parse(horaSalidaStr); // yyyy-MM-dd 00:00:00
        Calendar cal = Calendar.getInstance();
        cal.setTime(inicio);
        cal.set(Calendar.HOUR_OF_DAY, 23);
        cal.set(Calendar.MINUTE, 59);
        cal.set(Calendar.SECOND, 59);
        cal.set(Calendar.MILLISECOND, 999);
        Date fin = cal.getTime();

        return em.createQuery(
                "SELECT v FROM Vuelos v WHERE v.idCiudadOrigen.codigoCiudad = :origen AND v.idCiudadDestino.codigoCiudad = :destino " +
                "AND v.horaSalida BETWEEN :inicio AND :fin ORDER BY v.valor DESC",
                Vuelos.class)
                .setParameter("origen", ciudadOrigen)
                .setParameter("destino", ciudadDestino)
                .setParameter("inicio", inicio)
                .setParameter("fin", fin)
                .getResultList();
    }

    @Override
    protected EntityManager getEntityManager() {
        return em;
    }
    
}
