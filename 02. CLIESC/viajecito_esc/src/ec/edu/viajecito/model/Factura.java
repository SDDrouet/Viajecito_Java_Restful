/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package ec.edu.viajecito.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collection;
import java.util.Date;

/**
 *
 * @author Drouet
 */
public class Factura {
    private Integer idFactura;
    private String numeroFactura;
    private BigDecimal precioSinIva;
    private BigDecimal precioConIva;
    private Usuario idUsuario;
    private String fechaFactura;
    private Collection<Boleto> boletosCollection;
    private Collection<Amortizacion> amortizacionBoletosCollection;
    

    public Factura() {
    }

    public Factura(Integer idFactura, String numeroFactura, BigDecimal precioSinIva, BigDecimal precioConIva, Usuario idUsuario, String fechaFactura, Collection<Boleto> boletosCollection, Collection<Amortizacion> amortizacionBoletosCollection) {
        this.idFactura = idFactura;
        this.numeroFactura = numeroFactura;
        this.precioSinIva = precioSinIva;
        this.precioConIva = precioConIva;
        this.idUsuario = idUsuario;
        this.fechaFactura = fechaFactura;
        this.boletosCollection = boletosCollection;
        this.amortizacionBoletosCollection = amortizacionBoletosCollection;
    }

    public Collection<Amortizacion> getAmortizacionBoletosCollection() {
        return amortizacionBoletosCollection;
    }

    public void setAmortizacionBoletosCollection(Collection<Amortizacion> amortizacionBoletosCollection) {
        this.amortizacionBoletosCollection = amortizacionBoletosCollection;
    }

    

    public Usuario getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Usuario idUsuario) {
        this.idUsuario = idUsuario;
    }

    

    public Collection<Boleto> getBoletosCollection() {
        return boletosCollection;
    }

    public void setBoletosCollection(Collection<Boleto> boletosCollection) {
        this.boletosCollection = boletosCollection;
    }

    public Integer getIdFactura() {
        return idFactura;
    }

    public void setIdFactura(Integer idFactura) {
        this.idFactura = idFactura;
    }

    public String getNumeroFactura() {
        return numeroFactura;
    }

    public void setNumeroFactura(String numeroFactura) {
        this.numeroFactura = numeroFactura;
    }

    public BigDecimal getPrecioSinIva() {
        return precioSinIva;
    }

    public void setPrecioSinIva(BigDecimal precioSinIva) {
        this.precioSinIva = precioSinIva;
    }

    public BigDecimal getPrecioConIva() {
        return precioConIva;
    }

    public void setPrecioConIva(BigDecimal precioConIva) {
        this.precioConIva = precioConIva;
    }

    public Date getFechaFactura() {
        if (fechaFactura == null || fechaFactura.isBlank()) return null;

        try {
            // Eliminar el sufijo [UTC] para que el parser no falle
            String cleaned = fechaFactura.replace("[UTC]", "");

            // Parsear con formato compatible
            Instant instant = Instant.parse(cleaned);
            return Date.from(instant);
        } catch (Exception e) {
            System.err.println("Error al parsear fechaFactura: " + e.getMessage());
            return null;
        }
    }

    public void setFechaFactura(String fechaFactura) {
        this.fechaFactura = fechaFactura;
    }
    
    
    
}
