document.addEventListener('DOMContentLoaded', () => {
    validarAccesoAdmin();
    cargarUsuarios();
});

function validarAccesoAdmin() {
    const session = JSON.parse(sessionStorage.getItem('active_session'));
    if (!session || session.role !== 'admin') {
        alert("Acceso no autorizado.");
        window.location.href = '/';
    }
}

async function cargarUsuarios() {
    try {
        const res = await fetch('http://localhost:3000/api/usuarios');
        const usuarios = await res.json();

        const tbody = document.getElementById('usuarios-table-body');
        tbody.innerHTML = '';

        usuarios.forEach(u => {
            const isRoleAdmin = u.role === 'admin';
            tbody.innerHTML += `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="p-3.5 font-mono text-slate-500">#${u.id}</td>
                    <td class="p-3.5 font-medium text-slate-800">${u.nombre}</td>
                    <td class="p-3.5">${u.email}</td>
                    <td class="p-3.5">
                        <span class="px-2 py-0.5 ${isRoleAdmin ? 'bg-brand-50 text-brand-700 border-brand-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'} border rounded-md font-semibold text-[10px]">
                            ${u.role.toUpperCase()}
                        </span>
                    </td>
                    <td class="p-3.5 text-right space-x-1">
                        <button onclick="eliminarUsuario(${u.id})" class="p-1.5 text-slate-500 hover:text-red-600 transition-colors" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error al obtener usuarios:", err);
    }
}

async function guardarUsuario(e) {
    e.preventDefault();
    const nombre = document.getElementById('user-nombre').value;
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;
    const rol_id = document.getElementById('user-rol').value;

    try {
        const res = await fetch('http://localhost:3000/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password, rol_id })
        });

        if (res.ok) {
            closeModalUser();
            cargarUsuarios();
        } else {
            alert("Error al registrar el usuario");
        }
    } catch (err) {
        console.error("Error enviando datos:", err);
    }
}

async function eliminarUsuario(id) {
    if (!confirm("¿Deseas eliminar este usuario de la base de datos?")) return;
    try {
        await fetch(`http://localhost:3000/api/usuarios/${id}`, { method: 'DELETE' });
        cargarUsuarios();
    } catch (err) {
        console.error("Error al eliminar:", err);
    }
}

function openModalUser() { document.getElementById('modal-user').classList.remove('hidden'); document.getElementById('modal-user').classList.add('flex'); }
function closeModalUser() { document.getElementById('modal-user').classList.add('hidden'); document.getElementById('modal-user').classList.remove('flex'); }
function logout() { sessionStorage.removeItem('active_session'); window.location.href = '/'; }