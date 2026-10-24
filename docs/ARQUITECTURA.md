# Arquitectura del backend de referencia

Este documento describe la organización y los patrones del backend de referencia sin depender de su dominio. Los nombres entre ángulos son marcadores genéricos, no nombres de recursos concretos.

## 1. Estructura y responsabilidades

```text
backend/
├── src/
│   ├── config/          Configuración de la aplicación y lectura de entorno
│   ├── middlewares/     Identificación, registro y tratamiento transversal de peticiones
│   ├── routes/          Declaración y asociación de endpoints con controladores
│   ├── controllers/     Adaptación entre HTTP y operaciones de servicio
│   ├── services/        Reglas de aplicación y acceso coordinado a modelos
│   ├── modelos/         Esquemas, tipos y modelos de persistencia
│   ├── <módulo-app>     Ensamblado de Express y registro de middlewares/rutas
│   ├── <módulo-inicio>  Conexión inicial a la base de datos y arranque del servidor
│   ├── <módulo-db>      Apertura y cierre de la conexión a la base de datos
│   └── <módulo-error>   Tipo de error propio para fallos esperados de la API
├── dist/                Salida compilada de TypeScript
├── package.json         Metadatos, dependencias y scripts
└── tsconfig.json        Opciones del compilador TypeScript
```

Los archivos locales de entorno contienen configuración de ejecución y no forman parte del código fuente. El archivo de bloqueo de dependencias fija las versiones resueltas por el gestor de paquetes.

## 2. Capas y flujo de una petición

El recorrido lógico es:

```text
Ruta → middlewares aplicables → controlador → servicio → modelo → base de datos
```

- **Rutas:** asocian método y patrón de URL con una función del controlador. No deben contener reglas de negocio, consultas a la base de datos ni construir respuestas de negocio.
- **Middlewares:** realizan tareas transversales, como asignar un identificador, registrar la petición y normalizar errores. No deben ejecutar operaciones CRUD propias de una entidad.
- **Controladores:** extraen parámetros, query y body; invocan servicios; convierten el resultado a una respuesta HTTP y reenvían errores a Express. No deben contener consultas Mongoose, comprobar referencias ni albergar reglas de negocio.
- **Servicios:** implementan las operaciones y reglas de aplicación, componen consultas y coordinan modelos relacionados. No deben ocuparse de detalles HTTP como `Request`, `Response` o códigos de estado directamente en el envío de respuesta.
- **Modelos:** describen la estructura persistida, tipos, referencias y validaciones del esquema, y proporcionan la interfaz de persistencia. No deben manejar el ciclo HTTP ni decidir el formato de respuesta de la API.

Los controladores usan `try/catch` en operaciones asíncronas y pasan el error capturado al siguiente middleware. Así, el errorHandler centraliza la respuesta de error.

## 3. Registro de middlewares y rutas

El orden observado en el módulo que ensambla Express es:

1. **CORS:** habilita el acceso desde otros orígenes antes de que una ruta pueda responder.
2. **Parser JSON:** convierte los cuerpos JSON entrantes en datos disponibles para las rutas.
3. **Identificador de petición (`requestId`):** genera un identificador único y lo agrega a la respuesta como cabecera.
4. **Logger:** registra al finalizar cada respuesta el método, URL, identificador, código HTTP y duración.
5. **Rutas:** registra primero la comprobación de salud y luego los routers de recursos.
6. **404:** un middleware final convierte cualquier petición que no haya coincidido con una ruta en un error esperado de tipo 404.
7. **ErrorHandler:** último middleware; recibe los errores reenviados por rutas y middlewares anteriores y emite la respuesta JSON normalizada.

La ubicación al final del 404 y del errorHandler es importante: las rutas deben tener oportunidad de responder antes del 404, y el errorHandler debe poder recibir tanto errores de rutas como el 404 generado.

**Nota sobre el orden efectivo:** aunque el identificador y el logger sean componentes globales, en la referencia se registran después de CORS y del parser JSON. Por ello, un error producido al analizar un JSON mal formado puede ocurrir antes de asignar `requestId` y antes de que el logger observe la petición. No se ha cambiado ese comportamiento en esta documentación.

## 4. Configuración y conexión a la base de datos

La lectura y validación de variables de entorno está centralizada en la capa de configuración. El resto de módulos consume el objeto de configuración ya interpretado, en lugar de leer directamente `process.env`.

La conexión a la base de datos está separada en otro módulo: recibe la URI y el nombre de base de datos de la configuración, abre la conexión y ofrece una operación de cierre. El módulo de inicio espera a que la conexión se establezca antes de crear y poner a escuchar el servidor. Un fallo al conectar impide el arranque; no se transforma en una respuesta HTTP de una petición.

Esta separación mantiene distintas responsabilidades: **configuración** obtiene y valida valores; **conexión** administra el ciclo de vida del cliente de base de datos; **inicio** ordena el arranque de ambos y del servidor.

## 5. Convención de nombres

- Las carpetas agrupan componentes por capa y usan nombres descriptivos en plural.
- Los archivos de rutas, controladores y servicios usan el concepto de recurso en minúsculas y un sufijo que identifica la capa, por ejemplo: `<entidad-principal>.routes.ts`, `<entidad-principal>.controller.ts` y `<entidad-principal>.service.ts`.
- Los archivos de modelos usan el nombre del recurso con inicial mayúscula y el sufijo `.model.ts`, por ejemplo: `<EntidadPrincipal>.model.ts`.
- Los middlewares usan un nombre corto asociado a su responsabilidad y la extensión `.ts`.
- Los módulos transversales (configuración, conexión, composición de aplicación e inicio) tienen nombres que describen esa función.

Se conserva TypeScript en el código fuente; los módulos compilados se emiten en el directorio de salida indicado por TypeScript.

## 6. Manejo de errores

El errorHandler distingue errores por tipo y aplica las siguientes respuestas:

| Tipo | Cómo se reconoce | HTTP | JSON |
|---|---|---:|---|
| Error esperado de la API | Instancia de la clase propia `ApiError`; el estado se toma de su propiedad `status`. Los servicios la usan cuando un recurso o una referencia no existe. | El indicado al crear el error; para inexistencia, 404. | `{"error":"<mensaje>","requestId":"<id>"}` |
| Validación de esquema | `mongoose.Error.ValidationError`, por ejemplo, un campo requerido, enum o límite incumplido. | 400 | `{"error":"<mensaje de Mongoose>","requestId":"<id>"}` |
| Identificador con formato inválido | `mongoose.Error.CastError`, por ejemplo, al convertir un identificador incompatible con el tipo esperado. | 400 | `{"error":"<mensaje que identifica el valor y campo inválidos>","requestId":"<id>"}` |
| Error inesperado | Cualquier error que no corresponda a los casos anteriores. Se registra en el servidor y se evita enviar detalles internos al cliente. | 500 | `{"error":"Error interno del servidor","requestId":"<id>"}` |

La clase propia es `ApiError`, derivada de `Error`; no existe una clase separada para cada situación. La inexistencia de una referencia y la de un recurso principal se expresan ambas como `ApiError` con estado 404. El errorHandler no las clasifica en categorías distintas.

El identificador se incluye en las respuestas de error para correlacionarlas con los registros. Como se indica en la sección de middlewares, errores que ocurran antes de ejecutar `requestId` pueden no disponer de ese identificador.

## 7. Validación de referencias en servicios

Cuando una operación crea o cambia un documento que contiene una referencia a `<EntidadReferenciada>`, el servicio consulta primero el modelo referenciado con el identificador recibido. Si la consulta no encuentra el documento, el servicio lanza `ApiError` con estado 404 y no intenta guardar la operación dependiente.

La comprobación se hace en el servicio, no en el controlador. En lecturas que devuelven el documento relacionado, el servicio puede usar `populate` para resolver la referencia; en filtros o consultas anidadas también comprueba la existencia del documento padre cuando el contrato de la operación lo requiere. El esquema declara el tipo y el destino de la referencia, pero esa declaración por sí sola no comprueba que el documento destino exista.

## 8. Subdocumentos embebidos

La referencia no define un subdocumento embebido ni operaciones CRUD sobre él. Los documentos mostrados usan campos escalares, colecciones de valores simples y una referencia entre documentos; una referencia no equivale a una estructura embebida.

Por tanto, no hay un patrón implementado que pueda atribuirse a operaciones sobre `<SubdocumentoEmbebido>`. Si ese tipo de estructura se incorpora, la responsabilidad coherente con las capas existentes sería encapsular su manipulación en el servicio: cargar el documento padre, agregar/actualizar/eliminar el subdocumento mediante las operaciones del documento Mongoose y guardar el padre para aplicar las validaciones del esquema. Las rutas y los controladores seguirían limitados a transportar la petición y la respuesta.

## 9. Formato de respuestas

- **Lectura o actualización exitosa:** JSON con una propiedad de datos cuyo nombre corresponde al recurso y `requestId`.
- **Listado exitoso:** JSON con `total`, una colección de resultados y `requestId`.
- **Creación exitosa:** mismo envoltorio de recurso individual, con estado HTTP 201.
- **Eliminación exitosa:** estado HTTP 204, sin cuerpo.
- **Error:** JSON con `error` y `requestId`; el estado HTTP depende del tipo de error descrito en la sección 6.

La comprobación de salud usa una respuesta JSON pequeña de estado e identificador. No todas las respuestas exitosas tienen el mismo envoltorio, pero las que llevan cuerpo incluyen `requestId`.

## 10. Scripts, TypeScript y entorno

### Scripts del gestor de paquetes

| Script | Propósito |
|---|---|
| `dev` | Ejecuta el servidor en modo desarrollo con recarga al cambiar archivos TypeScript. |
| `build` | Compila el proyecto con el compilador TypeScript. |
| `start` | Ejecuta con Node.js el punto de entrada ya compilado. |

### Configuración de TypeScript

La configuración observada compila a **ES2020**, usa módulos **CommonJS**, activa el modo estricto, habilita interoperabilidad con módulos, coloca la salida en `dist` y limita las fuentes incluidas a `src`. También comprueba la consistencia de mayúsculas en nombres de archivo y omite la comprobación de declaraciones de tipos de dependencias.

### Variables de entorno

| Variable | Requerida | Comportamiento |
|---|---|---|
| `MONGODB_URI` | Sí | URI de conexión. Si falta, la configuración falla y el servidor no inicia. |
| `MONGODB_DB` | No | Nombre de la base de datos; si se omite, se usa un valor predeterminado definido por la configuración. |
| `PORT` | No | Puerto HTTP; si se omite, se usa el puerto predeterminado `3000`. |
