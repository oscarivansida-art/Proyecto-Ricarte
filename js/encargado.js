document.addEventListener('DOMContentLoaded', () => {
    // Leer los datos de la sesión guardados por auth.js
    const activeSession = JSON.parse(sessionStorage.getItem('active_session'));

    // 1. Validar que exista una sesión activa
    if (!activeSession) {
        alert("Debes iniciar sesión para acceder al panel de encargado.");
        window.location.href = '/'; // Regresa al login
        return;
    }

    // 2. Comprobar que el rol tenga permisos suficientes ('encargado' o 'admin')
    if (activeSession.role !== 'encargado' && activeSession.role !== 'admin') {
        alert("Acceso denegado: No tienes permisos para este panel.");
        window.location.href = '/';
        return;
    }

    // 3. Cargar la información del perfil
    renderUserProfile(activeSession);
    cargarRegistros();
});

const STORAGE_KEY = 'registros_operativos';

function cargarRegistros() {
    const storedRecords = localStorage.getItem(STORAGE_KEY);
    const records = storedRecords === null
        ? [
            { id: 'demo-1', actividad: 'Revisión de inventario en almacén A', prioridad: 'Alta', hora: '11:30', completado: false },
            { id: 'demo-2', actividad: 'Verificación de equipo operativo', prioridad: 'Media', hora: '09:00', completado: true }
        ]
        : JSON.parse(storedRecords);

    if (!Array.isArray(records)) {
        throw new Error('El historial de operaciones guardado no tiene un formato válido.');
    }

    if (storedRecords === null) guardarRegistros(records);
    renderizarRegistros(records);
}

function guardarRegistros(records) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
        console.error('No se pudieron guardar los registros operativos:', error);
        alert('No se pudo guardar el registro en este navegador.');
        return false;
    }

    return true;
}

function renderizarRegistros(records) {
    const tbody = document.getElementById('tareas-table-body');
    const completadas = records.filter(record => record.completado).length;
    const pendientesPrioritarios = records.filter(record => !record.completado && record.prioridad === 'Alta').length;

    document.getElementById('tareas-completadas').textContent = `${completadas} / ${records.length}`;
    document.getElementById('tareas-pendientes').textContent = `${pendientesPrioritarios} Registros`;
    tbody.replaceChildren();

    records.forEach(record => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50 transition-colors';

        const activity = document.createElement('td');
        activity.className = 'p-3.5 font-medium text-slate-800';
        activity.textContent = record.actividad;

        const priorityCell = document.createElement('td');
        priorityCell.className = 'p-3.5';
        const priority = document.createElement('span');
        priority.className = {
            Alta: 'px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-md font-semibold text-[10px]',
            Media: 'px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-semibold text-[10px]',
            Baja: 'px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md font-semibold text-[10px]'
        }[record.prioridad] || 'px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-semibold text-[10px]';
        priority.textContent = record.prioridad;
        priorityCell.append(priority);

        const status = document.createElement('td');
        status.className = record.completado
            ? 'p-3.5 text-emerald-600 font-medium'
            : 'p-3.5 text-amber-700 font-medium';
        status.textContent = record.completado ? 'Completado' : 'Pendiente';

        const deadline = document.createElement('td');
        deadline.className = 'p-3.5';
        deadline.textContent = record.hora || 'Sin límite';

        const actionCell = document.createElement('td');
        actionCell.className = 'p-3.5 text-right';
        const action = document.createElement('button');
        action.type = 'button';
        action.className = record.completado
            ? 'px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-medium cursor-not-allowed'
            : 'px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-600 border border-brand-100 rounded-lg text-xs font-medium transition-all';
        action.disabled = record.completado;
        action.innerHTML = record.completado
            ? '<i class="fa-solid fa-check mr-1"></i> Finalizado'
            : '<i class="fa-solid fa-check mr-1"></i> Marcar Listo';
        action.addEventListener('click', () => completarRegistro(record.id));
        actionCell.append(action);

        row.append(activity, priorityCell, status, deadline, actionCell);
        tbody.append(row);
    });
}

function completarRegistro(id) {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const record = records.find(item => item.id === id);
    if (!record) return;

    record.completado = true;
    if (guardarRegistros(records)) renderizarRegistros(records);
}

function abrirModalRegistro() {
    const modal = document.getElementById('modal-registro');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.getElementById('registro-actividad').focus();
}

function cerrarModalRegistro() {
    const modal = document.getElementById('modal-registro');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function guardarRegistro(event) {
    event.preventDefault();
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    records.unshift({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        actividad: document.getElementById('registro-actividad').value.trim(),
        prioridad: document.getElementById('registro-prioridad').value,
        hora: document.getElementById('registro-hora').value,
        completado: false
    });

    if (!guardarRegistros(records)) return;

    renderizarRegistros(records);
    document.getElementById('form-registro').reset();
    cerrarModalRegistro();
}

// Carga el nombre y avatar del encargado en el Topbar
function renderUserProfile(user) {
    const nameEl = document.getElementById('encargado-name');
    const avatarEl = document.getElementById('encargado-avatar');

    if (nameEl) {
        nameEl.textContent = user.name || user.email.split('@')[0];
    }
    
    if (avatarEl && (user.name || user.email)) {
        const initial = (user.name || user.email).charAt(0).toUpperCase();
        avatarEl.textContent = initial;
    }
}

// Función para cerrar la sesión
function logout() {
    sessionStorage.removeItem('active_session');
    window.location.href = '/'; // Sale del directorio hacia la raíz
}