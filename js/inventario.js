document.addEventListener('DOMContentLoaded', () => {
    validarAccesoAdmin();
    cargarProductos();
});

function validarAccesoAdmin() {
    const session = JSON.parse(sessionStorage.getItem('active_session'));
    if (!session || session.role !== 'admin') {
        alert("Acceso denegado.");
        window.location.href = '/';
    }
}

async function cargarProductos() {
    try {
        const res = await fetch('http://localhost:3000/api/productos');
        const productos = await res.json();

        const tbody = document.getElementById('productos-table-body');
        tbody.innerHTML = '';

        productos.forEach(p => {
            const stockBajo = p.stock <= p.stock_minimo;
            tbody.innerHTML += `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="p-3.5 font-mono text-slate-500">${p.codigo}</td>
                    <td class="p-3.5 font-medium text-slate-800">${p.nombre}</td>
                    <td class="p-3.5 text-slate-500">${p.categoria || 'N/A'}</td>
                    <td class="p-3.5 text-slate-500">${p.ubicacion || 'General'}</td>
                    <td class="p-3.5">
                        <span class="px-2 py-0.5 ${stockBajo ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'} border rounded-md font-semibold text-[10px]">
                            ${p.stock} unidades
                        </span>
                    </td>
                    <td class="p-3.5 font-semibold text-slate-800">$${Number(p.precio).toFixed(2)}</td>
                    <td class="p-3.5 text-right space-x-1">
                        <button onclick="eliminarProducto(${p.id})" class="p-1.5 text-slate-500 hover:text-red-600 transition-colors" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error cargando inventario:", err);
    }
}

async function guardarProducto(e) {
    e.preventDefault();
    const codigo = document.getElementById('prod-codigo').value;
    const nombre = document.getElementById('prod-nombre').value;
    const categoria = document.getElementById('prod-categoria').value;
    const stock = document.getElementById('prod-stock').value;
    const precio = document.getElementById('prod-precio').value;
    const ubicacion = document.getElementById('prod-ubicacion').value;

    try {
        const res = await fetch('http://localhost:3000/api/productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo, nombre, categoria, stock, precio, ubicacion })
        });

        if (res.ok) {
            closeModalProd();
            document.getElementById('form-prod').reset();
            cargarProductos();
        } else {
            const result = await res.json();
            alert(result.error || "Error al registrar el producto");
        }
    } catch (err) {
        console.error("Error enviando datos:", err);
        alert("No se pudo conectar con el servidor para registrar el producto.");
    }
}

async function eliminarProducto(id) {
    if (!confirm("¿Eliminar este producto del inventario?")) return;
    try {
        await fetch(`http://localhost:3000/api/productos/${id}`, { method: 'DELETE' });
        cargarProductos();
    } catch (err) {
        console.error("Error al eliminar producto:", err);
    }
}

function openModalProd() { document.getElementById('modal-prod').classList.remove('hidden'); document.getElementById('modal-prod').classList.add('flex'); }
function closeModalProd() { document.getElementById('modal-prod').classList.add('hidden'); document.getElementById('modal-prod').classList.remove('flex'); }
function logout() { sessionStorage.removeItem('active_session'); window.location.href = '/'; }