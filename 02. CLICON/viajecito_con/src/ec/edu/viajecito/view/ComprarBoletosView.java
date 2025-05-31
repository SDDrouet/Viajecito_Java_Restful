package ec.edu.viajecito.view;

import ec.edu.viajecito.controller.BoletosController;
import ec.edu.viajecito.controller.CiudadesController;
import ec.edu.viajecito.controller.VuelosController;
import ec.edu.viajecito.model.Ciudad;
import ec.edu.viajecito.model.CompraBoletoRequest;
import ec.edu.viajecito.model.Usuario;
import ec.edu.viajecito.model.Vuelo;

import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Scanner;

public class ComprarBoletosView {

    private static final Scanner scanner = new Scanner(System.in);
    private static final SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
    static {
        sdf.setLenient(false);
    }

    public static void comprar(Usuario usuario) {
        List<Ciudad> ciudades = obtenerCiudadesDisponibles();
        if (ciudades.isEmpty()) {
            System.out.println("No hay ciudades disponibles.");
            return;
        }

        int origenIdx = pedirIndiceCiudad("origen", ciudades, -1);
        int destinoIdx = pedirIndiceCiudad("destino", ciudades, origenIdx);

        Date fechaSalida = pedirFechaSalida();

        Ciudad origen = ciudades.get(origenIdx);
        Ciudad destino = ciudades.get(destinoIdx);

        List<Vuelo> vuelosDisponibles = obtenerVuelosDisponibles(origen, destino, fechaSalida);
        if (vuelosDisponibles.isEmpty()) {
            System.out.println("No hay vuelos disponibles para la ruta y fecha seleccionadas.");
            return;
        }

        int vueloSeleccionadoIdx = pedirIndiceVuelo(vuelosDisponibles);
        Vuelo vueloSeleccionado = vuelosDisponibles.get(vueloSeleccionadoIdx);

        int cantidadBoletos = pedirCantidadBoletos(vueloSeleccionado);

        BigDecimal total = vueloSeleccionado.getValor().multiply(BigDecimal.valueOf(cantidadBoletos));
        System.out.printf("Total a pagar: $%s\n", total);

        if (!confirmar("¿Confirmar compra? (s/n): ")) {
            System.out.println("Compra cancelada.");
            return;
        }

        procesarCompra(usuario, vueloSeleccionado, cantidadBoletos);
    }

    private static List<Ciudad> obtenerCiudadesDisponibles() {
        CiudadesController ciudadesController = new CiudadesController();
        List<Ciudad> ciudades = ciudadesController.obtenerTodasCiudades();
        return ciudades != null ? ciudades : Collections.emptyList();
    }

    private static int pedirIndiceCiudad(String tipo, List<Ciudad> ciudades, int excluirIdx) {
        int idx = -1;
        while (idx < 0 || idx >= ciudades.size() || idx == excluirIdx) {
            System.out.printf("\n===== SELECCIONAR CIUDAD DE %s =====\n", tipo.toUpperCase());
            for (int i = 0; i < ciudades.size(); i++) {
                if (i == excluirIdx) continue; // Excluir ciudad ya seleccionada
                System.out.printf("%d. %s - %s\n", i + 1, ciudades.get(i).getCodigoCiudad(), ciudades.get(i).getNombreCiudad());
            }
            System.out.printf("Elija ciudad de %s: ", tipo);
            try {
                idx = Integer.parseInt(scanner.nextLine()) - 1;
                if (idx == excluirIdx) {
                    System.out.println("No puede seleccionar la misma ciudad para origen y destino.");
                    idx = -1;
                } else if (idx < 0 || idx >= ciudades.size()) {
                    System.out.println("Opción inválida, intente nuevamente.");
                }
            } catch (NumberFormatException e) {
                System.out.println("Entrada inválida, por favor ingrese un número.");
            }
        }
        return idx;
    }

    private static Date pedirFechaSalida() {
        Date fechaSalida = null;
        Date hoy = new Date();
        while (fechaSalida == null) {
            System.out.print("Ingrese fecha de salida (yyyy-MM-dd): ");
            String fechaInput = scanner.nextLine();
            try {
                fechaSalida = sdf.parse(fechaInput);
                if (fechaSalida.before(sinTiempo(hoy))) {
                    System.out.println("La fecha no puede ser anterior a hoy.");
                    fechaSalida = null;
                }
            } catch (ParseException e) {
                System.out.println("Formato inválido. Por favor ingrese la fecha en formato yyyy-MM-dd.");
            }
        }
        return fechaSalida;
    }

    private static Date sinTiempo(Date fecha) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(fecha);
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTime();
    }

    private static List<Vuelo> obtenerVuelosDisponibles(Ciudad origen, Ciudad destino, Date fechaSalida) {
        VuelosController vuelosController = new VuelosController();
        String fechaStr = sdf.format(fechaSalida);
        return vuelosController.obtenerVuelosPorCiudad(
            origen.getCodigoCiudad(),
            destino.getCodigoCiudad(),
            fechaStr
        );
    }

    private static int pedirIndiceVuelo(List<Vuelo> vuelos) {
        int idx = -1;
        while (idx < 0 || idx >= vuelos.size()) {
            System.out.println("\n===== VUELOS DISPONIBLES =====");
            for (int i = 0; i < vuelos.size(); i++) {
                Vuelo v = vuelos.get(i);
                System.out.printf("%d. Código: %s | Hora salida: %s | Precio: $%s | Disponibles: %d\n",
                        i + 1, v.getCodigoVuelo(), v.getHoraSalida(), v.getValor(), v.getDisponibles());
            }
            System.out.print("Seleccione el número de vuelo que desea comprar: ");
            try {
                idx = Integer.parseInt(scanner.nextLine()) - 1;
                if (idx < 0 || idx >= vuelos.size()) {
                    System.out.println("Opción inválida, intente nuevamente.");
                }
            } catch (NumberFormatException e) {
                System.out.println("Entrada inválida, por favor ingrese un número.");
            }
        }
        return idx;
    }

    private static int pedirCantidadBoletos(Vuelo vuelo) {
        int cantidad = -1;
        while (cantidad <= 0 || cantidad > vuelo.getDisponibles()) {
            System.out.printf("¿Cuántos boletos desea comprar? (Disponible: %d): ", vuelo.getDisponibles());
            try {
                cantidad = Integer.parseInt(scanner.nextLine());
                if (cantidad <= 0) {
                    System.out.println("La cantidad debe ser mayor que cero.");
                } else if (cantidad > vuelo.getDisponibles()) {
                    System.out.println("No hay suficientes boletos disponibles.");
                }
            } catch (NumberFormatException e) {
                System.out.println("Entrada inválida, por favor ingrese un número.");
            }
        }
        return cantidad;
    }

    private static boolean confirmar(String mensaje) {
        System.out.print(mensaje);
        String respuesta = scanner.nextLine();
        return respuesta.equalsIgnoreCase("s");
    }

    private static void procesarCompra(Usuario usuario, Vuelo vuelo, int cantidad) {
        BoletosController boletosController = new BoletosController();
        CompraBoletoRequest request = new CompraBoletoRequest();
        request.idVuelo = vuelo.getIdVuelo();
        request.idUsuario = usuario.getIdUsuario();
        request.cantidad = cantidad;

        if (boletosController.comprarBoletos(request)) {
            System.out.println("Compra exitosa.");
        } else {
            System.out.println("Error en la compra.");
        }
    }
}
