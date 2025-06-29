/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package ec.edu.viajecito.controller;

import ec.edu.viajecito.client.AmortizacionClient;
import ec.edu.viajecito.client.FacturasClient;
import ec.edu.viajecito.model.Amortizacion;
import ec.edu.viajecito.model.Factura;
import jakarta.ws.rs.core.GenericType;
import java.util.List;

/**
 *
 * @author Drouet
 */
public class FacturasController {
    
    public Factura obtenerFacturaPorId(int idFactura) {
        FacturasClient client = new FacturasClient();
        try {
            Factura factura = client.find(Factura.class, String.valueOf(idFactura));
            return factura;
        } finally {
            client.close();
        }
    }
    
    public List<Factura> obtenerFacturasPorUsuario(int IdUsuario) {
        FacturasClient client = new FacturasClient();
        try {
            List<Factura> facturas = client.findByUsuario(new GenericType<List<Factura>>() {}, String.valueOf(IdUsuario));
            return facturas;
        } finally {
            client.close();
        }
    }
    
    public List<Amortizacion> obtenerAmortizacionPorFactura(Integer idFactura) {
        AmortizacionClient client = new AmortizacionClient();
        try {
            List<Amortizacion> facturas = client.obtenerPorFactura(new GenericType<List<Amortizacion>>() {}, idFactura.toString());
            return facturas;
        } finally {
            client.close();
        }
    }
    
}
