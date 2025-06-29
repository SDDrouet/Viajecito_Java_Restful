/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package ec.edu.viajecito.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Date;

/**
 *
 * @author Drouet
 */
public class Boleto {

    private Integer idBoleto;
    private String numeroBoleto;
    private String fechaCompra;
    private BigDecimal precioCompra;
    private Usuario idUsuario;
    private Vuelo idVuelo;
    private Factura idFactura;

    // Constructor por defecto
    public Boleto() {
    }

    // Constructor con todos los campos
    public Boleto(Integer idBoleto, String numeroBoleto, String fechaCompra, BigDecimal precioCompra, Usuario usuario, Vuelo vuelo, Factura factura) {
        this.idBoleto = idBoleto;
        this.numeroBoleto = numeroBoleto;
        this.fechaCompra = fechaCompra;
        this.precioCompra = precioCompra;
        this.idUsuario = usuario;
        this.idVuelo = vuelo;
    }

    // Getters y Setters
    public Integer getIdBoleto() {
        return idBoleto;
    }

    public void setIdBoleto(Integer idBoleto) {
        this.idBoleto = idBoleto;
    }

    public String getNumeroBoleto() {
        return numeroBoleto;
    }

    public void setNumeroBoleto(String numeroBoleto) {
        this.numeroBoleto = numeroBoleto;
    }

    public Date getFechaCompra() {
        if (fechaCompra == null || fechaCompra.isBlank()) return null;

        try {
            // Eliminar el sufijo [UTC] para que el parser no falle
            String cleaned = fechaCompra.replace("[UTC]", "");

            // Parsear con formato compatible
            Instant instant = Instant.parse(cleaned);
            return Date.from(instant);
        } catch (Exception e) {
            System.err.println("Error al parsear fechaFactura: " + e.getMessage());
            return null;
        }
    }

    public void setFechaCompra(String fechaCompra) {
        this.fechaCompra = fechaCompra;
    }

    public BigDecimal getPrecioCompra() {
        return precioCompra;
    }

    public void setPrecioCompra(BigDecimal precioCompra) {
        this.precioCompra = precioCompra;
    }

    public Usuario getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Usuario idUsuario) {
        this.idUsuario = idUsuario;
    }

    public Vuelo getIdVuelo() {
        return idVuelo;
    }

    public void setIdVuelo(Vuelo idVuelo) {
        this.idVuelo = idVuelo;
    }

    public Factura getIdFactura() {
        return idFactura;
    }

    public void setIdFactura(Factura idFactura) {
        this.idFactura = idFactura;
    }
    
}
