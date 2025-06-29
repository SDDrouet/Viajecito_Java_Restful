package ec.edu.viajecito.view;

import ec.edu.viajecito.controller.UsuariosController;
import ec.edu.viajecito.model.Usuario;
import java.util.Scanner;
import java.util.regex.Pattern;

public class LoginView {

    private static final Scanner scanner = new Scanner(System.in);
    private static final UsuariosController controller = new UsuariosController();

    public static void mostrar() {
        while (true) {
            System.out.println("===== BIENVENIDO MONSTER VIAJECITOS =====");
            System.out.println("1. Iniciar Sesión");
            System.out.println("2. Registrarse");
            System.out.println("3. Salir");
            System.out.print("Seleccione una opción: ");
            String opcion = scanner.nextLine();

            switch (opcion) {
                case "1":
                    iniciarSesion();
                    break;
                case "2":
                    registrarse();
                    break;
                case "3":
                    System.out.println("¡Hasta luego!");
                    return;
                default:
                    System.out.println("Opción inválida\n");
            }
        }
    }

    private static void iniciarSesion() {
        System.out.print("Usuario: ");
        String username = scanner.nextLine().trim();
        System.out.print("Contraseña: ");
        String password = scanner.nextLine().trim();

        if (username.isBlank() || password.isBlank()) {
            System.out.println("Usuario y contraseña son obligatorios.\n");
            return;
        }

        Usuario usuario = controller.login(username, password);
        if (usuario != null && usuario.getIdUsuario() != null && usuario.getIdUsuario() > 0) {
            System.out.println("\nInicio de sesión exitoso. Bienvenido " + usuario.getNombre() + "!\n");
            MenuView.mostrar(usuario);
        } else {
            System.out.println("Credenciales inválidas.\n");
        }
    }

    private static void registrarse() {
        Usuario nuevo = new Usuario();

        System.out.print("Nombre: ");
        nuevo.setNombre(scanner.nextLine().trim());
        System.out.print("Username: ");
        nuevo.setUsername(scanner.nextLine().trim());
        System.out.print("Contraseña: ");
        nuevo.setPassword(scanner.nextLine().trim());
        System.out.print("Teléfono: ");
        nuevo.setTelefono(scanner.nextLine().trim());
        System.out.print("Cédula: ");
        nuevo.setCedula(scanner.nextLine().trim());
        System.out.print("Correo: ");
        nuevo.setCorreo(scanner.nextLine().trim());

        // Validaciones
        if (nuevo.getNombre().isBlank() || nuevo.getUsername().isBlank() || nuevo.getPassword().isBlank()
                || nuevo.getCedula().isBlank() || nuevo.getCorreo().isBlank()) {
            System.out.println("Nombre, username, contraseña, cédula y correo son obligatorios.\n");
            return;
        }

        if (!nuevo.getTelefono().isBlank()) {
            if (!nuevo.getTelefono().matches("\\d+")) {
                System.out.println("El teléfono debe contener solo números.\n");
                return;
            }
            if (nuevo.getTelefono().length() != 10) {
                System.out.println("El número de teléfono debe tener exactamente 10 dígitos.\n");
                return;
            }
        }

        if (!nuevo.getCedula().matches("\\d{8,10}")) {
            System.out.println("La cédula debe contener solo números y tener entre 8 y 10 dígitos.\n");
            return;
        }

        if (!Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$").matcher(nuevo.getCorreo()).matches()) {
            System.out.println("El correo electrónico no tiene un formato válido.\n");
            return;
        }

        boolean exito = controller.crearUsuario(nuevo);
        System.out.println(exito ? "Usuario registrado exitosamente.\n"
                                 : "Error al registrar usuario. Puede que el username ya exista.\n");
    }
}
