/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/WebServices/JerseyClient.java to edit this template
 */
package ec.edu.viajecito.client;

import jakarta.ws.rs.ClientErrorException;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.WebTarget;

/**
 * Jersey REST client generated for REST resource:UsuariosFacadeREST
 * [usuarios]<br>
 * USAGE:
 * <pre>
 *        UsuariosClient client = new UsuariosClient();
 *        Object response = client.XXX(...);
 *        // do whatever with response
 *        client.close();
 * </pre>
 *
 * @author Drouet
 */
public class UsuariosClient {

    private WebTarget webTarget;
    private Client client;
    private static final String BASE_URI = "http://localhost:8080/aerolineas_condor_server/api";

    public UsuariosClient() {
        client = jakarta.ws.rs.client.ClientBuilder.newClient();
        webTarget = client.target(BASE_URI).path("usuarios");
    }

    public String countREST() throws ClientErrorException {
        WebTarget resource = webTarget;
        resource = resource.path("count");
        return resource.request(jakarta.ws.rs.core.MediaType.TEXT_PLAIN).get(String.class);
    }

    public void edit(Object requestEntity, String id) throws ClientErrorException {
        webTarget.path(java.text.MessageFormat.format("{0}", new Object[]{id})).request(jakarta.ws.rs.core.MediaType.APPLICATION_JSON).put(jakarta.ws.rs.client.Entity.entity(requestEntity, jakarta.ws.rs.core.MediaType.APPLICATION_JSON));
    }

    public <T> T find(Class<T> responseType, String id) throws ClientErrorException {
        WebTarget resource = webTarget;
        resource = resource.path(java.text.MessageFormat.format("{0}", new Object[]{id}));
        return resource.request(jakarta.ws.rs.core.MediaType.APPLICATION_JSON).get(responseType);
    }

    public <T> T findRange(Class<T> responseType, String from, String to) throws ClientErrorException {
        WebTarget resource = webTarget;
        resource = resource.path(java.text.MessageFormat.format("{0}/{1}", new Object[]{from, to}));
        return resource.request(jakarta.ws.rs.core.MediaType.APPLICATION_JSON).get(responseType);
    }

    public void create(Object requestEntity) throws ClientErrorException {
        webTarget.request(jakarta.ws.rs.core.MediaType.APPLICATION_JSON).post(jakarta.ws.rs.client.Entity.entity(requestEntity, jakarta.ws.rs.core.MediaType.APPLICATION_JSON));
    }

    public <T> T findAll(Class<T> responseType) throws ClientErrorException {
        WebTarget resource = webTarget;
        return resource.request(jakarta.ws.rs.core.MediaType.APPLICATION_JSON).get(responseType);
    }
    
    public <T> T login(Class<T> responseType, String password, String username) throws ClientErrorException {
        WebTarget resource = webTarget;
        if (password != null) {
            resource = resource.queryParam("password", password);
        }
        if (username != null) {
            resource = resource.queryParam("username", username);
        }
        resource = resource.path("login");
        return resource.request(jakarta.ws.rs.core.MediaType.APPLICATION_JSON).get(responseType);
    }
    
    public void remove(String id) throws ClientErrorException {
        webTarget.path(java.text.MessageFormat.format("{0}", new Object[]{id})).request().delete();
    }

    public void close() {
        client.close();
    }
    
}
