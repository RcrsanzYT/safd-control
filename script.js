// ==== USUARIOS Y CONTRASEÑAS ====
const usuarios = {
    "Sophie Becker": "866",
    "Cole Maddox": "811",
    "Micaela Bonaccio": "888",
    "Erik Kowalski": "823",
    "Cassandra Gómez": "855",
    "Pepe Domingo": "814",
    "Godofredo Martinez": "837",
    "Carla Miso": "816",
    "Gabriella Orsini": "807",
    "Hugo Martínez": "801",
    "Hayato Morie": "818",
    "James Brooke": "810",
    "Ren Kobayashi": "817",
    "Natasha Lewis": "876",
    "Marcus Escobar": "899",
    "Hannah Baker": "861",
    "Elías Collins": "804",
    "Denver moretti": "826",
    "Danny Jimenez": "805",
    "Adrian Blackwood": "815"
};

// ==== ROLES DE USUARIOS ====
const roles = {
    "Sophie Becker": "Jefatura",
    "Cole Maddox": "Jefatura",
    "Micaela Bonaccio": "Teniente",
    "Erik Kowalski": "Ingeniero",
    "Cassandra Gómez": "Ingeniero",
    "Pepe Domingo": "Bombero especialista",
    "Godofredo Martinez": "Bombero especialista",
    "Carla Miso": "Bombero especialista",
    "Gabriella Orsini": "Bombero especialista",
    "Hugo Martínez": "Bombero especialista",
    "Hayato Morie": "Bombero especialista",
    "James Brooke": "Bombero especialista",
    "Ren Kobayashi": "Bombero",
    "Adrian Blackwood": "Bombero",
    "Marcus Escobar": "Bombero",
    "Natasha Lewis": "Aspirante",
    "Hannah Baker": "Aspirante",
    "Elías Collins": "Aspirante",
    "Denver moretti": "Aspirante",
    "Danny Jimenez": "Aspirante"
};

// ==== USUARIOS RTD ====
const usuariosRTD = [
    "Sophie Becker",
    "Cole Maddox",
    "Erik Kowalski",
    "Cassandra Gómez",
    "Pepe Domingo",
    "Micaela Bonaccio",
    "Carla Miso"
];

// ==== VARIABLES ====
let inicio = localStorage.getItem("inicioServicio") ? new Date(localStorage.getItem("inicioServicio")) : null;
let timer = null;
let turnos = JSON.parse(localStorage.getItem("turnos")) || [];
let usuariosEnServicio = JSON.parse(localStorage.getItem("usuariosEnServicio")) || [];

// ==== ESPERAR A QUE CARGUE LA PAGINA ====
window.onload = function() {
    let usuario = localStorage.getItem("usuario");

    if(usuario){
        document.getElementById("login").style.display = "none";
        document.getElementById("panel").style.display = "block";
        document.getElementById("usuarioActivo").innerText = usuario;
    }

    // Mostrar fecha
    if(document.getElementById("fecha")){
        document.getElementById("fecha").innerText = new Date().toLocaleDateString();
    }

    // Restaurar servicio si estaba activo
    if(localStorage.getItem("inicioServicio")){
        inicio = new Date(localStorage.getItem("inicioServicio"));
        toggleServicio(true); // restaurando
    }

    cargarTabla();
    actualizarUsuariosEnServicio();
};

// ==== LOGIN ====
function iniciarSesion(){
    let nombre = document.getElementById("nombreUsuario").value;
    let clave = document.getElementById("claveUsuario").value;

    if(nombre === "" || clave === ""){
        alert("Escribe usuario y contraseña");
        return;
    }

    if(usuarios[nombre] && usuarios[nombre] === clave){
        localStorage.setItem("usuario", nombre);
        document.getElementById("login").style.display = "none";
        document.getElementById("panel").style.display = "block";
        document.getElementById("usuarioActivo").innerText = nombre;
    } else {
        alert("Usuario o contraseña incorrectos");
    }
}

// ==== CERRAR SESIÓN ====
function cerrarSesion(){
    let usuarioActual = localStorage.getItem("usuario");

    // Quitar de usuarios en servicio
    usuariosEnServicio = usuariosEnServicio.filter(u => u !== usuarioActual);
    localStorage.setItem("usuariosEnServicio", JSON.stringify(usuariosEnServicio));
    actualizarUsuariosEnServicio();

    localStorage.removeItem("usuario");
    localStorage.removeItem("inicioServicio");
    location.reload();
}

// ==== INICIAR / CERRAR SERVICIO ====
function toggleServicio(restaurando=false){
    const boton = document.getElementById("botonServicio");
    const usuarioActual = localStorage.getItem("usuario");

    if(inicio === null){
        // INICIAR SERVICIO
        inicio = new Date();
        if(!restaurando) localStorage.setItem("inicioServicio", inicio);

        document.getElementById("entrada").innerText = inicio.toLocaleTimeString();
        boton.innerText = "Cerrar servicio";

        // Agregar usuario a lista de servicio
        if(!usuariosEnServicio.includes(usuarioActual)){
            usuariosEnServicio.push(usuarioActual);
            localStorage.setItem("usuariosEnServicio", JSON.stringify(usuariosEnServicio));
        }
        actualizarUsuariosEnServicio();

        timer = setInterval(function(){
            let ahora = new Date();
            let diferencia = ahora - inicio;

            let horas = Math.floor(diferencia / 1000 / 3600);
            let minutos = Math.floor((diferencia / 1000 % 3600) / 60);
            let seg = Math.floor(diferencia / 1000 % 60);

            document.getElementById("duracion").innerText =
                horas.toString().padStart(2,"0")+":"+
                minutos.toString().padStart(2,"0")+":"+
                seg.toString().padStart(2,"0");

        },1000);

    } else {
        // CERRAR SERVICIO
        let fin = new Date();
        document.getElementById("salida").innerText = fin.toLocaleTimeString();
        clearInterval(timer);

        let duracion = fin - inicio;

        let turno = {
            usuario: usuarioActual,
            rol: roles[usuarioActual] || "Sin rol",
            fecha: inicio.toLocaleDateString(),
            entrada: inicio.toLocaleTimeString(),
            salida: fin.toLocaleTimeString(),
            duracion: formatoTiempo(duracion)
        };

        turnos.push(turno);
        localStorage.setItem("turnos", JSON.stringify(turnos));

        // Quitar usuario de servicio
        usuariosEnServicio = usuariosEnServicio.filter(u => u !== usuarioActual);
        localStorage.setItem("usuariosEnServicio", JSON.stringify(usuariosEnServicio));
        actualizarUsuariosEnServicio();

        cargarTabla();

        boton.innerText = "Iniciar servicio";
        inicio = null;
        localStorage.removeItem("inicioServicio");
    }
}

// ==== FORMATEAR TIEMPO ====
function formatoTiempo(ms){
    let totalSegundos = Math.floor(ms/1000);
    let h = Math.floor(totalSegundos/3600);
    let m = Math.floor((totalSegundos%3600)/60);
    let s = totalSegundos%60;
    return h.toString().padStart(2,"0")+":"+m.toString().padStart(2,"0")+":"+s.toString().padStart(2,"0");
}

// ==== CARGAR TABLA HISTORIAL PERSONALIZADA ====
function cargarTabla(){
    let tabla = document.getElementById("tablaTurnos");

    tabla.innerHTML =
        "<tr><th>Usuario</th><th>Rol</th><th>Fecha</th><th>Entrada</th><th>Salida</th><th>Duración</th></tr>";

    let usuarioActual = localStorage.getItem("usuario");

    let turnosFiltrados = usuariosRTD.includes(usuarioActual)
        ? turnos
        : turnos.filter(t => t.usuario === usuarioActual);

    if(turnosFiltrados.length === 0){
        let fila = tabla.insertRow();
        fila.insertCell(0).innerText = "-";
        fila.insertCell(1).innerText = "-";
        fila.insertCell(2).innerText = "-";
        fila.insertCell(3).innerText = "-";
        fila.insertCell(4).innerText = "-";
        fila.insertCell(5).innerText = "-";
    } else {
        turnosFiltrados.forEach(turno => {
            let fila = tabla.insertRow();
            fila.insertCell(0).innerText = turno.usuario;
            fila.insertCell(1).innerText = turno.rol;
            fila.insertCell(2).innerText = turno.fecha;
            fila.insertCell(3).innerText = turno.entrada;
            fila.insertCell(4).innerText = turno.salida;
            fila.insertCell(5).innerText = turno.duracion;
        });
    }
}

// ==== MOSTRAR USUARIOS EN SERVICIO ====
function actualizarUsuariosEnServicio(){
    const contenedor = document.getElementById("usuariosEnServicio");
    if(!contenedor) return;

    contenedor.innerHTML = "";

    if(usuariosEnServicio.length === 0){
        contenedor.innerText = "No hay usuarios en servicio";
    } else {
        let ul = document.createElement("ul");
        usuariosEnServicio.forEach(u => {
            let li = document.createElement("li");
            li.innerText = u + " (" + (roles[u] || "Sin rol") + ")";
            ul.appendChild(li);
        });
        contenedor.appendChild(ul);
    }
}

// ==== MENSAJE ANTES DE CERRAR O RECARGAR ====
window.addEventListener("beforeunload", function(e){
    if(inicio !== null){
        e.preventDefault();
        e.returnValue = "¡Atención! Tienes un servicio activo. ¿Estás seguro de que quieres salir?";
    }
});
