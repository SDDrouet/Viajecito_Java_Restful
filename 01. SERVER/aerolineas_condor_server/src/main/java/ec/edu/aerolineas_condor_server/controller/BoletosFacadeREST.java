/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package ec.edu.aerolineas_condor_server.controller;

import ec.edu.aerolineas_condor_server.model.Boletos;
import ec.edu.aerolineas_condor_server.model.CompraBoletoRequest;
import ec.edu.aerolineas_condor_server.model.Facturas;
import ec.edu.aerolineas_condor_server.model.Usuarios;
import ec.edu.aerolineas_condor_server.model.VueloCompra;
import ec.edu.aerolineas_condor_server.model.Vuelos;
import ec.edu.aerolineas_condor_server.model.Amortizacion;
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
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
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
        try {
            double totalSinIVA = 0.0;

            // Validación y cálculo de total sin IVA
            for (VueloCompra vc : request.getVuelos()) {
                Vuelos vuelo = em.find(Vuelos.class, vc.getIdVuelo());
                if (vuelo == null || vuelo.getDisponibles() < vc.getCantidad()) {
                    return Response.status(Response.Status.BAD_REQUEST)
                        .entity("Vuelo no encontrado o sin cupos suficientes").build();
                }
                totalSinIVA += vuelo.getValor().doubleValue() * vc.getCantidad();
            }

            double totalConIVA = totalSinIVA * 1.15;
            Usuarios usuario = em.find(Usuarios.class, request.getIdUsuario());
            if (usuario == null) {
                return Response.status(Response.Status.BAD_REQUEST).entity("Usuario no encontrado").build();
            }

            // Generar número de factura
            Long maxFacturaId = em.createQuery("SELECT COALESCE(MAX(f.idFactura), 0) FROM Facturas f", Long.class).getSingleResult();
            String numeroFactura = "FAC-" + String.format("%09d", maxFacturaId + 1);

            // Crear factura
            Facturas factura = new Facturas();
            factura.setNumeroFactura(numeroFactura);
            factura.setIdUsuario(usuario);
            factura.setPrecioSinIva(BigDecimal.valueOf(totalSinIVA));
            factura.setPrecioConIva(BigDecimal.valueOf(totalConIVA));
            factura.setFechaFactura(new Date());
            em.persist(factura);
            em.flush(); // Para obtener ID generado

            // Si es a crédito, generar tabla amortización
            if (request.isEsCredito()) {
                List<Amortizacion> tabla = GenerarTablaAmortizacion(totalConIVA, request.getTasaInteresAnual(), request.getNumeroCuotas(), factura);
                for (Amortizacion a : tabla) {
                    a.setIdFactura(factura);
                    em.persist(a);
                }
            }

            // Insertar boletos y actualizar vuelos
            for (VueloCompra vc : request.getVuelos()) {
                Vuelos vuelo = em.find(Vuelos.class, vc.getIdVuelo());

                for (int i = 0; i < vc.getCantidad(); i++) {
                    Boletos boleto = new Boletos();
                    boleto.setNumeroBoleto(UUID.randomUUID().toString().substring(0, 10).toUpperCase());
                    boleto.setIdUsuario(usuario);
                    boleto.setIdVuelo(vuelo);
                    boleto.setPrecioCompra(vuelo.getValor());
                    boleto.setFechaCompra(new Date());
                    boleto.setIdFactura(factura);
                    em.persist(boleto);
                }

                vuelo.setDisponibles(vuelo.getDisponibles() - vc.getCantidad());
                em.merge(vuelo);
            }
            
            em.flush(); // Asegura que todos los cambios se escriban
            em.refresh(factura); // Refresca la factura desde la BD

            return Response.ok("Compra realizada con éxito").build();

        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error en la compra: " + e.getMessage()).build();
        }
    }
    
    private List<Amortizacion> GenerarTablaAmortizacion(double monto, double tasaAnual, int cuotas, Facturas factura) {
        List<Amortizacion> lista = new ArrayList<>();

        BigDecimal saldo = BigDecimal.valueOf(monto);
        double tasaMensual = tasaAnual / 12 / 100;

        BigDecimal cuota = saldo.multiply(BigDecimal.valueOf(tasaMensual))
            .divide(BigDecimal.valueOf(1 - Math.pow(1 + tasaMensual, -cuotas)), 10, RoundingMode.HALF_UP);

        for (int i = 1; i <= cuotas; i++) {
            BigDecimal interes = saldo.multiply(BigDecimal.valueOf(tasaMensual));
            BigDecimal capital = cuota.subtract(interes);
            saldo = saldo.subtract(capital);

            Amortizacion a = new Amortizacion();
            a.setIdFactura(factura);
            a.setNumeroCuota(i);
            a.setValorCuota(cuota.setScale(2, RoundingMode.HALF_UP));
            a.setInteresPagado(interes.setScale(2, RoundingMode.HALF_UP));
            a.setCapitalPagado(capital.setScale(2, RoundingMode.HALF_UP));
            a.setSaldo(saldo.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP));

            lista.add(a);
        }

        return lista;
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
