package ec.edu.viajecito.view;

import ec.edu.viajecito.controller.BoletosController;
import ec.edu.viajecito.controller.FacturasController;
import ec.edu.viajecito.controller.VuelosController;
import ec.edu.viajecito.model.Amortizacion;
import ec.edu.viajecito.model.Boleto;
import ec.edu.viajecito.model.Factura;
import ec.edu.viajecito.model.Usuario;
import ec.edu.viajecito.model.Vuelo;

import java.text.SimpleDateFormat;
import java.util.*;

public class MenuView {

    private static final Scanner scanner = new Scanner(System.in);
    private static final VuelosController vuelosController = new VuelosController();
    private static final BoletosController boletosController = new BoletosController();
    private static final FacturasController facturasController = new FacturasController();

    public static void mostrar(Usuario usuario) {
        while (true) {
            System.out.println("\n===== MENÚ PRINCIPAL =====");
            System.out.println("1. Ver mis boletos");
            System.out.println("2. Ver todos los vuelos");
            System.out.println("3. Comprar boletos");
            System.out.println("4. Ver mis facturas");
            System.out.println("5. Cerrar sesión");
            System.out.print("Seleccione una opción: ");

            String opcion = scanner.nextLine();

            switch (opcion) {
                case "1":
                    verBoletos(usuario);
                    break;
                case "2":
                    verVuelos();
                    break;
                case "3":
                    ComprarBoletosView.comprar(usuario);
                    break;
                case "4":
                    verFacturas(usuario);
                    break;
                case "5":
                    System.out.println("Sesión cerrada.");
                    return;
                default:
                    System.out.println("Opción inválida.");
            }
        }
    }

    private static void verBoletos(Usuario usuario) {
        List<Boleto> boletos = boletosController.obtenerBoletosPorUsuario(usuario.getIdUsuario().toString());

        System.out.println("\n===== TUS BOLETOS =====");
        if (boletos == null || boletos.isEmpty()) {
            System.out.println("No tienes boletos.");
            return;
        }

        System.out.printf("%-18s %-10s %-22s %-10s\n", "Número Boleto", "ID Vuelo", "Fecha Compra", "Precio");
        System.out.println("---------------------------------------------------------------");
        
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");

        for (Boleto boleto : boletos) {
            String fecha = boleto.getFechaCompra() != null ? sdf.format(boleto.getFechaCompra()) : "N/A";

            System.out.printf("%-18s %-10d %-22s $%-8.2f\n",
                    boleto.getNumeroBoleto(),
                    boleto.getIdVuelo().getIdVuelo(),
                    fecha,
                    boleto.getPrecioCompra());
        }
    }

    private static void verVuelos() {
        List<Vuelo> vuelos = vuelosController.obtenerTodosVuelos();

        System.out.println("\n===== TODOS LOS VUELOS =====");
        if (vuelos == null || vuelos.isEmpty()) {
            System.out.println("No hay vuelos disponibles.");
            return;
        }

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
        System.out.printf("%-5s %-10s %-15s %-15s %-20s %-10s %-10s\n",
                "ID", "Código", "Origen", "Destino", "Hora Salida", "Precio", "Disponibles");

        for (Vuelo vuelo : vuelos) {
            String hora = vuelo.getHoraSalida() != null ? sdf.format(vuelo.getHoraSalida()) : "N/A";
            System.out.printf("%-5d %-10s %-15s %-15s %-20s $%-9.2f %-10d\n",
                    vuelo.getIdVuelo(),
                    vuelo.getCodigoVuelo(),
                    vuelo.getCiudadOrigen().getNombreCiudad(),
                    vuelo.getCiudadDestino().getNombreCiudad(),
                    hora,
                    vuelo.getValor(),
                    vuelo.getDisponibles());
        }
    }

    private static void verFacturas(Usuario usuario) {
        List<Factura> facturas = facturasController.obtenerFacturasPorUsuario(usuario.getIdUsuario());

        System.out.println("\n===== TUS FACTURAS =====");
        if (facturas == null || facturas.isEmpty()) {
            System.out.println("No tienes facturas registradas.");
            return;
        }

        System.out.printf("%-5s %-15s %-20s %-15s %-15s\n", "N°", "Número", "Fecha", "Sin IVA", "Con IVA");

        int index = 1;
        for (Factura factura : facturas) {
            String fecha = new SimpleDateFormat("yyyy-MM-dd HH:mm").format(factura.getFechaFactura());
            System.out.printf("%-5d %-15s %-20s $%-13.2f $%-13.2f\n",
                    index++,
                    factura.getNumeroFactura(),
                    fecha,
                    factura.getPrecioSinIva(),
                    factura.getPrecioConIva());
        }

        System.out.print("\nSeleccione el número de factura para ver detalles (0 para salir): ");
        String opcion = scanner.nextLine();

        if ("0".equals(opcion)) return;

        try {
            int seleccion = Integer.parseInt(opcion);

            if (seleccion < 1 || seleccion > facturas.size()) {
                System.out.println("Opción inválida.");
                return;
            }

            Factura detalle = facturas.get(seleccion - 1);

            mostrarDetalleFactura(detalle.getIdFactura(), usuario);

        } catch (NumberFormatException e) {
            System.out.println("Entrada inválida. Por favor ingrese un número.");
        }
    }


    private static void mostrarDetalleFactura(int idFactura, Usuario usuario) {               
        Factura factura = facturasController.obtenerFacturaPorId(idFactura);
        
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
        System.out.println("\nFactura: " + factura.getNumeroFactura());
        System.out.println("Vendedor: Viajecitos S.A.\t\tRUC:1710708973001");
        String fechaFactura = factura.getFechaFactura() != null ? sdf.format(factura.getFechaFactura()) : "N/A";
        System.out.println("Fecha de emisión: " + fechaFactura);

        System.out.println("\nDatos del usuario");
        System.out.println("Nombre Cliente: " + usuario.getNombre());
        System.out.println("Cédula: " + usuario.getCedula());
        System.out.println("Teléfono: " + usuario.getTelefono());
        System.out.println("Correo: " + usuario.getCorreo());

        System.out.println("\nDetalle de la factura");
        System.out.printf("%-15s %-35s %-10s %-15s\n",
                "numBoleto", "Detalle", "cantidad", "precioUnitario");

        double subtotal = 0;

        for (Boleto boleto : factura.getBoletosCollection()) {
            Vuelo vuelo = vuelosController.obtenerVueloPorId(boleto.getIdVuelo().getIdVuelo().toString());
            String ciudadOrigen = vuelo.getCiudadOrigen().getNombreCiudad();
            String ciudadDestino = vuelo.getCiudadDestino().getNombreCiudad();
            String fecha = new SimpleDateFormat("yyyy-MM-dd HH:mm").format(vuelo.getHoraSalida());
            String detalle = ciudadOrigen + " - " + ciudadDestino + " - " + fecha;

            System.out.printf("%-15s %-35s %-10d $%-13.2f\n",
                    boleto.getNumeroBoleto(),
                    detalle,
                    1,
                    boleto.getPrecioCompra());

            subtotal += boleto.getPrecioCompra().doubleValue();
        }

        double iva = subtotal * 0.15;
        double total = subtotal + iva;

        System.out.printf("\n%-20s $%.2f\n", "subtotal", subtotal);
        System.out.printf("%-20s $%.2f\n", "descuento", 0.0);
        System.out.printf("%-20s $%.2f\n", "IVA 15%", iva);
        System.out.printf("%-20s $%.2f\n", "total", total);
        
        List<Amortizacion> amortizaciones = facturasController.obtenerAmortizacionPorFactura(factura.getIdFactura());

        if (amortizaciones != null && !amortizaciones.isEmpty()) {
            System.out.println("\nEsta factura fue pagada a crédito (diferido).");

            while (true) {
                System.out.println("\n1. Ver tabla de amortización");
                System.out.println("2. Salir");
                System.out.print("Seleccione una opción: ");
                String opcion = scanner.nextLine();

                if (opcion.equals("1")) {
                    mostrarTablaAmortizacion(amortizaciones);
                } else if (opcion.equals("2")) {
                    break;
                } else {
                    System.out.println("Opción inválida.");
                }
            }
        } else {
            System.out.println("\nEsta factura fue pagada al contado.");
        }
    }

    private static void mostrarTablaAmortizacion(List<Amortizacion> tabla) {
        System.out.println("\n===== TABLA DE AMORTIZACIÓN =====");
        System.out.printf("%-6s %-14s %-10s %-10s %-10s\n",
                "Cuota", "Valor Cuota", "Interés", "Capital", "Saldo");
        for (Amortizacion a : tabla) {
            System.out.printf("%-6d $%-13.2f $%-9.2f $%-9.2f $%-9.2f\n",
                    a.getNumeroCuota(),
                    a.getValorCuota(),
                    a.getInteresPagado(),
                    a.getCapitalPagado(),
                    a.getSaldo());
        }
    }
}
