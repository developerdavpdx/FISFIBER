# CONTEXT — FISFIBER (Web)

Documento de contexto para desarrolladores y agentes. Resume cómo está montada
esta solución, con qué entorno trabaja y cuáles son los valores válidos de
perfiles de usuario.

---

## 1. Qué es esta solución

Aplicación web ASP.NET MVC 5 (.NET Framework 4.8.1) que **no habla con SAP
directamente**. Toda operación de SAP la delega a la API REST `RESTAPIFFISA`.

```
Navegador
   │
   ├──► Web Fisfiber (IIS Express :44351)
   │        ├──► SQL Server  (DefaultConnection)  → tablas/procs propias (SpPdxFF_*)
   │        └──► API REST    (:52585)             → SAP B1 (DI API / Service Layer)
   │
   └── (no accede a SAP)
```

Único punto de integración con la API (`PlanProduccionController`):

```
POST {URLAPI}/WebApp/GenerarOF
Content-Type: application/x-www-form-urlencoded
PlanProduccion=<folios separados por coma>
```

La URL se resuelve en `Models/AccesoDatos.cs`:

```csharp
public string URLAPIPDX =>
    ConfigurationManager.AppSettings["Localhost"] == "true"
        ? ConfigurationManager.AppSettings["URLOCALAPI"]
        : ConfigurationManager.AppSettings["URLMASTERAPI"];
```

> `URLMASTERAPI` **debe** terminar en `/`; si no, la URL se concatena mal
> (`http://host:81WebApp/GenerarOF`).

---

## 2. Entorno de trabajo actual

| Componente | Valor |
|---|---|
| Web | IIS Express `http(s)://localhost:44351` |
| API REST | `http://localhost:52585` |
| SQL Server | `WIN-RAFPRITOIEC` / base `FISYS1` (SQL Server 2016) |
| SAP Service Layer | `https://WIN-RAFPRITOIEC:50000/b1s/v1` |

Credenciales: ver `Fisfiber/Web.config` (`DefaultConnection`, `SapUser`,
`SapPassword`). No se documentan aquí para no duplicar secretos.

Producción (referencia): `DAENERYS` / `PARADOX` / SL `https://daenerys:50000/b1s/v1`.
La cadena anterior está comentada en el `Web.config` de la API.

---

## 3. Perfiles de usuario (IMPORTANTE)

### 3.1 Dónde viven

- Se almacenan en **`OHEM.U_Perfil`** (texto libre, no hay tabla catálogo).
- Los devuelve el SP **`SpPdxFF_ValidaUsuario`** junto con `email`, `empleado`
  (nombre) y `existe`. Solo devuelve filas con `Active = 'Y'`.
- El login los guarda en:
  - cookie **`u_perfil`** (válida 1 día),
  - `sessionStorage["u_perfil"]`,
  - `Session["u_perfil"]` (servidor, pero **no se usa para autorizar**).
- La validación de acceso es **100% cliente**, en `Scripts/Layout/Layout.js`:
  - `validarUsuario("X")` → exige perfil `X` (o `Admin`)
  - `validarUsuarios(["X","Y"])` → exige uno del arreglo (o `Admin`)

### 3.2 Valores válidos

Deben coincidir **exactamente**: mayúsculas/minúsculas y acentos incluidos.
No son válidos `ADMIN`, `Administrador`, `admin`, `Logistica` (sin acento), etc.

| `U_Perfil` | Menú que se muestra | Páginas principales |
|---|---|---|
| `Admin` | Todos (incluye Inspección) | Todas — **bypass** de `validarUsuario(s)` y único que puede editar el Header ISO |
| `Planeación` | `#MenuPlaneacion` | `PlanProduccion`, `ConsultaPlanProduccion`, `Reportes`, `ReporteOFconOV` |
| `Producción` | `#MenuProduccion` | `Produccion/ConsultaPlanProduccion`, `GestionRecetas`, `HojaEspecificaciones`, reportes |
| `Mantenimiento` | `#MenuMantenimiento` | `Produccion/ParosProduccion`, `ReporteParosProduccion` |
| `Logística` | `#MenuLogistica` | `Unidad/Unidades`, `PlanEmb/PlanEmbarques`, `MascPlanEmb`, `PlanesGenerados`, `MonitorLog`, `Logistica/Monitor`, `Logistica/ConsultaEdicion` |
| `Compras` | `#MenuCompras` | `Compras/OCChecklist` |
| `Ventas` | `#MenuVentas` | `PlanVentas/PlanVentas`, `ConsultaEdicionPV`, `MascPlanEmb`, `PlanesFinales` |
| `Crédito` | `#MenuCyC` | `CreditoCobranza/PlanVentasCC` |
| `Almacén` | `#MenuAlmacen` | `PlanEmb/PlanEmbarques` |

Reglas adicionales en el código:

- `PlanEmb/MascPlanEmb`: `validarUsuarios(["Logística", "Ventas"])`
- `PlanEmb/PlanEmbarques`: `validarUsuarios(["Logística", "Ventas", "Almacén"])`
- `MonitorLog`: su validación está **comentada** → cualquier usuario logueado.
- `InspeccionProd/InspeccionProducto`: sin validación (solo el menú está oculto
  para quien no sea `Admin`).

### 3.3 Si el perfil no coincide

- No se muestra ningún menú (todos los `li` nacen con `menuHide`).
- Al entrar a una página con `validarUsuario(s)`, redirige al dashboard.

### 3.4 Deuda técnica conocida

- **No hay autorización en servidor**: no existe `[Authorize]` ni validación de
  `Session` en los controladores. Quien manipule la cookie `u_perfil` puede
  entrar a cualquier pantalla. La seguridad actual es solo cosmética.
- `OHEM.U_Perfil` es texto libre: un valor mal escrito deja al usuario sin menús.
- El comentario de `LoginController` dice `"Admin", "Usuario"`; **`Usuario` no
  existe** como perfil válido. Guiarse por `Layout.js`.

---

## 4. Configuración de encabezados ISO (`confighead.ini`)

- Ruta: `Fisfiber/App_Data/confighead.ini`.
- **No se versiona** (lo reescribe la app desde `Global/UpdateHeaderISO`).
- Plantilla versionada: `Fisfiber/App_Data/confighead.example.ini`.
- `IniConfigManager` es tolerante: si falta el archivo, la sección o la clave,
  devuelve un valor por defecto (las claves de fecha devuelven la fecha de hoy)
  en lugar de lanzar excepción.

---

## 5. Build / ejecución

```powershell
# Restaurar paquetes (obligatorio en un clon nuevo: packages/ está ignorado)
msbuild Fisfiber.sln /t:Restore /p:RestorePackagesConfig=true

# Compilar
msbuild Fisfiber.sln /t:Build /p:Configuration=Debug "/p:Platform=Any CPU"
```

- `bin/roslyn/csc.exe` lo copia el paquete
  `Microsoft.CodeDom.Providers.DotNetCompilerPlatform` **solo si los paquetes
  están restaurados**. Si falta, el runtime lanza `FileNotFoundException`.
- La web necesita la API encendida para generar órdenes de fabricación; si no
  responde, cae en el `catch` y marca "No es posible conectar con SAP...".

---

## 6. Pendientes / notas

- Hay un upgrade de paquetes **sin commitear** (`log4net 3.1.0 → 3.5.0`,
  SignalR y Microsoft.Extensions `9.0.5 → 10.0.14`). Validar antes de subir.
- Faltan 6 SPs `SpPdxFF_*` en `FISYS1` respecto al código (código de
  verificación, turnos/horarios, reserva de polietileno, tipo de producto).
  **Actualización nov-2026**: los de reserva de polietileno ya se crearon
  (`database/sp/SpPdxFF_InsertaLineasFyGReservaPolietileno.sql` y
  `SpPdxFF_GetLineasReservasPolietileno.sql`).
- `FISYS1` está prácticamente sin datos maestros (artículos, socios).

---

## 7. Dashboard: datos demo y fixes (nov-2026)

`FISYS1` **ya tiene datos de demostración** para el Dashboard de Producción
(noviembre 2026) y se conservan en la base. Todo lo creado usa el prefijo
`DEMO` / `MOLIDO` y los almacenes `PROD`, `49`, `26`.

- Detalle completo (qué se creó, cómo, cómo verificarlo y qué limpiar si algún
  día se requiere): **`docs/dashboard-demo-2026-11.md`**.
- SPs corregidos y versionados en **`database/sp/`**:
  - `SpPdxFF_GetMolidoConsumido` (el JOIN producto/componente nunca coincidía).
  - `SpPdxFF_GetParosMantByFecha` y `...ByDia` (ignoraban `@FI/@FF`).
  - `SpPdxFF_GetInspeccionesMesActual` (se le agregaron `@FI/@FF` opcionales).
- La web ahora pasa el rango de fechas a Inspecciones
  (`AccesoDatos.GCGetInfoInspec`, `DashboardController.GetInfoInspecc`,
  `Scripts/Dashboard/dashboard.js`; versión de script `?v=1.1.5`).
- Ojo: varios SPs siguen usando el **mes actual** si no reciben fechas, así que
  la demo sólo se ve en el mes en que se generaron los datos.

También hay datos demo en otros módulos (mismo documento, sección 7):
Compras (`3 OCs` + proveedor `DEMO-P001`), Logística (plan de embarques
`PV-116/117/118`, monitor `M-001`, 2 entregas en `ODLN`), Unidades
(`@FFISA_ADUNI`) y catálogos de paros/etiquetas/impresoras/capacidades.
Incluye un **fix de modelo**: `UnidadViewModel.Capacidad` pasó de `int` a
`decimal` (la vista `/Unidad/Unidades` daba HTTP 500 al haber datos).

Además (sección 8 del documento):
- Los endpoints `/Produccion/InspeccionProducto`, `/PlanEmb/Index`,
  `/PlanVentas/Index` y `/Unidad/Index` daban **404** (no existía su vista);
  ahora redirigen a la pantalla real.
- **Correos**: destinatarios en `@FFISA_E_MAIL` (códigos
  `NuevoPlanVentas`, `NotificacionCyC`, `AutPlanEmbarque`, `Logistica`, etc.)
  apuntando a `pdxdesarrollo@gmail.com` y `Pam3.galvan@gmail.com`. El SMTP ya
  está **habilitado y probado** (`smtp.gmail.com:587`,
  `remotedesktoppdx@gmail.com`). La campanita de notificaciones in-app sigue
  comentada en `_Layout`. 
