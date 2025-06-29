/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package ec.edu.aerolineas_condor_server.controller;

import ec.edu.aerolineas_condor_server.model.Amortizacion;
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
import jakarta.ws.rs.core.MediaType;
import java.util.List;

/**
 *
 * @author Drouet
 */
@Stateless
@Path("amortizacion")
public class AmortizacionBoletosFacadeREST extends AbstractFacade<Amortizacion> {

    @PersistenceContext(unitName = "my_persistence_unit")
    private EntityManager em;

    public AmortizacionBoletosFacadeREST() {
        super(Amortizacion.class);
    }

    @POST
    @Override
    @Consumes({MediaType.APPLICATION_JSON})
    public void create(Amortizacion entity) {
        super.create(entity);
    }

    @PUT
    @Path("{id}")
    @Consumes({MediaType.APPLICATION_JSON})
    public void edit(@PathParam("id") Integer id, Amortizacion entity) {
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
    public Amortizacion find(@PathParam("id") Integer id) {
        return super.find(id);
    }

    @GET
    @Override
    @Produces({MediaType.APPLICATION_JSON})
    public List<Amortizacion> findAll() {
        return super.findAll();
    }

    @GET
    @Path("{from}/{to}")
    @Produces({MediaType.APPLICATION_JSON})
    public List<Amortizacion> findRange(@PathParam("from") Integer from, @PathParam("to") Integer to) {
        return super.findRange(new int[]{from, to});
    }
    
    @GET
    @Path("factura/{idFactura}")
    @Produces({MediaType.APPLICATION_JSON})
    public List<Amortizacion> obtenerPorFactura(@PathParam("idFactura") Integer idFactura) {
        return em.createQuery(
            "SELECT a FROM Amortizacion a WHERE a.idFactura.idFactura = :idFactura ORDER BY a.numeroCuota",
            Amortizacion.class
        )
        .setParameter("idFactura", idFactura)
        .getResultList();
    }

    @GET
    @Path("count")
    @Produces(MediaType.TEXT_PLAIN)
    public String countREST() {
        return String.valueOf(super.count());
    }
   
    @Override
    protected EntityManager getEntityManager() {
        return em;
    }
    
}
