package ec.edu.viajecito.view;

import ec.edu.viajecito.controller.BoletosController;
import ec.edu.viajecito.controller.VuelosController;
import ec.edu.viajecito.model.Boleto;
import ec.edu.viajecito.model.Usuario;
import ec.edu.viajecito.model.Vuelo;
import java.text.SimpleDateFormat;

import java.util.List;
import java.util.Scanner;

public class MenuView {

    private static final Scanner scanner = new Scanner(System.in);

    public static void mostrar(Usuario usuario) {
        while (true) {
            System.out.println("\n===== MENÚ PRINCIPAL =====");
            System.out.println("1. Ver mis boletos");
            System.out.println("2. Ver todos los vuelos");
            System.out.println("3. Comprar boletos");
            System.out.println("4. Cerrar sesión");
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
                    System.out.println("Sesión cerrada.");
                    return;
                default:
                    System.out.println("Opción inválida.");
            }
        }
    }

    private static void verBoletos(Usuario usuario) {
        BoletosController controller = new BoletosController();
        List<Boleto> boletos = controller.obtenerBoletosPorUsuario(usuario.getIdUsuario().toString());

        System.out.println("\n===== TUS BOLETOS =====");
        if (boletos == null || boletos.isEmpty()) {
            System.out.println("No tienes boletos.");
        } else {
            // Encabezado tabla
            System.out.printf("%-18s\t%-10s\t%-30s\t%-10s\n", "Número Boleto", "Vuelo", "Fecha Compra", "Precio");
            System.out.println("-------------------------------------------------------------------------------------------------");

            for (Boleto boleto : boletos) {
                
                System.out.printf("%-18s\t%-10s\t%-30s\t$%-9s\n",
                        boleto.getNumeroBoleto(),
                        boleto.getVuelo().getCodigoVuelo(),
                        boleto.getFechaCompra(),
                        boleto.getPrecioCompra());
            }
        }
    }



    private static void verVuelos() {
        VuelosController controller = new VuelosController();
        List<Vuelo> vuelos = controller.obtenerTodosVuelos();

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");

        // Encabezado
        System.out.printf("%-5s\t%-10s\t%-15s\t%-15s\t%-16s\t%-10s\t%-10s\n",
                "ID", "Código", "Origen", "Destino", "Hora Salida", "Precio", "Disponibles");
        System.out.println("-----------------------------------------------------------------------------------------------------------------------");

        for (Vuelo vuelo : vuelos) {
            String horaSalidaFormateada = vuelo.getHoraSalida() != null ? sdf.format(vuelo.getHoraSalida()) : "N/A";

            System.out.printf("%-5d\t%-10s\t%-15s\t%-15s\t%-16s\t$%-9s\t%-10d\n",
                    vuelo.getIdVuelo(),
                    vuelo.getCodigoVuelo(),
                    vuelo.getCiudadOrigen().getNombreCiudad(),
                    vuelo.getCiudadDestino().getNombreCiudad(),
                    horaSalidaFormateada,
                    vuelo.getValor(),
                    vuelo.getDisponibles());
        }
    }


}
