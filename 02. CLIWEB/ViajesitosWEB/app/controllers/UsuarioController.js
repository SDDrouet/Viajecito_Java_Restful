const BASE_URL = 'http://10.69.99.199:8080/aerolineas_condor_server/api';

// 🔹 LOGIN
export const login = async (username, password) => {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/login?username=${username}&password=${password}`);
    if (!response.ok) return null;

    const u = await response.json();
    return u?.idUsuario ? {
      IdUsuario: u.idUsuario,
      Nombre: u.nombre,
      Username: u.username,
      Password: u.password,
      Telefono: u.telefono,
      Cedula: u.cedula,
      Correo: u.correo
    } : null;
  } catch (error) {
    console.error('❌ Error al iniciar sesión (REST):', error);
    return null;
  }
};

// 🔹 CREAR USUARIO
export const crearUsuario = async (usuario) => {
  try {
    const response = await fetch(`${BASE_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idUsuario: usuario.IdUsuario || 0,
        nombre: usuario.Nombre,
        username: usuario.Username,
        password: usuario.Password,
        telefono: usuario.Telefono,
        cedula: usuario.Cedula,
        correo: usuario.Correo
      })
    });

    return response.ok;
  } catch (error) {
    console.error('❌ Error al crear usuario (REST):', error);
    return false;
  }
};

// 🔹 EDITAR USUARIO
export const editarUsuario = async (usuario) => {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/${usuario.IdUsuario}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idUsuario: usuario.IdUsuario,
        nombre: usuario.Nombre,
        username: usuario.Username,
        password: usuario.Password,
        telefono: usuario.Telefono,
        cedula: usuario.Cedula,
        correo: usuario.Correo
      })
    });

    return response.ok;
  } catch (error) {
    console.error('❌ Error al editar usuario (REST):', error);
    return false;
  }
};

// 🔹 ELIMINAR USUARIO
export const eliminarUsuario = async (idUsuario) => {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/${idUsuario}`, {
      method: 'DELETE'
    });

    return response.ok;
  } catch (error) {
    console.error('❌ Error al eliminar usuario (REST):', error);
    return false;
  }
};

// 🔹 OBTENER TODOS LOS USUARIOS
export const getUsuarios = async () => {
  try {
    const response = await fetch(`${BASE_URL}/usuarios`);
    if (!response.ok) throw new Error('No se pudo obtener la lista de usuarios');

    const usuarios = await response.json();

    return usuarios.map(u => ({
      IdUsuario: u.idUsuario,
      Nombre: u.nombre,
      Username: u.username,
      Password: u.password,
      Telefono: u.telefono,
      Cedula: u.cedula,
      Correo: u.correo
    }));
  } catch (error) {
    console.error('❌ Error al obtener usuarios (REST):', error);
    return [];
  }
};

// 🔹 OBTENER USUARIO POR ID
export const obtenerUsuarioPorId = async (idUsuario) => {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/${idUsuario}`);
    if (!response.ok) throw new Error('Usuario no encontrado');

    const u = await response.json();

    return {
      IdUsuario: u.idUsuario,
      Nombre: u.nombre,
      Username: u.username,
      Password: u.password,
      Telefono: u.telefono,
      Cedula: u.cedula,
      Correo: u.correo
    };
  } catch (error) {
    console.error('❌ Error al obtener usuario por ID (REST):', error);
    return null;
  }
};
