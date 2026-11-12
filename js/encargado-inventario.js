document.addEventListener('DOMContentLoaded', () => {
    validarAccesoEncargado();
    cargarStock();
});

function validarAccesoEncargado() {
    const session = JSON.parse(sessionStorage.getItem('active_session'));
    if (!session || (session.role !== 'encargado' && session.role !== 'admin')) {
        alert("Acceso no autorizado.");
        window.location.href = '/';
    }
}

async function cargarStock() {
    try {
        const res = await fetch('http://localhost:3000/api/productos');
        const productos = await res.json();

        const tbody = document.getElementById('stock-table-body');
        tbody.innerHTML = '';

        productos.forEach(p => {
            const stockBajo = p.stock <= p.stock_minimo;
            tbody.innerHTML += `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="p-3.5 font-mono text-slate-500">${p.codigo}</td>
                    <td class="p-3.5 font-medium text-slate-800">${p.nombre}</td>
                    <td class="p-3.5 text-slate-500">${p.ubicacion || 'General'}</td>
                    <td class="p-3.5">
                        <span class="px-2 py-0.5 ${stockBajo ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'} border rounded-md font-semibold text-[10px]">
                            ${p.stock} unidades
                        </span>
                    </td>
                    <td class="p-3.5 text-right">
                        <button onclick="openModalStock(${p.id}, '${p.nombre}')" class="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-100 rounded-lg text-xs font-medium transition-all">
                            <i class="fa-solid fa-arrow-right-arrow-left mr-1"></i> Registrar Movimiento
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error al obtener stock:", err);
    }
}

function openModalStock(id, nombre) {
    document.getElementById('stock-prod-id').value = id;
    document.getElementById('prod-stock-title').textContent = nombre;
    document.getElementById('modal-stock').classList.remove('hidden');
    document.getElementById('modal-stock').classList.add('flex');
}

function closeModalStock() {
    document.getElementById('modal-stock').classList.add('hidden');
    document.getElementById('modal-stock').classList.remove('flex');
}

async function guardarAjuste(e) {
    e.preventDefault();
    const id = document.getElementById('stock-prod-id').value;
    const tipo = document.getElementById('stock-tipo').value;
    let cantidad = parseInt(document.getElementById('stock-cantidad').value);
    const observaciones = document.getElementById('stock-obs').value;
    const userSession = JSON.parse(sessionStorage.getItem('active_session'));

    // Si es salida, la cantidad a sumar al stock debe ser negativa
    if (tipo === 'salida') cantidad = -cantidad;

    try {
        const res = await fetch(`http://localhost:3000/api/productos/${id}/stock`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cantidad,
                usuario_id: userSession.id || 1,
                tipo,
                observaciones
            })
        });

        if (res.ok) {
            closeModalStock();
            cargarStock();
        } else {
            alert("No se pudo actualizar el stock");
        }
    } catch (err) {
        console.error("Error al procesar movimiento:", err);
    }
}

function logout() { sessionStorage.removeItem('active_session'); window.location.href = '/'; }