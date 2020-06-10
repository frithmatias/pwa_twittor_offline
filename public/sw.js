// imports
// IMPORTANTE: En ejercicios anteriores de POUCHDB (librería que vamosa utilizar para evitar 
// usar las sentencias nativas de IndexDB), las habíamos guardado en el cache inmutable desde el SW 
// para usarlas desde APP.JS, pero aca las vamos a usar desde el Service Worker, y como el SW corre 
// en un hilo totalmente diferente al de la app, no puedo instalarlas en el cache inmutable porque 
// no tendría acceso desde el SW, por lo tanto las voy a importar dentro de este mismo sw.js. 
// También voy a ponerlo en el CACHE INMUTABLE para poder utilizarlo desde APP.JS. 

// imports
// importScripts('https://cdn.jsdelivr.net/npm/pouchdb@7.1.1/dist/pouchdb.min.js');
// importScripts('js/sw-db.js'); 
// importScripts('js/sw-utils.js');
// El orden es muy importante, primero sw-db.js porque es proble que pueda utilizar en sw-utils.js 
// alguna funcion definida en sw-db.js como por ejemplo guardarMensaje();

importScripts('https://cdn.jsdelivr.net/npm/pouchdb@7.1.1/dist/pouchdb.min.js');
importScripts('js/sw-db.js');
importScripts('js/sw-utils.js');

const STATIC_CACHE    = 'static-v2';
const DYNAMIC_CACHE   = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';

const APP_SHELL = [
    '/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/chicken.png',
    'img/avatars/crab.png',
    'img/avatars/donkey.png',
    'img/avatars/frog.png',
    'img/avatars/hulk.png',
    'img/avatars/ironman.png',
    'img/avatars/mouse.png',
    'img/avatars/sheep.png',
    'img/avatars/spiderman.png',
    'img/avatars/thor.png',
    'img/avatars/turtle.png',
    'img/avatars/wolverine.png',
    'js/app.js',
    'js/sw-utils.js',
    'js/libs/plugins/mdtoast.min.js',
    'js/libs/plugins/mdtoast.min.css'
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.css',
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js',
    'https://cdn.jsdelivr.net/npm/pouchdb@7.1.1/dist/pouchdb.min.js'
];

self.addEventListener('install', e => {
    const cacheStatic = caches.open( STATIC_CACHE ).then(cache => cache.addAll( APP_SHELL ));
    const cacheInmutable = caches.open( INMUTABLE_CACHE ).then(cache => cache.addAll( APP_SHELL_INMUTABLE ));
    e.waitUntil( Promise.all([ cacheStatic, cacheInmutable ])  );
});

self.addEventListener('activate', e => {
    const respuesta = caches.keys().then( keys => {
        keys.forEach( key => {
            if (  key !== STATIC_CACHE && key.includes('static') ) {
                return caches.delete(key);
            }
            if (  key !== DYNAMIC_CACHE && key.includes('dynamic') ) {
                return caches.delete(key);
            }
        });
    });
    e.waitUntil( respuesta );
});

self.addEventListener( 'fetch', e => {

    let respuesta;

    // Como necesito ver los mensajes la primera vez que yo cargo la página, SOLO para las APIS se va a usar
    // la estrategia 'network with cache FALLBACK' en lugar de usar la estrategia 'cache with network UPDATE' 
    // tiene que tener / para que no caigan recursos como fonts.googleapis.com/css

    if ( e.request.url.includes('/api')){

        respuesta = manejoApiMensajes( DYNAMIC_CACHE, e.request );

    } else {
        // 2.Strategy: cache with network UPDATE
        respuesta = caches.match( e.request )
        .then( res => {
            if ( res ) {
                actualizaCacheStatico( STATIC_CACHE, e.request, APP_SHELL_INMUTABLE );
                return res;
            } else {
                return fetch( e.request ).then( newRes => {
                    return actualizaCacheDinamico( DYNAMIC_CACHE, e.request, newRes );
                });
            }
        });
    }

    e.respondWith( respuesta );
});

// Registrar tareas asincronas
self.addEventListener('sync', e => {
    console.log('SW: Sync');

    if ( e.tag === 'nuevo-post' ) {
        // Postear a DB cuando hay conexion 
        postearMensajes();
        
    } 
})