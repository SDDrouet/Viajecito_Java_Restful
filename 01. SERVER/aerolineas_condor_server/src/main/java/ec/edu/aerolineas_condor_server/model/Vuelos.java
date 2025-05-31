/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package ec.edu.aerolineas_condor_server.model;

import jakarta.json.bind.annotation.JsonbTransient;
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
@Table(name = "vuelos")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "Vuelos.findAll", query = "SELECT v FROM Vuelos v"),
    @NamedQuery(name = "Vuelos.findByIdVuelo", query = "SELECT v FROM Vuelos v WHERE v.idVuelo = :idVuelo"),
    @NamedQuery(name = "Vuelos.findByCodigoVuelo", query = "SELECT v FROM Vuelos v WHERE v.codigoVuelo = :codigoVuelo"),
    @NamedQuery(name = "Vuelos.findByValor", query = "SELECT v FROM Vuelos v WHERE v.valor = :valor"),
    @NamedQuery(name = "Vuelos.findByHoraSalida", query = "SELECT v FROM Vuelos v WHERE v.horaSalida = :horaSalida"),
    @NamedQuery(name = "Vuelos.findByCapacidad", query = "SELECT v FROM Vuelos v WHERE v.capacidad = :capacidad"),
    @NamedQuery(name = "Vuelos.findByDisponibles", query = "SELECT v FROM Vuelos v WHERE v.disponibles = :disponibles")})
public class Vuelos implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id_vuelo")
    private Integer idVuelo;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 10)
    @Column(name = "codigo_vuelo")
    private String codigoVuelo;
    // @Max(value=?)  @Min(value=?)//if you know range of your decimal fields consider using these annotations to enforce field validation
    @Basic(optional = false)
    @NotNull
    @Column(name = "valor")
    private BigDecimal valor;
    @Basic(optional = false)
    @NotNull
    @Column(name = "hora_salida")
    @Temporal(TemporalType.TIMESTAMP)
    private Date horaSalida;
    @Basic(optional = false)
    @NotNull
    @Column(name = "capacidad")
    private int capacidad;
    @Basic(optional = false)
    @NotNull
    @Column(name = "disponibles")
    private int disponibles;
    @JoinColumn(name = "id_ciudad_origen", referencedColumnName = "id_ciudad")
    @ManyToOne(optional = false)
    private Ciudades idCiudadOrigen;
    @JoinColumn(name = "id_ciudad_destino", referencedColumnName = "id_ciudad")
    @ManyToOne(optional = false)
    private Ciudades idCiudadDestino;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "idVuelo")
    private Collection<Boletos> boletosCollection;

    public Vuelos() {
    }

    public Vuelos(Integer idVuelo) {
        this.idVuelo = idVuelo;
    }

    public Vuelos(Integer idVuelo, String codigoVuelo, BigDecimal valor, Date horaSalida, int capacidad, int disponibles) {
        this.idVuelo = idVuelo;
        this.codigoVuelo = codigoVuelo;
        this.valor = valor;
        this.horaSalida = horaSalida;
        this.capacidad = capacidad;
        this.disponibles = disponibles;
    }

    public Integer getIdVuelo() {
        return idVuelo;
    }

    public void setIdVuelo(Integer idVuelo) {
        this.idVuelo = idVuelo;
    }

    public String getCodigoVuelo() {
        return codigoVuelo;
    }

    public void setCodigoVuelo(String codigoVuelo) {
        this.codigoVuelo = codigoVuelo;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public Date getHoraSalida() {
        return horaSalida;
    }

    public void setHoraSalida(Date horaSalida) {
        this.horaSalida = horaSalida;
    }

    public int getCapacidad() {
        return capacidad;
    }

    public void setCapacidad(int capacidad) {
        this.capacidad = capacidad;
    }

    public int getDisponibles() {
        return disponibles;
    }

    public void setDisponibles(int disponibles) {
        this.disponibles = disponibles;
    }

    public Ciudades getIdCiudadOrigen() {
        return idCiudadOrigen;
    }

    public void setIdCiudadOrigen(Ciudades idCiudadOrigen) {
        this.idCiudadOrigen = idCiudadOrigen;
    }

    public Ciudades getIdCiudadDestino() {
        return idCiudadDestino;
    }

    public void setIdCiudadDestino(Ciudades idCiudadDestino) {
        this.idCiudadDestino = idCiudadDestino;
    }

    @XmlTransient
    @JsonbTransient
    public Collection<Boletos> getBoletosCollection() {
        return boletosCollection;
    }

    public void setBoletosCollection(Collection<Boletos> boletosCollection) {
        this.boletosCollection = boletosCollection;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (idVuelo != null ? idVuelo.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof Vuelos)) {
            return false;
        }
        Vuelos other = (Vuelos) object;
        if ((this.idVuelo == null && other.idVuelo != null) || (this.idVuelo != null && !this.idVuelo.equals(other.idVuelo))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "ec.edu.aerolineas_condor_server.model.Vuelos[ idVuelo=" + idVuelo + " ]";
    }
    
}
