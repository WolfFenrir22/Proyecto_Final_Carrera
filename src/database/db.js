// Importa el módulo "path" de Node.js.
// Sirve para construir rutas de archivos compatibles con el sistema operativo.
const path = require("path");

// Importa "app" desde Electron.
// Se usa para obtener rutas internas de la aplicación, como la carpeta donde guardar datos locales.
const { app } = require("electron");

// Importa la librería sqlite3 y activa el modo verbose.
// El modo verbose muestra información más detallada si ocurre algún error.
const sqlite3 = require("sqlite3").verbose();

// Variable global donde se guardará la conexión activa a la base de datos.
let db;

// Función encargada de inicializar la base de datos.
function initDatabase() {
    // Construye la ruta donde se guardará el archivo de la base de datos.
    // app.getPath("userData") devuelve una carpeta interna propia de la aplicación.
    // En esa carpeta se crea el archivo "hades.db".
    const dbPath = path.join(app.getPath("userData"), "hades.db");

    // Crea o abre la base de datos SQLite en la ruta definida.
    // Si el archivo "hades.db" no existe, SQLite lo crea automáticamente.
    db = new sqlite3.Database(dbPath, (error) => {
        // Verifica si hubo un error al abrir o crear la base de datos.
        if (error) {
            // Muestra el error en la consola.
            console.error("Error al abrir la base de datos:", error.message);

            // Detiene la ejecución de este callback si hubo error.
            return;
        }

        // Muestra en consola la ruta donde se conectó la base de datos.
        console.log("Base de datos conectada:", dbPath);
    });

    // serialize asegura que las consultas dentro de este bloque se ejecuten en orden.
    db.serialize(() => {
        // Ejecuta una sentencia SQL para crear la tabla "usuarios" si todavía no existe.
        db.run(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL CHECK(length(nombre) BETWEEN 2 AND 40),
                fecha_creacion TEXT NOT NULL,
                ultimo_acceso TEXT NOT NULL
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS recordatorios_backup (
                id_recordatorio INTEGER PRIMARY KEY AUTOINCREMENT,
                id_usuario INTEGER NOT NULL,
                nombre TEXT NOT NULL,
                ubicacion TEXT NOT NULL,
                frecuencia TEXT NOT NULL,
                ultimo_backup TEXT,
                proximo_backup TEXT,
                activo INTEGER NOT NULL DEFAULT 1,
                fecha_creacion TEXT NOT NULL,
                FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        )
    `);

        db.run(`
        CREATE TABLE IF NOT EXISTS simulaciones_phishing (
            id_simulacion INTEGER PRIMARY KEY AUTOINCREMENT,
            id_usuario INTEGER NOT NULL,
            id_escenario INTEGER NOT NULL,
            tipo_escenario TEXT NOT NULL,
            dificultad TEXT NOT NULL,
            decision_usuario TEXT NOT NULL,
            decision_correcta TEXT NOT NULL,
            puntaje INTEGER NOT NULL,
            aciertos INTEGER NOT NULL,
            errores INTEGER NOT NULL,
            fecha_simulacion TEXT NOT NULL,
            FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        )
    `);
    });

    // Devuelve la conexión a la base de datos.
    return db;
}

// Función que devuelve la conexión actual a la base de datos.
function getDatabase() {
    // Si la variable db todavía no tiene una conexión, inicializa la base de datos.
    if (!db) {
        initDatabase();
    }

    // Devuelve la conexión existente o recién creada.
    return db;
}

// Función que obtiene el primer usuario guardado en la tabla usuarios.
function obtenerUsuarioPrincipal() {
    // Obtiene la conexión activa a la base de datos.
    const database = getDatabase();

    // Devuelve una promesa porque sqlite3 trabaja con callbacks.
    return new Promise((resolve, reject) => {
        // Ejecuta una consulta SELECT para obtener el primer usuario registrado.
        database.get(
            `
                SELECT
                    id_usuario,
                    nombre,
                    fecha_creacion,
                    ultimo_acceso
                FROM usuarios
                ORDER BY id_usuario ASC
                LIMIT 1
            `,
            [],
            (error, row) => {
                // Si ocurre un error en la consulta, se rechaza la promesa.
                if (error) {
                    reject(error);
                    return;
                }

                // Si encuentra un usuario, devuelve la fila.
                // Si no encuentra ninguno, devuelve null.
                resolve(row || null);
            }
        );
    });
}

// Función que guarda un usuario nuevo o actualiza el existente.
function guardarUsuario(nombre) {
    // Obtiene la conexión activa a la base de datos.
    const database = getDatabase();

    // Genera la fecha actual en formato ISO.
    // Ejemplo: 2026-05-23T18:30:00.000Z
    const fechaActual = new Date().toISOString();

    // Devuelve una promesa para manejar la operación asincrónica.
    return new Promise((resolve, reject) => {
        // Primero verifica si ya existe un usuario guardado.
        obtenerUsuarioPrincipal()
            .then((usuarioExistente) => {
                // Si ya existe un usuario, actualiza su nombre y su último acceso.
                if (usuarioExistente) {
                    database.run(
                        `
                            UPDATE usuarios
                            SET
                                nombre = ?,
                                ultimo_acceso = ?
                            WHERE id_usuario = ?
                        `,
                        [nombre, fechaActual, usuarioExistente.id_usuario],
                        (error) => {
                            // Si ocurre un error al actualizar, se rechaza la promesa.
                            if (error) {
                                reject(error);
                                return;
                            }

                            // Devuelve el usuario actualizado.
                            resolve({
                                ...usuarioExistente,
                                nombre,
                                ultimo_acceso: fechaActual
                            });
                        }
                    );

                    // Detiene la ejecución para no insertar un usuario nuevo.
                    return;
                }

                // Si no existe un usuario, inserta uno nuevo en la tabla.
                database.run(
                    `
                        INSERT INTO usuarios (
                            nombre,
                            fecha_creacion,
                            ultimo_acceso
                        )
                        VALUES (?, ?, ?)
                    `,
                    [nombre, fechaActual, fechaActual],
                    function (error) {
                        // Si ocurre un error al insertar, se rechaza la promesa.
                        if (error) {
                            reject(error);
                            return;
                        }

                        // Devuelve los datos del nuevo usuario creado.
                        // this.lastID contiene el id generado automáticamente por SQLite.
                        resolve({
                            id_usuario: this.lastID,
                            nombre,
                            fecha_creacion: fechaActual,
                            ultimo_acceso: fechaActual
                        });
                    }
                );
            })
            .catch((error) => {
                // Captura errores ocurridos al buscar el usuario existente.
                reject(error);
            });
    });
}

// Función que actualiza la fecha del último acceso del usuario.
function actualizarUltimoAcceso(idUsuario) {
    // Obtiene la conexión activa a la base de datos.
    const database = getDatabase();

    // Genera la fecha actual en formato ISO.
    const fechaActual = new Date().toISOString();

    // Devuelve una promesa para manejar la operación asincrónica.
    return new Promise((resolve, reject) => {
        // Actualiza el campo ultimo_acceso del usuario indicado.
        database.run(
            `
                UPDATE usuarios
                SET ultimo_acceso = ?
                WHERE id_usuario = ?
            `,
            [fechaActual, idUsuario],
            (error) => {
                // Si ocurre un error al actualizar, se rechaza la promesa.
                if (error) {
                    reject(error);
                    return;
                }

                // Si la actualización fue exitosa, devuelve true.
                resolve(true);
            }
        );
    });
}

// Función que elimina el usuario guardado.
// Actualmente elimina todos los registros de la tabla usuarios.
function eliminarUsuarioPrincipal() {
    // Obtiene la conexión activa a la base de datos.
    const database = getDatabase();

    // Devuelve una promesa para manejar la operación asincrónica.
    return new Promise((resolve, reject) => {
        // Elimina todos los usuarios guardados.
        // En este prototipo solo se maneja un usuario local.
        database.run(
            `
                DELETE FROM usuarios
            `,
            [],
            (error) => {
                // Si ocurre un error al eliminar, se rechaza la promesa.
                if (error) {
                    reject(error);
                    return;
                }

                // Si la eliminación fue exitosa, devuelve true.
                resolve(true);
            }
        );
    });
}

//#######################Funciones para manejar recordatorios de backup#################################
function calcularProximoBackup(fechaBase, frecuencia) {
    const fecha = new Date(fechaBase);

    if (frecuencia === "diario") {
        fecha.setDate(fecha.getDate() + 1);
    } else if (frecuencia === "semanal") {
        fecha.setDate(fecha.getDate() + 7);
    } else if (frecuencia === "mensual") {
        fecha.setMonth(fecha.getMonth() + 1);
    }

    return fecha.toISOString();
}

function guardarRecordatorioBackup(datos) {
    const database = getDatabase();
    const fechaActual = new Date().toISOString();

    const proximoBackup = calcularProximoBackup(
        datos.ultimo_backup || fechaActual,
        datos.frecuencia
    );

    return new Promise((resolve, reject) => {
        database.run(
            `
                INSERT INTO recordatorios_backup (
                    id_usuario,
                    nombre,
                    ubicacion,
                    frecuencia,
                    ultimo_backup,
                    proximo_backup,
                    activo,
                    fecha_creacion
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                datos.id_usuario,
                datos.nombre,
                datos.ubicacion,
                datos.frecuencia,
                datos.ultimo_backup || fechaActual,
                proximoBackup,
                1,
                fechaActual
            ],
            function (error) {
                if (error) {
                    reject(error);
                    return;
                }

                resolve({
                    id_recordatorio: this.lastID,
                    id_usuario: datos.id_usuario,
                    nombre: datos.nombre,
                    ubicacion: datos.ubicacion,
                    frecuencia: datos.frecuencia,
                    ultimo_backup: datos.ultimo_backup || fechaActual,
                    proximo_backup: proximoBackup,
                    activo: 1,
                    fecha_creacion: fechaActual
                });
            }
        );
    });
}

function obtenerRecordatoriosBackup(idUsuario) {
    const database = getDatabase();

    return new Promise((resolve, reject) => {
        database.all(
            `
                SELECT
                    id_recordatorio,
                    id_usuario,
                    nombre,
                    ubicacion,
                    frecuencia,
                    ultimo_backup,
                    proximo_backup,
                    activo,
                    fecha_creacion
                FROM recordatorios_backup
                WHERE id_usuario = ?
                AND activo = 1
                ORDER BY proximo_backup ASC
            `,
            [idUsuario],
            (error, rows) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(rows || []);
            }
        );
    });
}

function eliminarRecordatorioBackup(idRecordatorio) {
    const database = getDatabase();

    return new Promise((resolve, reject) => {
        database.run(
            `
                UPDATE recordatorios_backup
                SET activo = 0
                WHERE id_recordatorio = ?
            `,
            [idRecordatorio],
            (error) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(true);
            }
        );
    });
}

function marcarBackupRealizado(idRecordatorio) {
            const database = getDatabase();
            const fechaActual = new Date().toISOString();

            return new Promise((resolve, reject) => {
                database.get(
                    `
                        SELECT
                            id_recordatorio,
                            frecuencia
                        FROM recordatorios_backup
                        WHERE id_recordatorio = ?
                    `,
                    [idRecordatorio],
                    (error, recordatorio) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        if (!recordatorio) {
                            reject(new Error("No se encontró el recordatorio."));
                            return;
                        }

                        const proximoBackup = calcularProximoBackup(
                            fechaActual,
                            recordatorio.frecuencia
                        );

                        database.run(
                            `
                                UPDATE recordatorios_backup
                                SET
                                    ultimo_backup = ?,
                                    proximo_backup = ?
                                WHERE id_recordatorio = ?
                            `,
                            [fechaActual, proximoBackup, idRecordatorio],
                            (errorUpdate) => {
                                if (errorUpdate) {
                                    reject(errorUpdate);
                                    return;
                                }

                                resolve({
                                    id_recordatorio: idRecordatorio,
                                    ultimo_backup: fechaActual,
                                    proximo_backup: proximoBackup
                                });
                            }
                        );
                    }
                );
            });
        }
//############################################################################################

//####Función que guarda el resultado de una simulación de phishing en la base de datos######
function guardarResultadoPhishing(datos) {
    const database = getDatabase();
    const fechaActual = new Date().toISOString();

    return new Promise((resolve, reject) => {
        database.run(
            `
                INSERT INTO simulaciones_phishing (
                    id_usuario,
                    id_escenario,
                    tipo_escenario,
                    dificultad,
                    decision_usuario,
                    decision_correcta,
                    puntaje,
                    aciertos,
                    errores,
                    fecha_simulacion
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                datos.id_usuario,
                datos.id_escenario,
                datos.tipo_escenario,
                datos.dificultad,
                datos.decision_usuario,
                datos.decision_correcta,
                datos.puntaje,
                datos.aciertos,
                datos.errores,
                fechaActual
            ],
            function (error) {
                if (error) {
                    reject(error);
                    return;
                }

                resolve({
                    id_simulacion: this.lastID,
                    ...datos,
                    fecha_simulacion: fechaActual
                });
            }
        );
    });
}

// Exporta las funciones para que puedan ser usadas desde otros archivos,
// por ejemplo desde electron/main.js.
module.exports = {
    initDatabase,
    obtenerUsuarioPrincipal,
    guardarUsuario,
    actualizarUltimoAcceso,
    eliminarUsuarioPrincipal,
    guardarRecordatorioBackup,
    obtenerRecordatoriosBackup,
    eliminarRecordatorioBackup,
    marcarBackupRealizado,
    guardarResultadoPhishing
};