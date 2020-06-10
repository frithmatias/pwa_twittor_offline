
var url = window.location.href;
var swLocation = '/twittor/sw.js';


if ( navigator.serviceWorker ) {


    if ( url.includes('localhost') ) {
        swLocation = '/sw.js';
    }


    navigator.serviceWorker.register( swLocation );
}





// Referencias de jQuery

var titulo      = $('#titulo');
var nuevoBtn    = $('#nuevo-btn');
var salirBtn    = $('#salir-btn');
var cancelarBtn = $('#cancel-btn');
var postBtn     = $('#post-btn');
var avatarSel   = $('#seleccion');
var timeline    = $('#timeline');

var modal       = $('#modal');
var modalAvatar = $('#modal-avatar');
var avatarBtns  = $('.seleccion-avatar');
var txtMensaje  = $('#txtMensaje');

// El usuario, contiene el ID del hÃ©roe seleccionado
var usuario;



// Obtener los mensajes del API REST 
function obtenerMensajes(){
    // como esta corriendo en el mismo host 
    // fetch('api') = fetch('http://localhost:3000/api')
    fetch('api')
    // .then(res => {
    //     return res.json().then(res => {
    //         return res;
    //     })
    // })
    .then(res => res.json())
    .then(posts => {
        posts.forEach( post => {
            crearMensajeHTML( post.mensaje, post.user );
        })
    });
}
obtenerMensajes();




// ===== Codigo de la aplicaciÃ³n

function crearMensajeHTML(mensaje, personaje) {

    var content =`
    <li class="animated fadeIn fast">
        <div class="avatar">
            <img src="img/avatars/${ personaje }.png">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${ personaje }</h3>
                <br/>
                ${ mensaje }
            </div>
            
            <div class="arrow"></div>
        </div>
    </li>
    `;

    timeline.prepend(content);
    cancelarBtn.click();

}



// Globals
function logIn( ingreso ) {

    if ( ingreso ) {
        nuevoBtn.removeClass('oculto');
        salirBtn.removeClass('oculto');
        timeline.removeClass('oculto');
        avatarSel.addClass('oculto');
        modalAvatar.attr('src', 'img/avatars/' + usuario + '.png');
    } else {
        nuevoBtn.addClass('oculto');
        salirBtn.addClass('oculto');
        timeline.addClass('oculto');
        avatarSel.removeClass('oculto');

        titulo.text('Seleccione Personaje');
    
    }

}


// Seleccion de personaje
avatarBtns.on('click', function() {

    usuario = $(this).data('user');

    titulo.text('@' + usuario);

    logIn(true);

});

// Boton de salir
salirBtn.on('click', function() {

    logIn(false);

});

// Boton de nuevo mensaje
nuevoBtn.on('click', function() {

    modal.removeClass('oculto');
    modal.animate({ 
        marginTop: '-=1000px',
        opacity: 1
    }, 200 );

});

// Boton de cancelar mensaje
cancelarBtn.on('click', function() {
    if ( !modal.hasClass('oculto') ) {
        modal.animate({ 
            marginTop: '+=1000px',
            opacity: 0
         }, 200, function() {
             modal.addClass('oculto');
             txtMensaje.val('');
         });
    }
});

// Boton de enviar mensaje
postBtn.on('click', function() {
    var mensaje = txtMensaje.val();
    if ( mensaje.length === 0 ) {
        cancelarBtn.click();
        return;
    }

    var data = {
        mensaje: mensaje, 
        user: usuario
    }
    
    // si yo no especifico en el objeto de configuración que estoy enviando un método POST va a asumir 
    // por DEFECTO que se trata de una petición GET. Este POST lo va a capturar el Service Worker 
    // para guardarlo en IndexDB, ya que el Cache puede almacenar peticiones GET, pero no POST.

    fetch('api', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)})
        .then(resp => resp.json())
        .then(res => console.log('app.js', res))
        .catch(err => console.log('app.js error', err))

    crearMensajeHTML( mensaje, usuario );

});



// Detectar cambios de conexion 
function isOnline(){
    if ( navigator.onLine ) {
        // tenemos conexion 
        // console.log('online');
        // https://github.com/dmuy/Material-Toast
        mdtoast('ONLINE', {type: mdtoast.SUCCESS, duration: 1000});
        
    } else {
        // no tenemos conexion
        // console.log('offline');
        mdtoast('OFFLINE: No se detectó una conexión a Internet, pero usted puede trabajar normalmente. Los datos se enviarán automaticamente cuando vuelva a conectarse a internet.', {type: mdtoast.ERROR, interaction: true, actionText: 'OK'}).show();
    }
}

window.addEventListener('online', isOnline );
window.addEventListener('offline', isOnline );
isOnline(); // verifico la conexión cuando se inicia la app
