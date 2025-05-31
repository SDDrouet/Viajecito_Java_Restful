/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package ec.edu.aerolineas_condor_server.controller;

import ec.edu.aerolineas_condor_server.model.Boletos;
import ec.edu.aerolineas_condor_server.model.CompraBoletoRequest;
import ec.edu.aerolineas_condor_server.model.Usuarios;
import ec.edu.aerolineas_condor_server.model.Vuelos;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.PersistenceException;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 *
 * @author Drouet
 */
@Stateless
@Path("boletos")
public class BoletosFacadeREST extends AbstractFacade<Boletos> {

    @PersistenceContext(unitName = "my_persistence_unit")
    private EntityManager em;

    public BoletosFacadeREST() {
        super(Boletos.class);
    }

    @POST
    @Override
    @Consumes({MediaType.APPLICATION_JSON})
    public void create(Boletos entity) {
        super.create(entity);
    }

    @PUT
    @Path("{id}")
    @Consumes({MediaType.APPLICATION_JSON})
    public void edit(@PathParam("id") Integer id, Boletos entity) {
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
    public Boletos find(@PathParam("id") Integer id) {
        return super.find(id);
    }

    @GET
    @Override
    @Produces({MediaType.APPLICATION_JSON})
    public List<Boletos> findAll() {
        return super.findAll();
    }

    @GET
    @Path("{from}/{to}")
    @Produces({MediaType.APPLICATION_JSON})
    public List<Boletos> findRange(@PathParam("from") Integer from, @PathParam("to") Integer to) {
        return super.findRange(new int[]{from, to});
    }

    @GET
    @Path("count")
    @Produces(MediaType.TEXT_PLAIN)
    public String countREST() {
        return String.valueOf(super.count());
    }
    
    @POST
    @Path("comprar")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Transactional
    public Response comprarBoletos(CompraBoletoRequest request) {
        Vuelos vuelo = em.find(Vuelos.class, request.idVuelo);
        Usuarios usuario = em.find(Usuarios.class, request.idUsuario);

        if (vuelo == null || usuario == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Vuelo o usuario no encontrado").build();
        }

        if (vuelo.getDisponibles() < request.cantidad) {
            return Response.status(Response.Status.BAD_REQUEST).entity("No hay suficientes asientos disponibles").build();
        }
        
        // Obtener la cantidad actual de boletos para ese vuelo
        Long count = em.createQuery(
            "SELECT COUNT(b) FROM Boletos b WHERE b.idVuelo.idVuelo = :idVuelo", Long.class)
            .setParameter("idVuelo", vuelo.getIdVuelo())
            .getSingleResult();

        long numeroSecuencial = count + 1;
        String idVueloFormato = String.format("%08d", vuelo.getIdVuelo());
    

        try {
            for (int i = 0; i < request.cantidad; i++) {
                Boletos boleto = new Boletos();

                // Crear número de boleto con el formato requerido
                String numeroSecuenciaFormato = String.format("%03d", numeroSecuencial++);
                String numeroBoleto = idVueloFormato + "-" + numeroSecuenciaFormato;
                boleto.setNumeroBoleto(numeroBoleto);
                
                boleto.setFechaCompra(new Date());
                boleto.setPrecioCompra(vuelo.getValor());
                boleto.setIdUsuario(usuario);
                boleto.setIdVuelo(vuelo);
                em.persist(boleto);
            }

            vuelo.setDisponibles(vuelo.getDisponibles() - request.cantidad);
            em.merge(vuelo);

            return Response.ok("Compra realizada con éxito").build();
        } catch (PersistenceException e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error al guardar los boletos. Puede que se haya generado un número duplicado.").build();
        }
    }
    
    @GET
    @Path("usuario/{idUsuario}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response obtenerBoletosPorUsuario(@PathParam("idUsuario") Integer idUsuario) {
        Usuarios usuario = em.find(Usuarios.class, idUsuario);

        if (usuario == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("Usuario no encontrado").build();
        }

        List<Boletos> boletos = em.createQuery(
                "SELECT b FROM Boletos b WHERE b.idUsuario.idUsuario = :idUsuario", Boletos.class)
                .setParameter("idUsuario", idUsuario)
                .getResultList();

        return Response.ok(boletos).build();
    }

    @Override
    protected EntityManager getEntityManager() {
        return em;
    }
    
}
