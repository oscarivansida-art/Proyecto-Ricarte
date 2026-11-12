async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        // Petición HTTP al servidor de base de datos
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Error al iniciar sesión");
            return;
        }

        // Guardar datos de sesión recibidos desde la BD SQL
        sessionStorage.setItem('active_session', JSON.stringify(data));

        // Redireccionar según el rol recibido de la BD
        if (data.role === 'admin') {
            window.location.href = 'admin/dashboard.html';
        } else if (data.role === 'encargado') {
            window.location.href = 'encargado/dashboard.html';
        }
    } catch (error) {
        console.error("Error de conexión de red:", error);
        alert("No se pudo conectar con el servidor. Inicia la aplicación con npm start e inténtalo de nuevo.");
    }
}