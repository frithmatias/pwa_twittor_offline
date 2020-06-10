// ARCHIVO AUXILIAR DE BASE DE DATOS PARA GUARDAR EN INDEXDB CON LA LIBRERÍA POUCHDB
const db = new PouchDB('mensajes');
function guardarMensaje( msg ){
    msg._id = new Date().toISOString();
    return db.put( msg ).then(()=>{
        // le estamos diciendo que hay 'algo' que tiene que hacer cuando recupere la conexión y 
        // ese 'algo' se llama 'nuevo-post'
        self.registration.sync.register('nuevo-post');
        const newResp = { ok: true, offline: true, msg };
        return new Response( JSON.stringify( newResp ));
    })
}


// Postear mensajes a la base de datos luego de OFFLINE 
function postearMensajes(){
    const posteos = [];
    return db.allDocs({include_docs: true }).then(docs => {
        // Por cada documento encontrado dentro de 'mensajes' en IndexedDB
        docs.rows.forEach( row => {
            const doc = row.doc;
            const fetchProm = fetch('api', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(doc)}).then( res => {
                // si lo envía y el servidor lo recibe, entonces borra el mensaje (doc) de IndexedDB
                return db.remove(doc);
            })
            posteos.push( fetchProm ); // posteos es un array de promesas
        });
        return Promise.all( posteos ) 
    });
}