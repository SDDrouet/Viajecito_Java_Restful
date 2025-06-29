package ec.edu.viajecito.view;

import ec.edu.viajecito.controller.BoletosController;
import ec.edu.viajecito.controller.CiudadesController;
import ec.edu.viajecito.controller.VuelosController;
import ec.edu.viajecito.model.Amortizacion;
import ec.edu.viajecito.model.Ciudad;
import ec.edu.viajecito.model.CompraBoletoRequest;
import ec.edu.viajecito.model.Usuario;
import ec.edu.viajecito.model.Vuelo;
import ec.edu.viajecito.model.VueloCompra;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

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

        List<VueloCompra> listaVuelos = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        do {
            int origenIdx = pedirIndiceCiudad("origen", ciudades, -1);
            int destinoIdx = pedirIndiceCiudad("destino", ciudades, origenIdx);
            Date fechaSalida = pedirFechaSalida();

            Ciudad ciudadOrigen = ciudades.get(origenIdx);
            Ciudad ciudadDestino = ciudades.get(destinoIdx);

            List<Vuelo> vuelos = obtenerVuelosDisponibles(ciudadOrigen, ciudadDestino, fechaSalida);
            if (vuelos.isEmpty()) {
                System.out.println("No hay vuelos disponibles para esa fecha.");
                continue;
            }

            int vueloIdx = pedirIndiceVuelo(vuelos);
            Vuelo vueloSeleccionado = vuelos.get(vueloIdx);

            int cantidad = pedirCantidadBoletos(vueloSeleccionado);

            BigDecimal subtotal = vueloSeleccionado.getValor().multiply(BigDecimal.valueOf(cantidad));
            total = total.add(subtotal);

            listaVuelos.add(new VueloCompra(vueloSeleccionado.getIdVuelo(), cantidad));

            System.out.printf("Subtotal actual (sin IVA): $%.2f\n", total);

        } while (confirmar("¿Desea agregar otro vuelo a la compra? (s/n): "));

        BigDecimal iva = total.multiply(BigDecimal.valueOf(0.15));
        BigDecimal totalConIVA = total.add(iva);

        System.out.printf("Total actual (con IVA): $%.2f\n", totalConIVA);

        boolean esCredito = confirmar("¿Desea pagar a crédito? (s/n): ");
        int cuotas = 1;
        double tasaInteres = 16.5;
        BigDecimal totalFinal = totalConIVA;

        if (esCredito) {
            cuotas = pedirEntero("Ingrese el número de cuotas mensuales (2 o más): ", 2);
            double cuotaMensual = calcularCuotaMensual(totalConIVA.doubleValue(), tasaInteres, cuotas);
            mostrarResumenCredito(totalConIVA.doubleValue(), cuotaMensual, cuotas);

            totalFinal = BigDecimal.valueOf(cuotaMensual).multiply(BigDecimal.valueOf(cuotas)).setScale(2, RoundingMode.HALF_UP);

            if (!confirmar("¿Desea continuar con esta forma de pago? (s/n): ")) {
                System.out.println("Compra cancelada.");
                return;
            }
        }

        System.out.printf("Total a pagar: $%.2f\n", totalFinal);

        if (!confirmar("¿Confirmar compra total? (s/n): ")) {
            System.out.println("Compra cancelada.");
            return;
        }

        CompraBoletoRequest request = new CompraBoletoRequest();
        request.setIdUsuario(usuario.getIdUsuario());
        request.setVuelos(listaVuelos);
        request.setEsCredito(esCredito);
        request.setNumeroCuotas(cuotas);
        request.setTasaInteresAnual(tasaInteres);

        BoletosController boletosController = new BoletosController();
        boolean result = boletosController.comprarBoletos(request);

        System.out.println(result ? "Compra realizada con éxito." : "Error en la compra.");
    }

    private static List<Ciudad> obtenerCiudadesDisponibles() {
        CiudadesController ciudadesController = new CiudadesController();
        List<Ciudad> ciudades = ciudadesController.obtenerTodasCiudades();
        return ciudades != null ? ciudades : Collections.emptyList();
    }

    private static int pedirIndiceCiudad(String tipo, List<Ciudad> ciudades, int excluir) {
        int idx = -1;
        while (idx < 0 || idx >= ciudades.size() || idx == excluir) {
            System.out.printf("\n===== SELECCIONAR CIUDAD DE %s =====\n", tipo.toUpperCase());
            for (int i = 0; i < ciudades.size(); i++) {
                if (i == excluir) continue;
                System.out.printf("%d. %s - %s\n", i + 1, ciudades.get(i).getCodigoCiudad(), ciudades.get(i).getNombreCiudad());
            }
            System.out.printf("Elija ciudad de %s: ", tipo);
            try {
                idx = Integer.parseInt(scanner.nextLine()) - 1;
                if (idx == excluir) {
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
        Date hoy = sinTiempo(new Date());
        while (fechaSalida == null) {
            System.out.print("Ingrese fecha de salida (yyyy-MM-dd): ");
            String input = scanner.nextLine();
            try {
                fechaSalida = sdf.parse(input);
                if (fechaSalida.before(hoy)) {
                    System.out.println("La fecha no puede ser anterior a hoy.");
                    fechaSalida = null;
                }
            } catch (ParseException e) {
                System.out.println("Formato inválido.");
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
        return vuelosController.obtenerVuelosPorCiudad(origen.getCodigoCiudad(), destino.getCodigoCiudad(), fechaStr);
    }

    private static int pedirIndiceVuelo(List<Vuelo> vuelos) {
        int idx = -1;
        while (idx < 0 || idx >= vuelos.size()) {
            System.out.println("\n===== VUELOS DISPONIBLES =====");
            for (int i = 0; i < vuelos.size(); i++) {
                Vuelo v = vuelos.get(i);
                System.out.printf("%d. Código: %s | Hora salida: %s | Precio: $%.2f | Disponibles: %d\n",
                        i + 1,
                        v.getCodigoVuelo(),
                        v.getHoraSalida() != null ? sdf.format(v.getHoraSalida()) : "N/A",
                        v.getValor().doubleValue(),
                        v.getDisponibles());
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

    private static int pedirEntero(String mensaje, int minimo) {
        int valor;
        do {
            System.out.print(mensaje);
            try {
                valor = Integer.parseInt(scanner.nextLine());
            } catch (NumberFormatException e) {
                valor = -1;
            }
        } while (valor < minimo);
        return valor;
    }

    private static double calcularCuotaMensual(double monto, double tasaAnual, int cuotas) {
        double tasaMensual = tasaAnual / 12.0 / 100.0;
        return monto * tasaMensual / (1 - Math.pow(1 + tasaMensual, -cuotas));
    }

    private static void mostrarResumenCredito(double monto, double cuota, int cuotas) {
        double totalPagar = cuota * cuotas;
        double interesTotal = totalPagar - monto;

        System.out.println("\n===== RESUMEN DE CRÉDITO =====");
        System.out.printf("Monto original: $%.2f\n", monto);
        System.out.printf("Cuotas: %d\n", cuotas);
        System.out.printf("Cuota mensual: $%.2f\n", cuota);
        System.out.printf("Total a pagar: $%.2f\n", totalPagar);
        System.out.printf("Interés total: $%.2f\n", interesTotal);
    }
}
