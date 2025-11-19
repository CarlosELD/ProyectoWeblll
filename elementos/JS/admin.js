// DAO para gestión de autos
class AutoDAO {
    constructor() {
        this.autos = JSON.parse(localStorage.getItem('autos')) || [];
        this.ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        this.initSampleData();
    }

    initSampleData() {
        if (this.autos.length === 0) {
            this.autos = [
                {
                    id: 1,
                    modelo: "Ford Mustang Shelby GT 500",
                    marca: "Ford",
                    año: 1970,
                    precio: 125000,
                    estado: "disponible",
                    imagen: "imagenes/Shelby_Mustang_GT500 - 1.png",
                    descripcion: "Un ícono del automovilismo, conocido por su motor V8 y diseño deportivo."
                },
                {
                    id: 2,
                    modelo: "Dodge Super Bee",
                    marca: "Dodge",
                    año: 1970,
                    precio: 98500,
                    estado: "disponible",
                    imagen: "imagenes/Super_Bee - 1.png",
                    descripcion: "Coche muscular comercializado por Dodge, versión rebajada del Plymouth Road Runner."
                }
            ];
            this.saveAutos();
        }
    }

    // CREATE
    agregarAuto(auto) {
        auto.id = this.generateId();
        this.autos.push(auto);
        this.saveAutos();
        return auto;
    }

    // READ
    obtenerAutos() {
        return this.autos;
    }

    obtenerAutoPorId(id) {
        return this.autos.find(auto => auto.id === id);
    }

    // UPDATE
    actualizarAuto(id, autoActualizado) {
        const index = this.autos.findIndex(auto => auto.id === id);
        if (index !== -1) {
            this.autos[index] = { ...this.autos[index], ...autoActualizado };
            this.saveAutos();
            return true;
        }
        return false;
    }

    // DELETE
    eliminarAuto(id) {
        const index = this.autos.findIndex(auto => auto.id === id);
        if (index !== -1) {
            this.autos.splice(index, 1);
            this.saveAutos();
            return true;
        }
        return false;
    }

    // Métodos auxiliares
    generateId() {
        return this.autos.length > 0 ? Math.max(...this.autos.map(a => a.id)) + 1 : 1;
    }

    saveAutos() {
        localStorage.setItem('autos', JSON.stringify(this.autos));
    }

    // Estadísticas
    obtenerEstadisticas() {
        const totalVentas = this.autos.filter(auto => auto.estado === 'vendido')
                                   .reduce((sum, auto) => sum + auto.precio, 0);
        const totalAutos = this.autos.length;
        const autosVendidos = this.autos.filter(auto => auto.estado === 'vendido').length;
        const tasaConversion = totalAutos > 0 ? (autosVendidos / totalAutos * 100).toFixed(1) : 0;

        return {
            totalVentas,
            totalAutos,
            totalClientes: autosVendidos,
            tasaConversion
        };
    }
}

// Aplicación principal
class AdminApp {
    constructor() {
        this.autoDAO = new AutoDAO();
        this.autoEditando = null;
        this.init();
    }

    init() {
        this.cargarEstadisticas();
        this.cargarTablaAutos();
        this.inicializarEventos();
        this.inicializarGrafico();
    }

    cargarEstadisticas() {
        const stats = this.autoDAO.obtenerEstadisticas();
        document.getElementById('totalVentas').textContent = `$${stats.totalVentas.toLocaleString()}`;
        document.getElementById('totalAutos').textContent = stats.totalAutos;
        document.getElementById('totalClientes').textContent = stats.totalClientes;
        document.getElementById('tasaConversion').textContent = `${stats.tasaConversion}%`;
    }

    cargarTablaAutos() {
        const tbody = document.getElementById('autosTableBody');
        const autos = this.autoDAO.obtenerAutos();

        tbody.innerHTML = autos.map(auto => `
            <tr>
                <td>${auto.id}</td>
                <td>${auto.modelo}</td>
                <td>${auto.año}</td>
                <td>$${auto.precio.toLocaleString()}</td>
                <td>
                    <span class="badge ${this.getBadgeClass(auto.estado)}">
                        ${this.getEstadoText(auto.estado)}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-warning btn-action btn-edit" 
                            onclick="adminApp.editarAuto(${auto.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-action btn-delete" 
                            onclick="adminApp.eliminarAuto(${auto.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getBadgeClass(estado) {
        const classes = {
            'disponible': 'bg-success',
            'vendido': 'bg-secondary',
            'reservado': 'bg-warning'
        };
        return classes[estado] || 'bg-secondary';
    }

    getEstadoText(estado) {
        const textos = {
            'disponible': 'Disponible',
            'vendido': 'Vendido',
            'reservado': 'Reservado'
        };
        return textos[estado] || estado;
    }

    inicializarEventos() {
        document.getElementById('saveAuto').addEventListener('click', () => this.guardarAuto());
        document.getElementById('autoModal').addEventListener('hidden.bs.modal', () => this.limpiarFormulario());
    }

    guardarAuto() {
        const formData = this.obtenerDatosFormulario();

        if (!this.validarFormulario(formData)) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        if (this.autoEditando) {
            this.autoDAO.actualizarAuto(this.autoEditando, formData);
        } else {
            this.autoDAO.agregarAuto(formData);
        }

        this.recargarDatos();
        this.cerrarModal();
    }

    obtenerDatosFormulario() {
        return {
            modelo: document.getElementById('modelo').value,
            marca: document.getElementById('marca').value,
            año: parseInt(document.getElementById('ano').value),
            precio: parseFloat(document.getElementById('precio').value),
            estado: document.getElementById('estado').value,
            imagen: document.getElementById('imagen').value,
            descripcion: document.getElementById('descripcion').value
        };
    }

    validarFormulario(data) {
        return data.modelo && data.marca && data.año && data.precio && data.estado;
    }

    editarAuto(id) {
        const auto = this.autoDAO.obtenerAutoPorId(id);
        if (auto) {
            this.autoEditando = id;
            this.llenarFormulario(auto);
            this.mostrarModal('Editar Automóvil');
        }
    }

    llenarFormulario(auto) {
        document.getElementById('modelo').value = auto.modelo;
        document.getElementById('marca').value = auto.marca;
        document.getElementById('ano').value = auto.año;
        document.getElementById('precio').value = auto.precio;
        document.getElementById('estado').value = auto.estado;
        document.getElementById('imagen').value = auto.imagen || '';
        document.getElementById('descripcion').value = auto.descripcion || '';
    }

    eliminarAuto(id) {
        if (confirm('¿Está seguro de que desea eliminar este automóvil?')) {
            this.autoDAO.eliminarAuto(id);
            this.recargarDatos();
        }
    }

    mostrarModal(titulo) {
        document.getElementById('modalTitle').textContent = titulo;
        const modal = new bootstrap.Modal(document.getElementById('autoModal'));
        modal.show();
    }

    cerrarModal() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('autoModal'));
        modal.hide();
    }

    limpiarFormulario() {
        document.getElementById('autoForm').reset();
        this.autoEditando = null;
    }

    recargarDatos() {
        this.cargarEstadisticas();
        this.cargarTablaAutos();
        this.actualizarGrafico();
    }

    inicializarGrafico() {
        const ctx = document.getElementById('ventasChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Ventas Mensuales',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: '#3498db',
                    borderColor: '#2980b9',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    actualizarGrafico() {
    }
}

// Inicializar la aplicación
const adminApp = new AdminApp();