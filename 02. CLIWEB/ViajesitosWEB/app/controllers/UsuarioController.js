const API_URL = 'http://192.168.18.158:8080/aerolineas_condor_server/api/usuarios'; // Cambia a IP o localhost según el caso

export const login = async (username, password) => {
  try {
    const query = `?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const response = await fetch(`${API_URL}/login${query}`, {
      method: 'GET'
    });

    // Si la respuesta no tiene contenido, evita intentar parsear JSON
    if (!response.ok) {
      console.error('❌ Error HTTP:', response.status);
      return null;
    }

    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('❌ Respuesta sin JSON esperado');
      return null;
    }

    const usuario = await response.json();

    if (!usuario || !usuario.idUsuario) return null;

    return {
      idUsuario: usuario.idUsuario,
      nombre: usuario.nombre,
      username: usuario.username,
      password: usuario.password,
      telefono: usuario.telefono
    };
  } catch (error) {
    console.error('❌ Error al hacer login:', error);
    return null;
  }
};


// CREAR USUARIO
export const crearUsuario = async (usuario) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario)
    });

    return response.ok;
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    return false;
  }
};

// ACTUALIZAR USUARIO
export const editarUsuario = async (id, usuario) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario)
    });

    return response.ok;
  } catch (error) {
    console.error('❌ Error al editar usuario:', error);
    return false;
  }
};

// ELIMINAR USUARIO
export const eliminarUsuario = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    return response.ok;
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    return false;
  }
};

// OBTENER TODOS LOS USUARIOS
export const getUsuarios = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return await response.json();
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    return [];
  }
};
