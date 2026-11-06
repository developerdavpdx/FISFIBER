# Datos demo y ajustes (nov-2026)

Documento de referencia de los cambios hechos para que la aplicación tuviera
información de demostración, y de las correcciones aplicadas a los SPs y a la
web durante ese trabajo.

> Los datos demo **se conservan** en `FISYS1`. Todo lo creado usa el prefijo
> `DEMO` para poder identificarlo.

---

## 1. Datos demo creados

Entorno: `WIN-RAFPRITOIEC` / `FISYS1` · mes de la demo: **noviembre 2026**.

### Maestros SAP (vía Service Layer)

| Objeto | Detalle |
|---|---|
| `OMRC` (fabricantes = líneas) | 6: `10`, `11`, `006`, `L-A1`, `L-A2`, `L-A3` con `U_Activo='Si'`, `U_HrsProg/2/3=8`, `U_EfProg=17` (kg/hora), `U_Meta=3000`, `U_Tolerancia=5`, `U_MetaNc=3`, `U_ToleranciaNc=1`, `U_SrapMax=5`, `U_Local='DEMO'` |
| `OITM` (artículos) | 6 terminados `DEMO-10`, `DEMO-11`, `DEMO-006`, `DEMO-LA1`, `DEMO-LA2`, `DEMO-LA3` (batch-managed, `U_pesoxpieza=25.5`, `U_pesoxpiezamin=24`, receta POLIESTER/ALGODON) + 2 materias primas `MOLIDO FB`, `MOLIDO MODACRYL` |
| `OCRD` | `DEMO-C001` / Cliente DEMO / RFC `XAXX010101000` (la localización MX exige RFC) |
| `OITB` | se usó el grupo existente `100 - Artículos` (se le fijaron cuentas WIP) |
| `ITT1` (BOM) | 1 por artículo: 100 de `MOLIDO FB` + 50 de `MOLIDO MODACRYL` por unidad; `IssueMthd='M'`, `WipActCode='11320000'` |

### Maestros creados por SQL (SL los rechazaba)

| Objeto | Detalle |
|---|---|
| `OWHS` | 3 almacenes copiando la fila `01`: `PROD` (`U_Activo='1'`), `49` (`U_Activo='2'`), `26` (`U_Activo='3'`) |

> Motivo: al crear/editar almacenes por SL, la localización devuelve
> `-5002 "One of the inventory accounts is missing, 'Allocation Account'"`
> y SL no expone ese campo. Sólo es maestro, sin triggers.

### Documentos (todos vía Service Layer)

| Documento | Cantidad | Notas |
|---|---|---|
| `ORDR` (OV) | 9 | 6 ligadas a OF + 2 sin OF (para que aparezcan “familias”) + 1 de prueba |
| `OWOR` (OF) | 8 | 7 cerradas (`Status='L'`) y 1 liberada; `ProductionOrderOrigin=bopooSalesOrder`, `U_Status` = `DocNum` de la OV |
| `OIGE` (consumo de componentes) | 7 | `BaseType=202` contra la OF |
| `OIGN/IGN1` (recepciones de producción) | 21 | 18 de producción (3 por línea, turnos 1/2/3, días 03–05 nov) + 2 de no conforme (almacén `49`) + 1 de stock inicial |
| `OBTN/OIBT/ITL1/OITL` | 21 lotes | con `U_FechaIns`, `U_Conforme`, `U_EstatusConf`, `U_EtapaIns1..2`, `U_Ancho`, `U_Peso`, `U_Gm2`, `U_ov`, `U_Cantidadenmtos` |

### Datos propios de la app (SQL)

| Tabla | Contenido |
|---|---|
| `TblPdxFFPlanProduccion` / `...Details` | 6 folios `DEMO-NOV-*` (uno por línea) con `StatusProduccion=3` para el panel **En Proceso** |
| `TblPdxFFParosMantenimiento` | 12 paros en nov-2026 (2 por línea, estatus 3) |
| `@FFISA_HORARIOS_PROD` | 3 turnos (`1` 06:00–14:00, `2` 14:00–22:00, `3` 22:00–06:00) para que `Pdxfn_GetTurnoPorRangoParos` resuelva turno |

### Producción resultante (nov-2026)

| Línea | Kilos | Incluye NC |
|---|---|---|
| `10` | 1,215 | 15 kg NC |
| `11` | 1,200 | — |
| `006` | 1,200 | — |
| `L-A1` | 1,200 | — |
| `L-A2` | 1,210 | 10 kg NC |
| `L-A3` | 1,200 | — |

---

## 2. Correcciones a stored procedures

Los scripts quedaron versionados en `database/sp/`.

| SP | Problema | Solución |
|---|---|---|
| `SpPdxFF_GetMolidoConsumido` | Comparaba el producto terminado de la OF contra el componente (`OV_Fibras.FibraOW = W1.ItemCode`), por lo que **siempre devolvía vacío**. Además duplicaba el consumo por cada recepción. | Compara el componente (`Fibra = W1.ItemCode`), agrupa el consumo por OF+componente y lo atribuye a la línea/turno del primer recibo. Respeta `@FI/@FF`. |
| `SpPdxFF_GetParosMantByFecha` | Ignoraba `@FI/@FF` y siempre consultaba el mes actual (`GETDATE()`). | Usa el rango recibido; si no llega, cae al mes actual. |
| `SpPdxFF_GetParosMantByDia` | Igual. | Igual. |
| `SpPdxFF_GetInspeccionesMesActual` | Ignoraba fechas (aunque el dashboard ya tenía filtros). | Se agregaron `@FI/@FF` opcionales (default: mes actual). |

---

## 3. Cambios en la web

| Archivo | Cambio |
|---|---|
| `Fisfiber/Models/AccesoDatos.cs` | `GCGetInfoInspec` ahora envía `@FI, @FF` |
| `Fisfiber/Controllers/DashboardController.cs` | `GetInfoInspecc` recibe `FI/FF`; `GetInfoConsumido` manda `FI/FF` nulos para no romper el SP |
| `Fisfiber/Scripts/Dashboard/dashboard.js` | `obtenerInfoInspec()` acepta y envía `FI/FF` desde los filtros de fecha |
| `Fisfiber/Views/Dashboard/Index.cshtml` | versión del script `?v=1.1.5` (cache-busting) |

Compilado con MSBuild (Debug) sin errores.

---

## 4. Otro ajuste incluido

`Fisfiber/Styles/PlanProduccion/ConsultaPlanProduccion.css`: se eliminó la regla

```css
article, aside, figcaption, figure, footer, header, hgroup, main, nav {
    display: inline-flex !important;
    width: auto !important;
    flex: none !important;
    white-space: nowrap;
}
```

que rompía el layout (sidebar de 92 px y navbar desbordado) en las 10 vistas que
cargan ese CSS, incluida `CreditoCobranza/PlanVentasCC`.

---

## 5. Verificación esperada del dashboard

Con línea `006` y rango `2026-11-01 .. 2026-11-06`:

- **En Proceso**: pedido `3`, `DEMO-006`, 1,200 kg
- **Soportes**: 2 paros
- **Inspección**: 3 lotes
- **Línea Día Turno**: HP `72`, Horas efectivas `71.08`, Eficiencia `99.30%`
- **Línea Total**: días `3`, T1 `400` kg, total `1,200` kg
- **MOLIDO CONSUMIDO**: FB `38,800` / MC `20,000`

Con línea `10`: total `1,215`, NC `15` (1.23%), inspección 4 (incluye lote NC).

Con un rango de **octubre** todos los paneles deben quedar vacíos (prueba de
que los filtros de fecha funcionan).

---

## 6. Consideraciones

- Varios SPs siguen tomando el **mes actual** si no reciben fechas
  (`GetInfoProduc`, y los que el JS no alimenta con `FI/FF`). Si la demo se
  mueve de mes, hay que reinsertar los datos o ajustar esos SPs.
- `GetMolidoConsumido` sólo considera OF con `Status='L'` (cerradas).
- “Familias” sólo muestra `Artículos (100)` porque la compañía tiene un único
  grupo de artículos; para que aparezca una OV debe **no tener OF** o tenerla
  cerrada.
- Los datos demo se conservan. Si algún día hay que limpiarlos, los
  identificadores son: `DEMO-%` (artículos/OV/cliente/lotes/planes),
  `MOLIDO %` (materias primas), almacenes `PROD/49/26`,
  fabricantes `1..6` y paros con `Fecha LIKE '2026-11%'` y `UsuarioRealizo='DEMO'`.

---

## 7. Otros módulos (Compras, Logística y catálogos)

### 7.1 Compras → `Compras/ChecklistDoc`

| Dato | Detalle |
|---|---|
| Proveedor | `DEMO-P001` / Proveedor DEMO SA / RFC `XAXX010101000` |
| OCs (`OPOR/POR1`) | 3 (`DocNum` 1–3, 4, 5 y 6 nov) con `MOLIDO FB` y `MOLIDO MODACRYL` |

Creadas por SL (`POST /PurchaseOrders`). No requirieron impuestos porque la
compañía no tiene grupos de IVA (`OVTG` está vacía).

### 7.2 Unidades → `Unidad/Unidades`

- El SP `SpPdxFF_GetUnidadesActivas` lee **`@FFISA_ADUNI`** (no
  `TblPdxFFUnidades`), que estaba vacía. Se insertaron 4 unidades.
- **Bug corregido**: `UnidadViewModel.Capacidad` era `int` y el SP devuelve
  `numeric` → la vista lanzaba **HTTP 500** en cuanto había datos. Ahora es
  `decimal` y se formatea en `Views/Unidad/Unidades.cshtml`.

### 7.3 Plan de embarques

| Objeto | Detalle |
|---|---|
| `TblPdxFFPlanVentas` / `Details` | `PV-116` (abierto, 3 pedidos), `PV-117` (en monitoreo, 3 pedidos) y `PV-118` (finalizado/generado) |
| `TblPdxFFMonitorLogistica` | `M-001` con 3 detalles (OVs 1–3) |
| `ODLN` (entregas) | 2 entregas creadas por SL desde las OV `DocEntry` 8 y 9, con lote |
| `ORDR` | se llenaron `U_Unidad='1'`, `U_NumViaje='1'`, `U_Operador='1'` en las OV 7–9 para que el monitor muestre unidad/viaje/operador |

### 7.4 Catálogos (UDTs) cargados

| UDT | Contenido |
|---|---|
| `@FFISA_ADUNI` | 4 unidades (`Code`/`Name` = 1–4) |
| `@OPERADOR` | 2 operadores |
| `@FFISA_TIPOMTTO` | Correctivo, Preventivo, Predictivo |
| `@FFISA_RUBROMTTO` | Producción, Mantenimiento, Eléctrico, Mecánico |
| `@FFISA_ESTATUS_CARGA` | Programado, En carga, Cargado, Entregado |
| `@FFISA_ETIQUETA` | 2 plantillas |
| `@FFISA_IMPRESORAS` | 2 impresoras (una seleccionada) |
| `@FFISA_CAPACIDADES` | 3 filas (Cliente DEMO × DEMO-10/11/LA1) con capacidad 200/día |

> Detalle importante: `@FFISA_ADUNI.Code` debe ser numérico porque
> `SpPdxFF_GetPlanEmbMascCombinado` hace `TRY_CAST(un.Code AS INT)`.

---

## 8. Auditoría de vistas y notificaciones

### 8.1 Endpoints sin vista (404) corregidos

Estos `ActionResult` devolvían `View()` pero su `.cshtml` no existía (nadie los
enlazaba desde el menú). Ahora **redirigen** a la vista real:

| Endpoint | Antes | Ahora |
|---|---|---|
`/Produccion/InspeccionProducto` | 404 | → `/InspeccionProd/InspeccionProducto` |
`/PlanEmb/Index` | 404 | → `/PlanEmb/PlanEmbarques` |
`/PlanVentas/Index` | 404 | → `/PlanVentas/PlanVentas` |
`/Unidad/Index` | 404 | → `/Unidad/Unidades` |

### 8.2 Estado de las vistas (nov-2026)

Con datos: `Dashboard/Index`, `Compras/ChecklistDoc`, `CreditoCobranza/PlanVentasCC`,
`PlanProduccion/ConsultaEdicion`, `Reportes`, `ReporteOFconOV`,
`Produccion/ConsultaPlanProduccion`, `ReporteProduccion`, `ReporteOTTerminados`,
`ConsumoMateriaPrima`, `ParosProduccion`, `ReporteParosProduccion`,
`HojaEspecificaciones`, `GestionRecetas`, `PlanEmb/PlanEmbarques`,
`MascPlanEmb`, `PlanesGenerados`, `MonitorLog`, `Logistica/ConsultaEdicion`,
`PlanVentas/ConsultaEdicionPV`, `PlanesFinales`, `Unidad/Unidades`,
`InspeccionProd/InspeccionProducto`.

Asistentes (piden fecha y "Continuar", no están vacíos): `PlanProduccion/Index`,
`PlanVentas/PlanVentas`, `Logistica/Monitor`.

Parciales que no son páginas (se abren como modal vía AJAX, no tienen sentido
abiertas directo): `PlanVentas/AutorizacionPedidos`,
`PlanVentas/AutorizacionDeletePedidos`.

`Dashboard/Dashboard` es el dashboard viejo con gráficas **hardcodeadas**; el
que se usa es `Dashboard/Index`.

### 8.3 Notificaciones y correos

- **Destinatarios**: `SpPdxFF_GetEmailsByCode` lee `@FFISA_E_MAIL`. Se cargaron
  12 códigos (`NuevoPlanVentas`, `NotificacionCyC`, `SegundaRepro`,
  `AutPlanEmbarque`, `NotificacionAlmacen`, `Credito`, `Logistica`,
  `DevolucionCliente` y los `Test*`) con los correos
  `pdxdesarrollo@gmail.com;Pam3.galvan@gmail.com`.
- **Varios destinatarios por aviso**: `Code` es PK de `@FFISA_E_MAIL`, así que
  el SP se actualizó (`database/sp/SpPdxFF_GetEmailsByCode.sql`) para dividir
  `U_MailAuto` por `;` o `,` y devolver una fila por correo.
- **SMTP habilitado y probado**: `SMTP_HOST=smtp.gmail.com`,
  `SMTP_PORT=587`, cuenta `remotedesktoppdx@gmail.com`. Se enviaron correos de
  prueba a ambos destinatarios desde la app (`Global/SendEmails` →
  `{"success":true,"message":"Se enviaron correctamente 2 correo(s)."}`).
- **Bug menor corregido**: la clave `DevolucionCliente` en `Web.config` tenía
  un espacio al final (`"DevolucionCliente "`), por lo que nunca coincidía con
  el `Code` de la tabla.
- **Aviso in-app (campanita)**: el bloque sigue comentado en `_Layout.cshtml` y
  `TblPdxFFNotificaciones` está vacía. Existe integración con un servicio push
  externo (`https://pushnotifications-saso.vercel.app/api`), no requerido.
- **Nota de entorno**: `myaccount.google.com` estaba bloqueado a `0.0.0.0` en
  el archivo `hosts` de Windows; se comentó la entrada y se dejó respaldo en
  `hosts.bak-20261106`.
- **Limpieza**: se eliminó el endpoint muerto `Global/SendEmail` (singular),
  que tenía credenciales de Office365 hardcodeadas y no se usaba en ningún
  lado. Los flujos usan `Global/SendEmails` (configuración SMTP de
  `Web.config`).

---

## 9. Reserva de polietileno (implementada)

Pestaña **“Reserva de Polietileno”** en `Produccion/ConsultaPlanProduccion`:
registra el pesaje de resina por OF/línea (báscula + etiqueta + operador).

Faltaban los SPs y la tabla estaba vacía. Se crearon en `database/sp/`:

| SP | Función |
|---|---|
| `SpPdxFF_InsertaLineasFyGReservaPolietileno` | Inserta el pesaje (`CantPeso`, `UnidadPeso='kg'`, `FechaH`, `Etiqueta`, `Operador`) y devuelve la fila creada (el controlador la interpreta como respuesta) |
| `SpPdxFF_GetLineasReservasPolietileno` | Devuelve el histórico (`Id`, `Peso`, `Fecha`, `Etiqueta`, `Operador`) ordenado por Id desc |

- Etiqueta generada: `RP-<pedido>-<linea>-<yyMMdd-HHmmss>`.
- Se sembraron **6 registros** demo (pedidos 1,2,3,5,6,7) en
  `TblPdxFFReservaPolietilenoR`.
- Endpoints: `GET /PlanProduccion/GetInfoLineasRP` → `OK` con 6 filas;
  `POST /PlanProduccion/InsertaLineaRPolietileno` → `OK` y agrega el registro.
- La tabla de la pestaña pagina de 5 en 5 (`pageLength: 5` del helper), por eso
  se ven 5 filas y la 6ª en la página 2.
- No se requiere hardware de báscula para la demo: los pesajes se registran
  por el endpoint/SP.
