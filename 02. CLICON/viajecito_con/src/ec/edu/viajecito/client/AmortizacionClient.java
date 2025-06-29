/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/WebServices/JerseyClient.java to edit this template
 */
package ec.edu.viajecito.client;

import jakarta.ws.rs.ClientErrorException;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.GenericType;

/**
 * Jersey REST client generated for REST resource:AmortizacionBoletosFacadeREST
 * [amortizacion]<br>
 * USAGE:
 * <pre>
 *        AmortizacionClient client = new AmortizacionClient();
 *        Object response = client.XXX(...);
 *        // do whatever with response
 *        client.close();
 * </pre>
 *
 * @author Drouet
 */
public class AmortizacionClient {

    private WebTarget webTarget;
    private Client client;
    private static final String BASE_URI = "http://localhost:8080/aerolineas_condor_server/api";

    public AmortizacionClient() {
        client = jakarta.ws.rs.client.ClientBuilder.newClient();
        webTarget = client.target(BASE_URI).path("amortizacion");
    }

    public <T> T obtenerPorFactura(GenericType<T> responseType, String idFactura) throws ClientErrorException {
        WebTarget resource = webTarget;
        resource = resource.path(java.text.MessageFormat.format("factura/{0}", new Object[]{idFactura}));
        return resource.request(jakarta.ws.rs.core.MediaType.APPLICATION_JSON).get(responseType);
    }
  
    public void close() {
        client.close();
    }
    
}
