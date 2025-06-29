/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package ec.edu.viajecito.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author Drouet
 */
public class Amortizacion {
    private Integer idAmortizacion;
    private int numeroCuota;
    private BigDecimal valorCuota;
    private BigDecimal interesPagado;
    private BigDecimal capitalPagado;
    private BigDecimal saldo;

    public Amortizacion() {
    }

    public Amortizacion(Integer idAmortizacion, int numeroCuota, BigDecimal valorCuota, BigDecimal interesPagado, BigDecimal capitalPagado, BigDecimal saldo) {
        this.idAmortizacion = idAmortizacion;
        this.numeroCuota = numeroCuota;
        this.valorCuota = valorCuota;
        this.interesPagado = interesPagado;
        this.capitalPagado = capitalPagado;
        this.saldo = saldo;
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
    
    public static List<Amortizacion> calcularAmortizacion(double monto, int cuotas, double tasaAnual) {
        List<Amortizacion> tabla = new ArrayList<>();

        double tasaMensual = tasaAnual / 12.0 / 100.0;
        double cuotaFija = monto * (tasaMensual / (1 - Math.pow(1 + tasaMensual, -cuotas)));

        double saldo = monto;
        double interesTotal = 0;

        for (int i = 1; i <= cuotas; i++) {
            double interes = saldo * tasaMensual;
            double capital = cuotaFija - interes;
            saldo -= capital;
            interesTotal += interes;

            Amortizacion fila = new Amortizacion();
            fila.setIdAmortizacion(0); // Asigna 0 por defecto o un valor autogenerado si corresponde
            fila.setNumeroCuota(i);
            fila.setValorCuota(new BigDecimal(cuotaFija));
            fila.setInteresPagado(new BigDecimal(interes));
            fila.setCapitalPagado(new BigDecimal(capital));
            fila.setSaldo(new BigDecimal(saldo));

            tabla.add(fila);
        }

        return tabla;
    }
    
}
