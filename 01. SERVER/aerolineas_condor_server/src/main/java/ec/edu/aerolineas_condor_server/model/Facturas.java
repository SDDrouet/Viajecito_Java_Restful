/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package ec.edu.aerolineas_condor_server.model;

import jakarta.persistence.Basic;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlTransient;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Collection;
import java.util.Date;

/**
 *
 * @author Drouet
 */
@Entity
@Table(name = "facturas")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "Facturas.findAll", query = "SELECT f FROM Facturas f"),
    @NamedQuery(name = "Facturas.findByIdFactura", query = "SELECT f FROM Facturas f WHERE f.idFactura = :idFactura"),
    @NamedQuery(name = "Facturas.findByNumeroFactura", query = "SELECT f FROM Facturas f WHERE f.numeroFactura = :numeroFactura"),
    @NamedQuery(name = "Facturas.findByPrecioSinIva", query = "SELECT f FROM Facturas f WHERE f.precioSinIva = :precioSinIva"),
    @NamedQuery(name = "Facturas.findByPrecioConIva", query = "SELECT f FROM Facturas f WHERE f.precioConIva = :precioConIva"),
    @NamedQuery(name = "Facturas.findByFechaFactura", query = "SELECT f FROM Facturas f WHERE f.fechaFactura = :fechaFactura")})
public class Facturas implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id_factura")
    private Integer idFactura;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 20)
    @Column(name = "numero_factura")
    private String numeroFactura;
    // @Max(value=?)  @Min(value=?)//if you know range of your decimal fields consider using these annotations to enforce field validation
    @Basic(optional = false)
    @NotNull
    @Column(name = "precio_sin_iva")
    private BigDecimal precioSinIva;
    @Basic(optional = false)
    @NotNull
    @Column(name = "precio_con_iva")
    private BigDecimal precioConIva;
    @Column(name = "fecha_factura")
    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaFactura;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "idFactura")
    private Collection<Amortizacion> amortizacionBoletosCollection;
    @JoinColumn(name = "id_usuario", referencedColumnName = "id_usuario")
    @ManyToOne(optional = false)
    private Usuarios idUsuario;
    @OneToMany(mappedBy = "idFactura")
    private Collection<Boletos> boletosCollection;

    public Facturas() {
    }

    public Facturas(Integer idFactura) {
        this.idFactura = idFactura;
    }

    public Facturas(Integer idFactura, String numeroFactura, BigDecimal precioSinIva, BigDecimal precioConIva) {
        this.idFactura = idFactura;
        this.numeroFactura = numeroFactura;
        this.precioSinIva = precioSinIva;
        this.precioConIva = precioConIva;
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
        return fechaFactura;
    }

    public void setFechaFactura(Date fechaFactura) {
        this.fechaFactura = fechaFactura;
    }

    @XmlTransient
    public Collection<Amortizacion> getAmortizacionBoletosCollection() {
        return amortizacionBoletosCollection;
    }

    public void setAmortizacionBoletosCollection(Collection<Amortizacion> amortizacionBoletosCollection) {
        this.amortizacionBoletosCollection = amortizacionBoletosCollection;
    }

    public Usuarios getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Usuarios idUsuario) {
        this.idUsuario = idUsuario;
    }

    @XmlTransient
    public Collection<Boletos> getBoletosCollection() {
        return boletosCollection;
    }

    public void setBoletosCollection(Collection<Boletos> boletosCollection) {
        this.boletosCollection = boletosCollection;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (idFactura != null ? idFactura.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof Facturas)) {
            return false;
        }
        Facturas other = (Facturas) object;
        if ((this.idFactura == null && other.idFactura != null) || (this.idFactura != null && !this.idFactura.equals(other.idFactura))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "ec.edu.aerolineas_condor_server.model.Facturas[ idFactura=" + idFactura + " ]";
    }
    
}
