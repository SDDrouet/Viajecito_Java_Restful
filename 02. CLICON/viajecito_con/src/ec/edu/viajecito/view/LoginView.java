package ec.edu.viajecito.view;

import ec.edu.viajecito.controller.UsuariosController;
import ec.edu.viajecito.model.Usuario;
import java.util.Scanner;

public class LoginView {

    private static final Scanner scanner = new Scanner(System.in);

    public static void mostrar() {
        while (true) {
            System.out.println("===== BIENVENIDO =====");
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
                    System.out.println("Opción inválida");
            }
        }
    }

    private static void iniciarSesion() {
        System.out.print("Usuario: ");
        String username = scanner.nextLine();
        System.out.print("Contraseña: ");
        String password = scanner.nextLine();

        UsuariosController controller = new UsuariosController();
        Usuario usuario = controller.login(username, password);

        if (usuario != null && usuario.getIdUsuario() != null) {
            System.out.println("Inicio de sesión exitoso.");
            MenuView.mostrar(usuario);
        } else {
            System.out.println("Credenciales inválidas.");
        }
    }

    private static void registrarse() {
        Usuario usuario = new Usuario();

        System.out.print("Nombre: ");
        usuario.setNombre(scanner.nextLine());
        System.out.print("Username: ");
        usuario.setUsername(scanner.nextLine());
        System.out.print("Contraseña: ");
        usuario.setPassword(scanner.nextLine());
        System.out.print("Teléfono: ");
        usuario.setTelefono(scanner.nextLine());

        UsuariosController controller = new UsuariosController();
        if (controller.crearUsuario(usuario)) {
            System.out.println("Usuario registrado exitosamente.");
        } else {
            System.out.println("Error al registrar usuario.");
        }
    }
}
