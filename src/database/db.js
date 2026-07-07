// Importa el módulo "path" de Node.js.
// Sirve para construir rutas de archivos compatibles con el sistema operativo.
const path = require("path");

// Importa "app" desde Electron.
// Se usa para obtener rutas internas de la aplicación, como la carpeta donde guardar datos locales.
const { app } = require("electron");

// Importa la librería sqlite3 y activa el modo verbose.
// El modo verbose muestra información más detallada si ocurre algún error.
const sqlite3 = require("sqlite3").verbose();

// Importa el módulo "crypto" de Node.js.
const crypto = require("crypto");

// Variable global donde se guardará la conexión activa a la base de datos.
let db;

//============ Funciones para manejar contraseñas y validaciones de usuario ========================
function generarSalt() {
    return crypto.randomBytes(16).toString("hex");
}

function generarHashPassword(password, salt) {
    return crypto
        .pbkdf2Sync(password, salt, 100000, 64, "sha512")
        .toString("hex");
}

function validarNombreUsuario(nombre) {
    return (
        typeof nombre === "string" &&
        nombre.trim().length >= 2 &&
        nombre.trim().length <= 40
    );
}

function validarPassword(password) {
    return (
        typeof password === "string" &&
        password.length >= 4 &&
        password.length <= 100
    );
}
//================================================================================================

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
                password_hash TEXT,
                password_salt TEXT,
                fecha_creacion TEXT NOT NULL,
                ultimo_acceso TEXT NOT NULL
            )
        `);

    //===== para la migración de la base de datos, revisa si las columnas password_hash y password_salt existen =====
            db.all(`PRAGMA table_info(usuarios)`, [], (error, columnas) => {
        if (error) {
            console.error(
                "Error al revisar estructura de usuarios:",
                error.message
            );
            return;
        }

        const nombresColumnas = columnas.map((columna) => columna.name);

        if (!nombresColumnas.includes("password_hash")) {
            db.run(`ALTER TABLE usuarios ADD COLUMN password_hash TEXT`);
        }

        if (!nombresColumnas.includes("password_salt")) {
            db.run(`ALTER TABLE usuarios ADD COLUMN password_salt TEXT`);
        }
    });
    //========================================================================================================================

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
        db.run(`
        CREATE TABLE IF NOT EXISTS resultados_trivia (
            id_resultado INTEGER PRIMARY KEY AUTOINCREMENT,
            id_usuario INTEGER NOT NULL,
            respuestas_correctas INTEGER NOT NULL,
            total_preguntas INTEGER NOT NULL,
            porcentaje INTEGER NOT NULL,
            nivel TEXT NOT NULL,
            fecha_resultado TEXT NOT NULL,
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

// Función que obtiene un usuario por su nombre.
function obtenerUsuarioPorNombre(nombre) {
    const database = getDatabase();
    const nombreLimpio = nombre.trim();

    return new Promise((resolve, reject) => {
        database.get(
            `
                SELECT
                    id_usuario,
                    nombre,
                    password_hash,
                    password_salt,
                    fecha_creacion,
                    ultimo_acceso
                FROM usuarios
                WHERE LOWER(nombre) = LOWER(?)
                LIMIT 1
            `,
            [nombreLimpio],
            (error, row) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(row || null);
            }
        );
    });
}

function crearUsuarioConPassword(nombre, password) {
    const database = getDatabase();
    const nombreLimpio = nombre.trim();
    const fechaActual = new Date().toISOString();

    if (!validarNombreUsuario(nombreLimpio)) {
        return Promise.reject(
            new Error("El nombre debe tener entre 2 y 40 caracteres.")
        );
    }

    if (!validarPassword(password)) {
        return Promise.reject(
            new Error("La contraseña debe tener al menos 4 caracteres.")
        );
    }

    return new Promise((resolve, reject) => {
        obtenerUsuarioPorNombre(nombreLimpio)
            .then((usuarioExistente) => {
                if (usuarioExistente) {
                    reject(
                        new Error(
                            "Ya existe un usuario con ese nombre."
                        )
                    );
                    return;
                }

                const salt = generarSalt();
                const hash = generarHashPassword(password, salt);

                database.run(
                    `
                        INSERT INTO usuarios (
                            nombre,
                            password_hash,
                            password_salt,
                            fecha_creacion,
                            ultimo_acceso
                        )
                        VALUES (?, ?, ?, ?, ?)
                    `,
                    [
                        nombreLimpio,
                        hash,
                        salt,
                        fechaActual,
                        fechaActual
                    ],
                    function (error) {
                        if (error) {
                            reject(error);
                            return;
                        }

                        resolve({
                            id_usuario: this.lastID,
                            nombre: nombreLimpio,
                            fecha_creacion: fechaActual,
                            ultimo_acceso: fechaActual
                        });
                    }
                );
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function iniciarSesion(nombre, password) {
    const database = getDatabase();
    const nombreLimpio = nombre.trim();
    const fechaActual = new Date().toISOString();

    if (!validarNombreUsuario(nombreLimpio)) {
        return Promise.reject(
            new Error("Ingresá un nombre de usuario válido.")
        );
    }

    if (!validarPassword(password)) {
        return Promise.reject(
            new Error("Ingresá una contraseña válida.")
        );
    }

    return new Promise((resolve, reject) => {
        obtenerUsuarioPorNombre(nombreLimpio)
            .then((usuario) => {
                if (!usuario) {
                    reject(
                        new Error(
                            "No existe un usuario con ese nombre."
                        )
                    );
                    return;
                }

                if (!usuario.password_hash || !usuario.password_salt) {
                    reject(
                        new Error(
                            "Este usuario todavía no tiene contraseña configurada."
                        )
                    );
                    return;
                }

                const hashIngresado = generarHashPassword(
                    password,
                    usuario.password_salt
                );

                if (hashIngresado !== usuario.password_hash) {
                    reject(new Error("La contraseña no es correcta."));
                    return;
                }

                database.run(
                    `
                        UPDATE usuarios
                        SET ultimo_acceso = ?
                        WHERE id_usuario = ?
                    `,
                    [fechaActual, usuario.id_usuario],
                    (error) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        resolve({
                            id_usuario: usuario.id_usuario,
                            nombre: usuario.nombre,
                            fecha_creacion: usuario.fecha_creacion,
                            ultimo_acceso: fechaActual
                        });
                    }
                );
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function actualizarNombreUsuario(idUsuario, nuevoNombre) {
    const database = getDatabase();
    const nombreLimpio = nuevoNombre.trim();

    if (!validarNombreUsuario(nombreLimpio)) {
        return Promise.reject(
            new Error("El nombre debe tener entre 2 y 40 caracteres.")
        );
    }

    return new Promise((resolve, reject) => {
        obtenerUsuarioPorNombre(nombreLimpio)
            .then((usuarioExistente) => {
                if (
                    usuarioExistente &&
                    usuarioExistente.id_usuario !== idUsuario
                ) {
                    reject(
                        new Error(
                            "Ya existe otro usuario con ese nombre."
                        )
                    );
                    return;
                }

                database.run(
                    `
                        UPDATE usuarios
                        SET nombre = ?
                        WHERE id_usuario = ?
                    `,
                    [nombreLimpio, idUsuario],
                    (error) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        resolve({
                            id_usuario: idUsuario,
                            nombre: nombreLimpio
                        });
                    }
                );
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function actualizarPasswordUsuario(
    idUsuario,
    passwordActual,
    passwordNueva
) {
    const database = getDatabase();

    if (!validarPassword(passwordActual)) {
        return Promise.reject(
            new Error("Ingresá la contraseña actual.")
        );
    }

    if (!validarPassword(passwordNueva)) {
        return Promise.reject(
            new Error("La nueva contraseña debe tener al menos 4 caracteres.")
        );
    }

    return new Promise((resolve, reject) => {
        database.get(
            `
                SELECT
                    id_usuario,
                    password_hash,
                    password_salt
                FROM usuarios
                WHERE id_usuario = ?
                LIMIT 1
            `,
            [idUsuario],
            (error, usuario) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (!usuario) {
                    reject(new Error("No se encontró el usuario."));
                    return;
                }

                const hashActual = generarHashPassword(
                    passwordActual,
                    usuario.password_salt
                );

                if (hashActual !== usuario.password_hash) {
                    reject(
                        new Error(
                            "La contraseña actual no es correcta."
                        )
                    );
                    return;
                }

                const nuevoSalt = generarSalt();
                const nuevoHash = generarHashPassword(
                    passwordNueva,
                    nuevoSalt
                );

                database.run(
                    `
                        UPDATE usuarios
                        SET
                            password_hash = ?,
                            password_salt = ?
                        WHERE id_usuario = ?
                    `,
                    [nuevoHash, nuevoSalt, idUsuario],
                    (errorUpdate) => {
                        if (errorUpdate) {
                            reject(errorUpdate);
                            return;
                        }

                        resolve(true);
                    }
                );
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

//===PARA EL DASHBOARD, OBTENER EL PRÓXIMO BACKUP PROGRAMADO PARA UN USUARIO===
function obtenerProximoBackup(idUsuario) {
    const database = getDatabase();

    return new Promise((resolve, reject) => {
        database.get(
            `
            SELECT *
            FROM recordatorios_backup
            WHERE id_usuario = ?
            AND activo = 1
            ORDER BY proximo_backup ASC
            LIMIT 1
            `,
            [idUsuario],
            (error, row) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(row || null);
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

//==PARA EL DASHBOARD, OBTENER EL ÚLTIMO RESULTADO DE UNA SIMULACIÓN DE PHISHING PARA UN USUARIO==
function obtenerUltimoPhishing(idUsuario) {
    const database = getDatabase();

    return new Promise((resolve, reject) => {
        database.get(
            `
            SELECT *
            FROM simulaciones_phishing
            WHERE id_usuario = ?
            ORDER BY fecha_simulacion DESC
            LIMIT 1
            `,
            [idUsuario],
            (error, row) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(row || null);
            }
        );
    });
}


// ########Función que guarda el resultado de una trivia en la base de datos################.
function guardarResultadoTrivia(datos) {
    const database = getDatabase();
    const fechaActual = new Date().toISOString();

    return new Promise((resolve, reject) => {
        database.run(
            `
                INSERT INTO resultados_trivia (
                    id_usuario,
                    respuestas_correctas,
                    total_preguntas,
                    porcentaje,
                    nivel,
                    fecha_resultado
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                datos.id_usuario,
                datos.respuestas_correctas,
                datos.total_preguntas,
                datos.porcentaje,
                datos.nivel,
                fechaActual
            ],
            function (error) {
                if (error) {
                    reject(error);
                    return;
                }

                resolve({
                    id_resultado: this.lastID,
                    ...datos,
                    fecha_resultado: fechaActual
                });
            }
        );
    });
}

//===PARA EL DASHBOARD, OBTENER EL ÚLTIMO RESULTADO DE UNA TRIVIA PARA UN USUARIO===
function obtenerUltimaTrivia(idUsuario) {
    const database = getDatabase();

    return new Promise((resolve, reject) => {
        database.get(
            `
            SELECT *
            FROM resultados_trivia
            WHERE id_usuario = ?
            ORDER BY fecha_resultado DESC
            LIMIT 1
            `,
            [idUsuario],
            (error, row) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(row || null);
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

    obtenerUsuarioPorNombre,
    crearUsuarioConPassword,
    iniciarSesion,
    actualizarNombreUsuario,
    actualizarPasswordUsuario,

    guardarRecordatorioBackup,
    obtenerRecordatoriosBackup,
    eliminarRecordatorioBackup,
    marcarBackupRealizado,
    obtenerProximoBackup,

    guardarResultadoPhishing,
    obtenerUltimoPhishing,

    guardarResultadoTrivia,
    obtenerUltimaTrivia
};