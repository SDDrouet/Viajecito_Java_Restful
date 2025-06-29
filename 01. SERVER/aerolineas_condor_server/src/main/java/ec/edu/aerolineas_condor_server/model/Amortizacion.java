/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package ec.edu.aerolineas_condor_server.model;

import jakarta.json.bind.annotation.JsonbTransient;
import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;
import java.math.BigDecimal;

/**
 *
 * @author Drouet
 */
@Entity
@Table(name = "amortizacion_boletos")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "Amortizacion.findAll", query = "SELECT a FROM Amortizacion a"),
    @NamedQuery(name = "Amortizacion.findByIdAmortizacion", query = "SELECT a FROM Amortizacion a WHERE a.idAmortizacion = :idAmortizacion"),
    @NamedQuery(name = "Amortizacion.findByNumeroCuota", query = "SELECT a FROM Amortizacion a WHERE a.numeroCuota = :numeroCuota"),
    @NamedQuery(name = "Amortizacion.findByValorCuota", query = "SELECT a FROM Amortizacion a WHERE a.valorCuota = :valorCuota"),
    @NamedQuery(name = "Amortizacion.findByInteresPagado", query = "SELECT a FROM Amortizacion a WHERE a.interesPagado = :interesPagado"),
    @NamedQuery(name = "Amortizacion.findByCapitalPagado", query = "SELECT a FROM Amortizacion a WHERE a.capitalPagado = :capitalPagado"),
    @NamedQuery(name = "Amortizacion.findBySaldo", query = "SELECT a FROM Amortizacion a WHERE a.saldo = :saldo")
})
public class Amortizacion implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id_amortizacion")
    private Integer idAmortizacion;
    @Basic(optional = false)
    @NotNull
    @Column(name = "numero_cuota")
    private int numeroCuota;
    // @Max(value=?)  @Min(value=?)//if you know range of your decimal fields consider using these annotations to enforce field validation
    @Column(name = "valor_cuota")
    private BigDecimal valorCuota;
    @Column(name = "interes_pagado")
    private BigDecimal interesPagado;
    @Column(name = "capital_pagado")
    private BigDecimal capitalPagado;
    @Column(name = "saldo")
    private BigDecimal saldo;
    @JoinColumn(name = "id_factura", referencedColumnName = "id_factura")
    @ManyToOne(optional = false)
    private Facturas idFactura;

    public Amortizacion() {
    }

    public Amortizacion(Integer idAmortizacion) {
        this.idAmortizacion = idAmortizacion;
    }

    public Amortizacion(Integer idAmortizacion, int numeroCuota) {
        this.idAmortizacion = idAmortizacion;
        this.numeroCuota = numeroCuota;
    }

    public Integer getIdAmortizacion() {
        return idAmortizacion;
    }

    public void setIdAmortizacion(Integer idAmortizacion) {
        this.idAmortizacion = idAmortizacion;
    }

    public int getNumeroCuota() {
        return numeroCuota;
    }

    public void setNumeroCuota(int numeroCuota) {
        this.numeroCuota = numeroCuota;
    }

    public BigDecimal getValorCuota() {
        return valorCuota;
    }

    public void setValorCuota(BigDecimal valorCuota) {
        this.valorCuota = valorCuota;
    }

    public BigDecimal getInteresPagado() {
        return interesPagado;
    }

    public void setInteresPagado(BigDecimal interesPagado) {
        this.interesPagado = interesPagado;
    }

    public BigDecimal getCapitalPagado() {
        return capitalPagado;
    }

    public void setCapitalPagado(BigDecimal capitalPagado) {
        this.capitalPagado = capitalPagado;
    }

    public BigDecimal getSaldo() {
        return saldo;
    }

    public void setSaldo(BigDecimal saldo) {
        this.saldo = saldo;
    }

    @JsonbTransient
    public Facturas getIdFactura() {
        return idFactura;
    }

    public void setIdFactura(Facturas idFactura) {
        this.idFactura = idFactura;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (idAmortizacion != null ? idAmortizacion.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof Amortizacion)) {
            return false;
        }
        Amortizacion other = (Amortizacion) object;
        if ((this.idAmortizacion == null && other.idAmortizacion != null) || (this.idAmortizacion != null && !this.idAmortizacion.equals(other.idAmortizacion))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "ec.edu.aerolineas_condor_server.model.Amortizacion[ idAmortizacion=" + idAmortizacion + " ]";
    }
}
