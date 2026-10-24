# ARQUITECTURA-FRONTEND
## 1. Estructura y responsabilidades
frontend/
├── src/
│   ├── api/                 Acceso HTTP y operaciones de API agrupadas por recurso
│   ├── components/          Navegación e ilustraciones reutilizables
│   │   └── ui/              Componentes visuales genéricos
│   └── paginas/             Vistas asociadas a las páginas y formularios
├── configuración del proyecto
├── dependencias instaladas
└── salida de compilación

En la raíz de src/ también están el punto de entrada de React, la composición de rutas, los tipos compartidos, la hoja de estilos global y las declaraciones de tipos para las variables de entorno.

No existen carpetas dedicadas a hooks, services, utils ni pruebas. La lógica de carga y estado está en las páginas; la lógica de API está agrupada bajo api/, no en una carpeta de servicios. Los tipos están en un módulo común, no en una carpeta propia. La salida de compilación y las dependencias instaladas no forman parte del código fuente.

## 2. Vite, TypeScript y variables de entorno
Vite usa el complemento de React y configura el servidor de desarrollo en el puerto 5173. También tiene un proxy para las solicitudes que coinciden con /<prefijo-api>, dirigido a un backend local en el puerto 3000.

TypeScript está configurado en modo estricto, con destino ES2020, resolución de módulos bundler, JSX de React y noEmit. La compilación ejecuta primero el chequeo de tipos y después genera la salida de Vite.

La URL base del backend se lee mediante import.meta.env.VITE_API_URL. Si la variable no existe, se usa una cadena vacía: las llamadas quedan como rutas relativas al origen actual y, durante el desarrollo, pueden pasar por el proxy de Vite. No se valida que la variable esté definida ni se genera un error de configuración explícito. Para que una compilación desplegada funcione, las rutas relativas deben resolverse desde el origen correcto o la variable debe contener la base apropiada.

## 3. Cliente HTTP y errores
No hay un cliente HTTP compartido separado. Cada módulo de API usa fetch y contiene una función equivalente para procesar las respuestas, por lo que parte de esa lógica está duplicada.

La URL se compone concatenando la base configurada con el prefijo de API y el recurso. Los parámetros de filtro se codifican para la URL; los envíos de formularios serializan los datos como JSON e indican el tipo de contenido.
Lanza un Error cuando la respuesta HTTP no es exitosa.
Intenta leer el JSON del error del backend y utiliza su propiedad error si está disponible; si no, genera un mensaje basado en el estado HTTP.
Si el cuerpo del error no se puede interpretar como JSON, continúa con un objeto vacío y usa el mensaje alternativo.
Ante un 204, devuelve undefined sin intentar leer JSON.
Las páginas capturan esos errores y muestran su message en el estado de error. No hay un tipo de error de API compartido ni una capa central de presentación de errores.

## 4. Servicios de API
El patrón agrupa las operaciones por recurso dentro de api/. Las funciones devuelven datos ya extraídos de los envoltorios de las respuestas del backend, no el objeto Response.
Para <EntidadPrincipal>, hay operaciones para:
Obtener una colección, opcionalmente filtrada.
Obtener un elemento por identificador.
Crear un elemento.
Actualizar un elemento por identificador.
Eliminar un elemento.
Las lecturas de colección devuelven <EntidadPrincipal>[]; la lectura individual, la creación y la actualización devuelven <EntidadPrincipal>; la eliminación devuelve Promise<void>.
Para <EntidadReferenciada>, hay operaciones para:
Obtener la colección.
Obtener elementos asociados a un identificador de <EntidadPrincipal>.
Crear un elemento.
Eliminar un elemento.
Las lecturas devuelven <EntidadReferenciada>[]; la creación devuelve <EntidadReferenciada>; la eliminación devuelve Promise<void>. No hay operación de actualización para este recurso.

## 5. Tipos TypeScript
Los tipos comunes modelan:
<EntidadPrincipal>, con identificador, campos de dominio y marcas de tiempo.
tipo de entrada de <EntidadPrincipal> generalizada como el tipo de entrada de <EntidadPrincipal>, omitiendo identificador y marcas de tiempo.
<EntidadReferenciada>, que incluye una referencia a <EntidadPrincipal> poblada en las respuestas de colección.
Los datos de formulario de <EntidadReferenciada>, cuya referencia se envía como identificador.
Uniones literales para campos de categoría o estado, junto con listas de valores permitidos.

Las formas de respuesta de colección o elemento individual se describen en cada llamada de API mediante tipos envoltorio inline; no hay interfaces compartidas para todas las respuestas. Tampoco existe un tipo TypeScript específico para los errores del backend: se convierten en instancias de Error.

En la vista de detalle se declara localmente una forma reducida para los elementos relacionados recibidos por la consulta anidada, donde la referencia no viene poblada.

## 6. Enrutamiento y navegación
El enrutamiento usa BrowserRouter, Routes y Route. Hay seis páginas: colección de <EntidadPrincipal> como inicio, alta de <EntidadPrincipal>, detalle de <EntidadPrincipal>, edición de <EntidadPrincipal>, colección de <EntidadReferenciada> y alta de <EntidadReferenciada>.
Las rutas, expresadas con placeholders, siguen esta estructura:
/ para la colección inicial.
/<EntidadPrincipal>/nueva para el alta.
/<EntidadPrincipal>/:id para el detalle.
/<EntidadPrincipal>/:id/editar para la edición.
/<EntidadReferenciada> para la colección relacionada.
/<EntidadReferenciada>/nuevo para el alta relacionada.
La navegación superior y el enlace de salto al contenido se colocan junto al conjunto de rutas. Las páginas usan enlaces del enrutador o navegación programática; el componente de contenido compartido aporta contexto de navegación, migas y presentación de mensajes de éxito enviados en el estado de la navegación.
No hay ruta comodín ni página 404 propia. Una dirección que no coincide con ninguna ruta no muestra una vista de error diseñada por la aplicación. Tampoco se observa una configuración de fallback del servidor para servir la aplicación en rutas profundas.

## 7. Estados de página
Las páginas de colección y detalle mantienen estados de carga y error y presentan un estado vacío cuando corresponde. La carga, el manejo de errores y las condiciones de renderizado se implementan en cada página con useState y useEffect.

Hay un componente reutilizable para mostrar avisos con variantes informativa, de error, éxito y vacío; sin embargo, no hay un hook ni un contenedor reutilizable que gestione los tres estados. Cada página decide cuándo mostrar el aviso y cuándo renderizar los datos.

La página inicial también carga datos agregados de ambos recursos para mostrar totales. Si esa carga auxiliar falla, el error se descarta y los valores permanecen en su estado inicial.

## 8. Formularios
Los formularios mantienen sus valores con estado local de React y usan controles controlados. La validación es manual en cliente:
El formulario de <EntidadPrincipal> exige que un campo de texto no esté vacío después de recortarlo. Convierte una lista separada por comas en un arreglo y usa controles numéricos con límites declarados en el elemento; no se aprecia una comprobación manual equivalente del rango antes del envío.
El formulario de <EntidadReferenciada> comprueba que la referencia, dos campos de texto y la fecha estén presentes. Un campo descriptivo es opcional.
El envío evita la navegación nativa del formulario, limpia el error previo, activa el estado de guardado, llama al servicio y navega al terminar. Los errores del servidor se capturan y se presentan en la página; el botón de envío queda deshabilitado mientras se guarda.
El componente de formulario de <EntidadPrincipal> sirve tanto para crear como para editar: determina el modo por la presencia del identificador, carga los datos existentes cuando corresponde y selecciona la operación de API adecuada.
El formulario de alta de <EntidadReferenciada> sí incluye un selector de <EntidadPrincipal>. Carga las opciones mediante la API y puede preseleccionar una referencia indicada en la URL; si no hay una referencia inicial, selecciona la primera opción disponible. No hay un formulario para editar <EntidadReferenciada>.

## 9. Componentes reutilizables y convenciones
Los componentes se agrupan por función: navegación e ilustraciones en components/, y elementos visuales generales en components/ui/. Estos últimos cubren avisos, botones, contenedores de página y confirmaciones.

Se usan componentes funcionales con nombres en PascalCase y props tipadas. Los componentes visuales aceptan variantes para modificar su presentación y, cuando corresponde, atributos estándar de HTML y className. Las páginas están en paginas/; los módulos de acceso a datos, en api/.

## 10. Estilos
El proyecto usa CSS global importado desde el punto de entrada. Define variables CSS para colores, líneas y espaciado, y organiza los selectores mediante clases con modificadores. Hay reglas para componentes, estados visuales y adaptación a tamaños de pantalla.

Se usa una biblioteca de estilos: Bootstrap. La estructura semántica, las tablas y los controles HTML se combinan con las clases definidas en la hoja global.

## 11. Scripts y dependencias principales
Los scripts disponibles son:
dev: inicia el servidor de desarrollo de Vite.
build: ejecuta el chequeo de TypeScript y compila la aplicación.
preview: sirve localmente la compilación para previsualizarla.
Las dependencias principales son React, React DOM y React Router DOM. Las herramientas de desarrollo incluyen Vite, su complemento para React, TypeScript y los tipos de React. No hay scripts de pruebas o lint configurados en el manifiesto, ni se encontraron pruebas bajo el código fuente.

## 12. Límites y capacidades no implementadas
No hay un cliente HTTP centralizado ni manejo global de errores.
No existe una página 404 explícita ni un hook reutilizable para los estados de carga, error y vacío.
El selector para asociar <EntidadPrincipal> sí existe en el alta de <EntidadReferenciada>; no corresponde documentarlo como ausente.
No hay edición de <EntidadReferenciada> ni edición de subdocumentos desde el formulario de <EntidadPrincipal>.
Los elementos relacionados se consultan y muestran en el detalle de <EntidadPrincipal>, pero su alta y eliminación se gestionan mediante páginas y operaciones propias; no como edición embebida del formulario principal.