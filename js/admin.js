document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener la sesión guardada en sessionStorage
    const activeSession = JSON.parse(sessionStorage.getItem('active_session'));

    // 2. Validar que exista una sesión
    if (!activeSession) {
        alert("Debes iniciar sesión para acceder al panel de administración.");
        window.location.href = '/'; // Redirige al login en la raíz
        return;
    }

    // 3. Validar de forma estricta el rol de Administrador
    if (activeSession.role !== 'admin') {
        alert("Acceso denegado: No tienes permisos de Administrador para esta sección.");
        
        // Redirige según el rol que sí tenga el usuario
        if (activeSession.role === 'encargado') {
            window.location.href = '../encargado/dashboard.html';
        } else {
            window.location.href = '/';
        }
        return;
    }

    // 4. Si la autenticación es correcta, cargar los datos en la interfaz
    renderAdminProfile(activeSession);
});

// Renderiza el nombre y avatar del Administrador en el Topbar
function renderAdminProfile(user) {
    const adminNameEl = document.getElementById('admin-name');
    const adminAvatarEl = document.getElementById('admin-avatar');

    if (adminNameEl) {
        adminNameEl.textContent = user.name || user.email.split('@')[0];
    }

    if (adminAvatarEl && (user.name || user.email)) {
        const initial = (user.name || user.email).charAt(0).toUpperCase();
        adminAvatarEl.textContent = initial;
    }
}

// Función global para cerrar sesión y regresar al login principal
function logout() {
    sessionStorage.removeItem('active_session');
    window.location.href = '/';
}