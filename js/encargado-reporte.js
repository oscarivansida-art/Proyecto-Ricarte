document.addEventListener('DOMContentLoaded', () => {
    validarAccesoEncargado();
    cargarHistorialReportes();
});

function validarAccesoEncargado() {
    const session = JSON.parse(sessionStorage.getItem('active_session'));
    if (!session || (session.role !== 'encargado' && session.role !== 'admin')) {
        alert("Acceso no autorizado.");
        window.location.href = '/';
    }
}

function enviarReporte(e) {
    e.preventDefault();
    const turno = document.getElementById('rep-turno').value;
    const estatus = document.getElementById('rep-estatus').value;
    const actividades = document.getElementById('rep-actividades').value;
    const incidencias = document.getElementById('rep-incidencias').value;
    const session = JSON.parse(sessionStorage.getItem('active_session'));

    const nuevoReporte = {
        fecha: new Date().toLocaleString(),
        usuario: session.name || 'Encargado',
        turno,
        estatus,
        actividades,
        incidencias
    };

    // Guardar en el historial local del navegador
    const reportes = JSON.parse(localStorage.getItem('reportes_diarios') || '[]');
    reportes.unshift(nuevoReporte);
    localStorage.setItem('reportes_diarios', JSON.stringify(reportes));

    alert("¡Reporte guardado con éxito!");
    document.getElementById('form-reporte').reset();
    cargarHistorialReportes();
}

function cargarHistorialReportes() {
    const reportes = JSON.parse(localStorage.getItem('reportes_diarios') || '[]');
    const contenedor = document.getElementById('historial-reportes');

    if (reportes.length === 0) {
        contenedor.innerHTML = `<p class="text-xs text-slate-500">No hay reportes registrados aún.</p>`;
        return;
    }

    contenedor.innerHTML = '';
    reportes.forEach(r => {
        contenedor.innerHTML += `
            <div class="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <div class="flex justify-between items-center text-xs">
                    <span class="font-bold text-brand-700">Turno ${r.turno} - ${r.usuario}</span>
                    <span class="text-slate-500 text-[10px]">${r.fecha}</span>
                </div>
                <p class="text-xs text-slate-600"><strong>Actividades:</strong> ${r.actividades}</p>
                ${r.incidencias ? `<p class="text-xs text-brand-700"><strong>Incidencias:</strong> ${r.incidencias}</p>` : ''}
            </div>
        `;
    });
}

function logout() { sessionStorage.removeItem('active_session'); window.location.href = '/'; }