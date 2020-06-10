function manejoApiMensajes( cacheName, req ){
    if( req.clone().method === 'POST' ) {
        // Como el Cache no puede almacenar peticiónes POST (solo puede almacenar peticiones GET)
        // Aca vamos a capturar las peticiones POST para guardarlas en IndexDB. Estas funciones 
        // las vamos a guardar en un AUXILIAR DE BASE DE DATOS -> js/sw-db.js. 

            if ( self.registration.sync ) {
                // Lo puedo registrar como una tarea asincrona
                return req.clone().text().then( body => {
                // console.log(body) -> {"mensaje":"asdf","user":"spiderman"}
                // clonamos el request porque si lo consumimos ya no lo podremos volver a utilizar.
                        // console.log(body);
                        const bodyObj = JSON.parse( body );
                        return guardarMensaje( bodyObj );
                }); 
            } else {
                // No lo puedo registrar como una tarea asincrona
                return fetch( req );
            }

        }  else {
            // 1.Strategy: network with cache FALLBACK 
            return fetch( req ).then( res => {
                            if( res.ok ){
                                actualizaCacheDinamico( DYNAMIC_CACHE, req, res.clone() );
                                return res.clone();
                            } else { // no encontro el recurso, 404 por ejemplo
                                return caches.match( req );
                            }
                        })
                        .catch( err => { // error en fetch, sin internet por ejemplo
                            return caches.match( req );
                        })
        }
}

// Guardar  en el cache dinamico
function actualizaCacheDinamico( dynamicCache, req, res ) {


    if ( res.ok ) {

        return caches.open( dynamicCache ).then( cache => {

            cache.put( req, res.clone() );
            
            return res.clone();

        });

    } else {
        return res;
    }

}

// Cache with network update
function actualizaCacheStatico( staticCache, req, APP_SHELL_INMUTABLE ) {


    if ( APP_SHELL_INMUTABLE.includes(req.url) ) {
        // No hace falta actualizar el inmutable
        // console.log('existe en inmutable', req.url );

    } else {
        // console.log('actualizando', req.url );
        return fetch( req )
                .then( res => {
                    // Se ve raro porque le paso el cache estático, pero sólo esto reutilizando
                    // el metodo actualizaCacheDinamico para actualizar el cache estático.
                    return actualizaCacheDinamico( staticCache, req, res );
                });
    }



}

