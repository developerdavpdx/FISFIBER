using log4net;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.IO;
using System.Text;

namespace Fisfiber.Controllers
{
    public class AccesoDatos
    {
        #region GeneralVariables

        private static readonly ILog log = LogManager.GetLogger(typeof(AccesoDatos));
        public string URLAPIPDX { get { return (ConfigurationManager.AppSettings["Localhost"].ToString() == "true" ? ConfigurationManager.AppSettings["URLOCALAPI"].ToString() : ConfigurationManager.AppSettings["URLMASTERAPI"]); } }
        #endregion

        #region GeneralCommands(Procedure declaration)

        #region Login
        //Comando general para validar usuarios
        public string GCValidaUsuarios { get { return "EXEC SpPdxFF_ValidaUsuario @email,@password"; } }
        #endregion

        #region OrdenesCompra
        //Comando general para obtener las ordenes de compra abiertas para el checklist
        public string GCOrdenesCompra { get { return "EXEC SpPdxFF_GetOrdenesCompra @Busqueda,@FI,@FF,@Series"; } }
        //Comando general para obtener los detalles de la OC abiertas para el checklist
        public string GCOrdenesCompraDetails { get { return "EXEC SpPdxFF_GetDetailsOrdenesCompra @DocEntry"; } }
        #endregion

        #region CreacionPP
        //Comando general para obtener las ordenes de venta abiertas que no cuentan con Orden De Fabricacion
        public string GCOrdenesVenta { get { return "EXEC SpPdxFF_GetOrdenesVenta @FI,@FF,@Series,@DocEntry,@usuario,@Lineas, @FolioFamilia, @NumFamilias"; } }
        public string GCOrdenesVentaOF { get { return "EXEC SpPdxFF_GetOrdenesVentaFabricacion @FI,@FF,@EstatusOV,@EstatusOF,@OV,@OF"; } }
        public string GCOrdenesFabricacionE { get { return "EXEC SpPdxFF_GetOrdenesFabricacion @FI,@FF,@Series,@DocEntry,@usuario,@Lineas, @FolioFamilia, @NumFamilias"; } }
        //Comando general para obtener los detalles de la OV
        public string GCOrdenesVentaDetails { get { return "EXEC SpPdxFF_GetDetailsOrdenesVenta @DocEntry"; } }
        public string GCOrdenesVentaDetailsML { get { return "EXEC SpPdxFF_GetDetailsOrdenesVentaML @DocEntry"; } }
        public string GCGetItemsByOV { get { return "EXEC SpPdxFF_GetItemsByOV @DocEntrys"; } }
        //Comando general para obtener las series de numeracion de las OV
        public string GCSeriesNumeracionDocs { get { return "EXEC SpPdxFF_GetSeriesNumeraciondDocs @ObjectCode"; } }
        public string GCLineas { get { return "EXEC SpPdxFF_GetLineas "; } }

        public string GCGetCapLinea { get { return "EXEC SpPdxFF_GetCapLinea @Linea "; } }
        public string GCGetTiempoParoPorDia { get { return "EXEC SpPdxFF_GetTiempoParoPorDia @Linea "; } }
        public string GCGetInfoProduct { get { return "EXEC SpPdxFF_GetInfoProduc @Linea "; } }
        public string GCGetMolidoLT { get { return "EXEC SpPdxFF_GetMolidoLT @Linea, @FI, @FF"; } }
        public string GCGetMolidoConsumidoLT { get { return "EXEC SpPdxFF_GetMolidoConsumido @Linea, @FI, @FF"; } }
        public string GCGetMolidoProducidoLT { get { return "EXEC SpPdxFF_GetProduccionMolidoByLinea @Linea, @FI, @FF"; } }
        public string GCGetInfoProGraf { get { return "EXEC SpPdxFF_PVGetPesoRollosPByPedido @Pedido "; } }
        public string GCGetInfoTotalPro { get { return "EXEC SpPdxFF_PVGetTotalPro @OF "; } }
        public string GCGetInfoTotalProL { get { return "EXEC SpPdxFF_PVGetTotalProL @Pedido "; } }
        public string GCGetInfoConsumido { get { return "EXEC SpPdxFF_GetConsumoPorOF @Pedido "; } }
        public string GCGetMaterialesPorOF { get { return "EXEC SpPdxFF_GetMaterialesPorOF @Pedido "; } }
        public string GCGetInfoLDT { get { return "EXEC SpPdxFF_GetTotalLDT @Linea, @FI, @FF, @NumF, @Alm"; } }
        public string GCGetInfoTurnosLDT { get { return "EXEC SpPdxFF_GetProdByTurnoLDT @Linea, @FI, @FF, @NumF, @Alm"; } }
        public string GCGetInfoEficienciaL { get { return "EXEC SpPdxFF_GetEficienciaLinea @Linea, @FI, @FF, @NumF, @Alm"; } }
        public string GCGetInfoTurnosNCLDT { get { return "EXEC SpPdxFF_GetProdLineaAlmacen @Linea,@Alm, @FI, @FF, @NumF"; } }
        public string GCGetNCTurnosLinea { get { return "EXEC SpPdxFF_GetNCByTurnoLDT @Linea,@FI, @FF, @NumF"; } }
        public string GCGetInfoTurnosMesLDT { get { return "EXEC SpPdxFF_GetProdByTurnoMesLDT @Linea, @FI, @NumF"; } }
        public string GCGetDiasLab { get { return "EXEC SpPdxFF_GetDiasLaborados @Linea, @FI, @NumF"; } }
        public string GCGetInfoMesLT { get { return "EXEC SpPdxFF_GetProdByTMesLT @Linea, @FI"; } }
        public string GCGetInfoLineaMesLT { get { return "EXEC SpPdxFF_GetProdLineaTotalMes @Linea, @FI, @FF, @Alm, @NumF"; } }
        public string GCGetInfoParos { get { return "EXEC SpPdxFF_GetParosMantByFecha @FI, @FF, @Linea, @Turno, @GrupoArticulos"; } }
        public string GCGetInfoInspec { get { return "EXEC SpPdxFF_GetInspeccionesMesActual @Linea, @GrupoArticulos, @Turno"; } }
        public string GCGetByDayParos { get { return "EXEC SpPdxFF_GetParosMantByDia @FI, @FF, @Linea, @Turno, @GrupoArticulos"; } }
        public string GCGetStockByArt { get { return "EXEC SpPdxFF_GetStockByArticulo  @Alm, @Pedido"; } }

        public string GCGetAlmacenes { get { return "EXEC SpPdxFF_PVGetAlmacenes"; } }
        public string GCGetOpRubro { get { return "EXEC SpPdxFF_GetOpRubro"; } }
        public string GCGetOpTipoMTO { get { return "EXEC SpPdxFF_GetOpTipoMTTO"; } }
        public string GCAllLineas { get { return "EXEC SpPdxFF_GetAllLineas "; } }
        public string GCLineasProduccion { get { return "EXEC SpPdxFF_GetLineasPlanesProduccion "; } }
        public string GCLineasProduccionT { get { return "EXEC SpPdxFF_GetLineasPlanesTerminadas "; } }
        public string GCGetInfoFamilias { get { return "EXEC SpPdxFF_GetFamilias "; } }
        public string GCGetInfoFamiliasDashboard { get { return "EXEC SpPdxFF_GetFamiliasDashboard "; } }
        //Comando general para obtener los detalles de la OV
        public string GCGeneraFolioPP { get { return "EXEC SpPdxFF_GeneraFolioPP"; } }
        //Comando general para insertar el plan de produccion(header)
        public string GCInsertaPlanProduccion { get { return "EXEC SpPdxFF_InsertaPlanProduccion @linea"; } }
        //Comando general para insertar las lineas del plan de producción
        public string GCInsertarPlanProduccionDetails { get { return "EXEC SpPdxFF_InsertaPlanProduccionDetails @folio,@ComentariosExtras,@UbicacionPropuesta,@HoraPropuesta,@UbicacionFinal,@Rollos,@PiezasProducidas,@DocEntry,@Pedido,@CodigoCliente,@Solicitado,@Linea,@Articulo,@DescripcionArticulo,@Almacen,@MetrosRollo,@HoraInicio,@HoraFinal,@TiempoProduccion,@CantidadMetros,@Comentarios,@FechaContabilizacion,@FechaFabricacion,@FechaEntrega,@Cliente,@CantidadKilos,@OrdenFabricacion,@EstatusProduccion, @Orden"; } }
        public string GCModifiPlanProduccionDetails { get { return "EXEC SpPdxFF_ModifiPlanProduccionDetails @folio,@ComentariosExtras,@UbicacionPropuesta,@HoraPropuesta,@UbicacionFinal,@Rollos,@PiezasProducidas,@DocEntry,@Pedido,@CodigoCliente,@Solicitado,@Linea,@Articulo,@DescripcionArticulo,@Almacen,@MetrosRollo,@HoraInicio,@HoraFinal,@TiempoProduccion,@CantidadMetros,@Comentarios,@FechaContabilizacion,@FechaFabricacion,@FechaEntrega,@Cliente,@CantidadKilos,@OrdenFabricacion,@EstatusProduccion, @Orden, @Usuario"; } }
        public string GCInsertarPlanProduccionDetailsM { get { return "EXEC SpPdxFF_InsertaPlanProduccionDetailsMuestra @folio,@ComentariosExtras,@UbicacionPropuesta,@HoraPropuesta,@UbicacionFinal,@Rollos,@PiezasProducidas,@DocEntry,@Pedido,@CodigoCliente,@Solicitado,@Linea,@Articulo,@DescripcionArticulo,@Almacen,@MetrosRollo,@HoraInicio,@HoraFinal,@TiempoProduccion,@CantidadMetros,@Comentarios,@FechaContabilizacion,@FechaFabricacion,@FechaEntrega,@Cliente,@CantidadKilos,@OrdenFabricacion,@EstatusProduccion, @Orden"; } }
        public string GCModificaPlanProduccionDetails { get { return "EXEC SpPdxFF_ModificaPlanProduccionDetails @folio,@ComentariosExtras,@UbicacionPropuesta,@HoraPropuesta,@UbicacionFinal,@Rollos,@PiezasProducidas,@DocEntry,@Pedido,@CodigoCliente,@Solicitado,@Linea,@Articulo,@DescripcionArticulo,@Almacen,@MetrosRollo,@Especificacion,@HoraInicio,@HoraFinal,@TiempoProduccion,@CantidadMetros,@Comentarios,@FechaContabilizacion,@FechaFabricacion,@FechaEntrega,@Cliente,@CantidadKilos,@OrdenFabricacion"; } }
        public string GCModificaPlanProduccionDetailsOF { get { return "EXEC SpPdxFF_ModificaPlanProduccionDetailsOF @folio,@ComentariosExtras,@UbicacionPropuesta,@HoraPropuesta,@UbicacionFinal,@Rollos,@PiezasProducidas,@DocEntry,@Pedido,@CodigoCliente,@Solicitado,@Linea,@Articulo,@DescripcionArticulo,@Almacen,@MetrosRollo,@Especificacion,@HoraInicio,@HoraFinal,@TiempoProduccion,@CantidadMetros,@Comentarios,@FechaContabilizacion,@FechaFabricacion,@FechaEntrega,@Cliente,@CantidadKilos,@OrdenFabricacion"; } }
        //Comando general para obtener las OV pendientes de general la orden de fabricación
        public string GCGetOrdenesFabricacionPendientes { get { return "EXEC SpPdxFF_GetOrdenesFabricacionPendientes @PlanProduccion"; } }
        //Comando general para actualizar las ordenes de ventas que ya se creo su orden de fabricacion
        public string GCUpdatePlanProduccionDetails { get { return "EXEC SpPdxFF_UpdatePlanProduccionDetails @id,@DocNumOF,@DocEntryOF,@StatusSap,@StatusProduccion, @Orden"; } }
        //Comando general para obtener el resultado final de el plan de produccion
        public string GCGetResultPlanProduccion { get { return "EXEC SpPdxFF_GetResultPlanProduccion @folios"; } }
        public string GCDeleteResultPlanProduccion { get { return "EXEC SpPdxFF_DeleteResultPlanProduccion @folios"; } }
        public string GCSpPdxFF_SeccionarPlanes { get { return "EXEC SpPdxFF_SeccionarPlanes @folio"; } }
        public string GCGetRevisionBitacora { get { return "EXEC SpPdxFF_GetRevisionBitacora @folio"; } }
        public string GCUnificarPlanes { get { return "EXEC SpPdxFF_UnificarPlanes @folios"; } }
        //Comando para validar los dias transcurridos desde que se genero la OV
        public string GCCheckTimeOV { get { return "EXEC SpPdxFF_CheckTimeOV @DocEntry"; } }
        //Comando para obtener los estatus de la OV
        public string GCGetEstatusPP { get { return "EXEC SpPdxFF_GetEstatusPP"; } }
        public string GCCheckConfigPP { get { return "EXEC SpPdxFF_VerificarConfigPP @correo"; } }
        public string GCOrdenarDetails { get { return "EXEC SpPdxFF_UpdateOrderByFolio @Folio"; } }
        public string GCDeleteItemPlanDetails { get { return "EXEC SpPdxFF_DeletePlanProduccionDetail @Id"; } }
        public string GCUpdateOrderRowsDetails { get { return "EXEC SpPdxFF_UpdateOrdenPlanDetails @JsonData"; } }
        public string GCUpdateOrdenPorFolio { get { return "EXEC SpPdxFF_ActualizarOrdenPorFolio @folio"; } }
        public string GCExisteRegistroPP { get { return "EXEC SpPdxFF_ExisteRegistroPP @DocEntry,@Pedido"; } }
        #endregion

        #region ConsultaPP
        public string GCGetConfigSN { get { return "EXEC SpPdxFF_GetConfigPlaneacionSN @usuario"; } }
        public string GCGetPlanesProduccion { get { return "EXEC SpPdxFF_GetPlanesProduccion @terminados, @Lineas, @FI, @FF"; } }
        public string GCUpdateHoraPropuesta { get { return "EXEC SpPdxFF_UpdateHoraPropuesta @folio"; } }
        public string GCUpdateSumCap { get { return "EXEC SpPdxFF_UpdateSumCap @folio"; } }
        public string GCUpdatePlanGenerado { get { return "EXEC SpPdxFF_UpdatePlanGenerado @Folio"; } }
        public string GCUpdatePendRevVentas { get { return "EXEC SpPdxFF_UpdatePendienteRevVentas @Folio"; } }

        
        public string GCGetSumCapOrder { get { return "EXEC SpPdxFF_GetSumCapOrder @folio"; } }
        public string GCUpdateTiempoProduccion { get { return "EXEC SpPdxFF_UpdateTiempoProduccion @folio"; } }
        public string GCGetPlanesProduccionDetails { get { return "EXEC SpPdxFF_GetPlanesProduccionDetails @usuario,@folio"; } }
        public string GCGetPlanProDetailsPlanEmb { get { return "EXEC SpPdxFF_GetPlanProDetailsPlanEmb @usuario,@folio"; } }
        public string GCGetPlanesProduccionDetailsHistorial { get { return "EXEC SpPdxFF_GetPlanesProduccionDetailsHistorial @usuario,@folio,@Linea"; } }
        public string GCGetPlanesProduccionDetailsCCP { get { return "EXEC SpPdxFF_GetPlanesProduccionDetailsCPP @usuario,@folio"; } }
        public string GCGetPlanesProduccionDetailsR { get { return "EXEC SpPdxFF_GetPlanesProduccionDetailsR @usuario,@folio"; } }
        public string GetBitacoraHeaderDetails { get { return "EXEC SpPdxFF_GetBitacoraHeaderDetails @folio,@tabla"; } }
        public string GCGetBitacora { get { return "EXEC SpPdxFF_GetBitacora @folio,@tabla"; } }
        public string GCetBitacoraPlanProduccionDetails { get { return "EXEC SpPdxFF_GetBitacoraPlanProduccionDetails @folio,@revision"; } }

        /// <summary>
        /// Registra el historial de versiones de el plan de produccion
        /// </summary>
        public string GCInsertarPlanProduccionHistorial { get { return "EXEC SpPdxFF_InsertaPlanProduccionHistorial @folio,@revision,@ComentariosExtras,@Prioridad,@UbicacionPropuesta,@HoraPropuesta,@UbicacionFinal,@Rollos,@PiezasProducidas,@DocEntry,@Pedido,@CodigoCliente,@Solicitado,@Linea,@Articulo,@DescripcionArticulo,@Almacen,@MetrosRollo,@Especificacion,@HoraInicio,@HoraFinal,@TiempoProduccion,@CantidadMetros,@Comentarios,@FechaContabilizacion,@FechaFabricacion,@FechaEntrega,@Cliente,@CantidadKilos,@OrdenFabricacion"; } }
        /// <summary>
        ///Registra movimientos en bitacora del plan de produccion (@folioPP,@descripcion,@usuario)
        /// </summary>
        public string GCInsertaBitacora { get { return "EXEC SpPdxFF_InsertaBitacora @folio,@descripcion,@usuario,@tabla"; } }
        /// <summary>
        /// Devuelve la configuracion de columas por usuario para el listado del plan de producción
        /// </summary>
        public string GCGetConfiguracionPP { get { return "EXEC SpPdxFF_GetConfiguracionPP @usuario"; } }
        public string GCGetConfiguracionPPI { get { return "EXEC SpPdxFF_GetConfiguracionPPI @usuario"; } }
        public string GCGetConfiguracionPPVP { get { return "EXEC SpPdxFF_GetConfiguracionPPVP @usuario"; } }
        public string GCInsertaConfiguracionPP { get { return "EXEC SpPdxFF_InsertaConfiguracionPP @usuario,@configuracion"; } }
        public string GCInsertaConfiguracionROV { get { return "EXEC SpPdxFF_InsertaConfiguracionROV @usuario,@configuracion"; } }
        public string GCInsertaConfiguracionPPI { get { return "EXEC SpPdxFF_InsertaConfiguracionPPI @usuario,@configuracion"; } }
        public string GCInsertaConfiguracionPPVP { get { return "EXEC SpPdxFF_InsertaConfiguracionPPVP @usuario,@configuracion"; } }
        public string GCUpdateConfigPPSN { get { return "EXEC SpPdxFF_UpdateConfigPSN @Usuario, @nombres"; } }
        public string GCGetConfigAPC { get { return "EXEC SpPdxFF_GetConfigAPC @usuario"; } }
        public string GCGetConfigROV { get { return "EXEC SpPdxFF_GetConfiguracionROV @usuario"; } }
        public string GCUpdateConfigAPC { get { return "EXEC SpPdxFF_UpdateAPC @USUARIO, @Nombre, @Valor"; } }
        public string GCUpdateConfigROV { get { return "EXEC SpPdxFF_UpdateROV @USUARIO, @Nombre, @Valor"; } }
        public string GCGetConfigOCAPC { get { return "EXEC SpPdxFF_GetConfigOCAPC @usuario"; } }
        public string GCUpdateConfigOCAPC { get { return "EXEC SpPdxFF_UpdateConfigOCAPC @Usuario, @JsonData"; } }

        public string GCDatosHojaEspecificaciones { get { return "EXEC SpPdxFF_GetHojaEsp @Articulo  "; } }
        public string GCHeaderHojaEsp { get { return "EXEC SpPdxFF_GetHeaderHoja "; } }
        public string GCUpdateHeaderHojaEsp { get { return "EXEC SpPdxFF_UpdateHeaderHojaEsp @Plantilla, @FechaLiberado, @FechaRevisado, @Tipo "; } }
        public string GCGetDataExtH { get { return "EXEC SpPdxFF_GetHeaderHoja "; } }
        public string GCInsertarParoMantenimiento { get { return "EXEC SpPdxFF_InsertarParoMantenimiento @Linea,@Fecha,@MotivoReparacion,@Solicitante,@Pedido"; } }
        public string GCGetDetParo { get { return "EXEC SpPdxFF_GetDetalleParo @Id"; } }

        #endregion

        #region CreacionML

        public string GCInsertaConfiguracionPushNot { get { return "EXEC SpPdxFF_InsertaConfiguracionPushNot @Usuario,@P256dh,@Auth,@Enpoint,@Dispositivo"; } }

        public string GCInsertaMonitorLogistica { get { return "EXEC SpPdxFF_InsertaMonitorLogistica"; } } //Crea un store similar a este para el plan de ventas

        public string GCInsertaMonitorLogisticaDetails { get { return "EXEC SpPdxFF_InsertaMonitorLogisticaDetails @folio,@DocEntry,@EstatusCarga,@TipoReparto ,@FechaPedido ,@FechaSolicitudProduccion ,@FechaOriginalEntrega ,@FechaEntrega ,@NumViaje ,@Pedido ,@CodigoCliente ,@Cliente ,@Comentarios ,@HoraEntrega ,@Articulo ,@CantidadMetros ,@NumRollos ,@PiezasEntrega ,@Cotejado ,@Direccion ,@HorarioCita,@EstatusReparto, @Orden"; } }
        public string GCUpdateMonitorLogisticaDetails { get { return "EXEC SpPdxFF_UpdateMonitorLogisticaDetails @DocEntry,@EstatusCarga,@TipoReparto ,@FechaOriginalEntrega ,@EstatusReparto"; } }
        public string GCGetEmailAuth { get { return "EXEC SpPdxFF_GetEmailAutorizacionesHHOC @Code"; } }

        public string GCInsertaConfiguracionML { get { return "EXEC SpPdxFF_InsertaConfiguracionML @usuario,@configuracion"; } }
        public string GCInsertaConfiguracionCML { get { return "EXEC SpPdxFF_InsertaConfiguracionCML @usuario,@configuracion"; } }
        #endregion

        #region ConsultaML
        public string GCGetPedidosParaEntregas { get { return "EXEC SpPdxFF_GetPedidosParaEntregas @fecha_entrega"; } }
        public string GCGetMonitorLogisticaDetails { get { return "EXEC SpPdxFF_GetMonitorLogisticaDetails @usuario,@folio"; } }
        public string GCGetMonitoresLogistica { get { return "EXEC SpPdxFF_GetMonitoresLogistica"; } }
        public string GCGetConfiguracionML { get { return "EXEC SpPdxFF_GetConfiguracionML @usuario"; } }
        public string GCGetConfiguracionCML { get { return "EXEC SpPdxFF_GetConfiguracionCML @usuario"; } }

        #endregion

        #region CreacionVentas
        public string GCInsertaPlanVentas { get { return "EXEC SpPdxFF_InsertaPlanVentas"; } } 
        //Inserta el detalle del plan de ventas
        public string GCInsertaPlanVentasDetails { get { 
        return
         "EXEC SpPdxFF_InsertaPlanVentasDetails @folio, @DocEntry, @F_Pedido, @F_SolicitudProduccion, @F_OriginalEntrega, @F_Entrega, @Pedido, @CodigoCliente, @Cliente, @ComentariosSN, @HoraEntrega, @Articulo, @CantidadMetros, @NumRollos, @PiezasEntrega, @Cotejado, @Direccion, @Comentarios, @NumeroViaje, @LineaProd_Real, @Cita, @HoraInicio, @HoraFin, @DistRecorrida, @Autotransporte, @Orden"; } }

        #endregion

        #region ConsultasPlanVentas
        public string GCGetPedidosEntregasVentas { get { return "EXEC SpPdxFF_GetPedidosEntregasVentas @fecha_entrega"; } }
        public string GCGetConfiguracionPE { get { return "EXEC SpPdxFF_GetConfiguracionPE @usuario"; } }
        public string GCUpdateParciales { get { return "EXEC SpPdxFF_UpdatePedidosParciales"; } }
        public string GCGetPlanesVentas { get { return "EXEC SpPdxFF_GetPlanesVentas @Status"; } }
        public string GCGetPlanesEmbarques { get { return "EXEC SpPdxFF_GetPlanesEmbarques"; } }
        public string GCGetInfoPv { get { return "EXEC SpPdxFF_GetInfoPV @Folio"; } }
        public string GCUpdateEstRevCC { get { return "EXEC SpPdxFF_UpdateStatusPvCC @Folio , @Estatus"; } }
        
        public string GCGetPlanesVentasCerrados { get { return "EXEC SpPdxFF_GetPlanesVentasCerrados @Status"; } }
        public string GCGetPlanesEmbFinalizados { get { return "EXEC SpPdxFF_GetPlanesEmbFinalizados"; } }
        public string GCGetPlanesVentasDetails { get { return "EXEC SpPdxFF_GetPlanesVentasDetails @Folio"; } }
        public string GCGetPedidosVentasByDocEntry { get { return "EXEC SpPdxFF_GetPedidosVentasByDocEntry @DocEntry"; } }
        public string GCGetIfoAuthOVByFolio { get { return "EXEC SpPdxFF_GetIfoAuthOVByFolio @Folio"; } }
        public string GCGetPedNoAuthOV { get { return "EXEC SpPdxFF_GetIfoPedNoAuthOV @Folio"; } }
        public string GCGetPedDelete { get { return "EXEC SpPdxFF_GetIfoPedidoDelete @Id"; } }
        public string GCUpdateAuthRepro { get { return "EXEC SpPdxFF_UpdateAuthRepro @ID, @Auth"; } }
        public string GCUpdateAuthDelete { get { return "EXEC SpPdxFF_UpdateAuthDeletePedido @ID, @Auth, @EstDelete"; } }

        public string GCGetPlanesVentasDetailsSAP { get { return "EXEC SpPdxFF_GetPlanesVentasDetailsSAP @Folio"; } }
        public string GCGetPlanesVentasDetailsByFolioP { get { return "EXEC SpPdxFF_GetPlanEmbDetailsCombinadoByFolio @Folio"; } }
        public string GCGetPlanVentasDetByFolio { get { return "EXEC SpPdxFF_GetPlanVentDetailsComByFolio @Folio"; } }
        public string GCFinalizarPlan { get { return "EXEC SpPdxFF_FinalizarPlanVenta @Folio"; } }
        public string GCUpdateOrderRowsDetailsV { get { return "EXEC SpPdxFF_UpdateOrdenPVDetails @JsonData"; } }
        public string GCUpdatePlanesVentasDetails { get { return "EXEC SpPdxFF_UpdatePlanVentasDetails @id, @HoraEntrega, @PiezasEntrega,@NumeroViaje "; } }
        public string GCUpdatePVAutorizacion { get { return "EXEC SpPdxFF_UpdateAutorizado @id,@Estatus "; } }
        public string GCGetEmiailsCode { get { return "EXEC SpPdxFF_GetEmailsByCode @Code "; } }

        public string GCDeleteItemPV { get { return "EXEC SpPdxFF_DeletePedidoPV @Id"; } }

        #endregion

        #region PlanEmbarques

        #endregion

        public string GCGetPlanEmbDetailsSAP { get { return "EXEC SpPdxFF_GetPlanEmbDetailsByFolioSAP "; } }
        public string GCGetPlanEmbDetails { get { return "EXEC SpPdxFF_GetPlanEmbDetailsByFolio "; } }
       //VIEJO STORE PARA PLAN EMBARQUES
        public string GCGetPlanEmbDetailsCom { get { return "EXEC SpPdxFF_GetPlanEmbDetailsCombinado "; } }
        //NUEVO
        public string GCGetPlanEmbDetailsComV2 { get { return "EXEC SpPdxFF_GetPlanEmbDetailsCombinado2 "; } }
        public string GCGetPlanEmbDetComFolio { get { return "EXEC SpPdxFF_GetPlanEmbDetailsCombFolio @Folio"; } }

        public string GCUpdatePedidosInPlanEmb { get { return "EXEC SpPdxFF_ActualizarEstatusPedidos "; } }
        public string GCUpdateEstatusCarga { get { return "EXEC SpPdxFF_UpdateEstatusCargaPedido @IdPedido, @IdNuevoEstado "; } }
        public string GCUpdatePedidosInPlanEmbFolio { get { return "EXEC SpPdxFF_ActEstPedidosByFolio @Folio"; } }
        public string GCGetPlanEmbDetailsGenerados { get { return "EXEC SpPdxFF_GetPlanEmbDetailsGenerados @Folio"; } }
        public string GCGetPlanEmbAct { get { return "EXEC SpPdxFF_GetFolioPlanEmbAct "; } }
        public string GCGetInfoPlanEmbAct { get { return "EXEC SpPdxFF_GetInfoFolioPlanEmbAct @Folio "; } }
        public string GCGetResumenEnvios { get { return "EXEC SpPdxFF_GetResumenEnviosByFolio @Folio "; } }
        public string GCGetCapacidadesPlanEmb { get { return "EXEC SpPdxFF_GetCapacidadesPlanEmb "; } }
        public string GCGetCapacidadesPlanEmbFolio { get { return "EXEC SpPdxFF_GetCapacidadesPlanEmbFolio @Folio"; } }
        public string GCGetCapPedidoId { get { return "EXEC SpPdxFF_GetCapPedidoId @IdPedido"; } }
        public string GCGetPedidosNoAuth { get { return "EXEC SpPdxFF_GetPlanVentasNoAutorizadas @folio"; } }
        public string GCGetRecibosPorPedido { get { return "EXEC SpPdxFF_GetRecibosPorPedido @Folio"; } }
        public string GCGetCapByPedido { get { return "EXEC SpPdxFF_GetCapacidadesByPedido @IdPedido"; } }
        public string GCGetCapByPedidoTest { get { return "EXEC SpPdxFF_GetCapacidadesByPedidoTest @IdPedido"; } }
        public string GCGetOperadores { get { return "EXEC SpPdxFF_GetOperadores"; } }
        public string GCGetUniOp { get { return "EXEC SpPdxFF_GetUniOp"; } }
        public string GCGetTipoUnidades { get { return "EXEC SpPdxFF_GetTipoUnidadesActivas"; } }
        public string GCGetLocales { get { return "EXEC SpPdxFF_GetLocales"; } }
        public string GCGetSumPzsEntregaPedido { get { return "EXEC SpPdxFF_GetSumPzsEntregaPedido @Folio, @Pedido"; } }
        public string GCGetEstatusCarga { get { return "EXEC SpPdxFF_GetEstatusCarga"; } }
        public string GCGetEstatusCargaAutEmb { get { return "EXEC SpPdxFF_GetEstatusCargaAutEmb"; } }
        public string GCGetFacturasByFolio { get { return "EXEC SpPdxFF_GetUltimaFacturaByFolio @Folio"; } }
        public string GCGetRemisionadosByFolio { get { return "EXEC SpPdxFF_GetPedidosConLibRem @Folio"; } }
        public string GCUpdatePlanEmb { get { return "EXEC SpPdxFF_UpdatePlanEmbDetails @Id, @DocEntry, @Unidad,  @NumeroViaje,   @PiezasEntrega,  @Operador, @Ayudante1, @Ayudante2, @Ayudante3, @Ayudante4, @LocalCarga,@TipoUnidad ,@Orden"; } }
        public string GCDuplicarPedido { get { return "EXEC SpPdxFF_DuplicarPedido @IdOrigen, @Pedido, @Unidad,  @NumeroViaje,   @PiezasEntrega,  @Operador, @Ayudante1, @Ayudante2, @Ayudante3, @Ayudante4, @LocalCarga,@TipoUnidad ,@Orden"; } }
        public string GCUpdatePlanEmbAlm { get { return "EXEC SpPdxFF_UpdatePlanEmbAlm @Id, @DocEntry, @LocalCarga, @UbicacionProducto"; } }
        public string GCInsertNuevoEnvio { get { return "EXEC SpPdxFF_EnviosPedidoInsert @IdPlanDetalle,@Unidad, @TipoUnidad, @Operador, @HoraInicio, @HoraFin, @PiezasAsignadas"; } }
        public string GCDeletePedidoEmb { get { return "EXEC SpPdxFF_DeleteLogicPlanVentasDetail @Id"; } }
        public string GCGetMascPlanEmb { get { return "EXEC SpPdxFF_GetPlanEmbMascCombinado"; } }
        public string GCGetMascPlanEmbFolio { get { return "EXEC SpPdxFF_GetPlanEmbMascCombinadoByFolio @Folio"; } }
        public string GCGetPedidosInPP { get { return "EXEC SpPdxFF_GetPedidosInPlanProduccion"; } }
        public string GCAuthPlanEmbVentas { get { return "EXEC SpPdxFF_AuthPlanEmbByVentas @Folio"; } }
        public string GCUpdatePlanEmbFinalizado { get { return "EXEC SpPdxFF_UpdatePlanEmbFinalizado @Folio"; } }
        public string GCUpdateCommentsEstPedido { get { return "EXEC SpPdxFF_UpdateCommentsEstPedido @Id, @Com"; } }
        public string GCUpdateEstPedidoPlanEmb { get { return "EXEC SpPdxFF_UpdateEstPedido @Id, @Estatus, @Comentario"; } }
        public string GCUpdateCargaPedido { get { return "EXEC SpPdxFF_UpdateCargaPedido @DocEntry, @Pzs"; } }
        public string GCSaveEntradaPedidoInPV { get { return "EXEC SpPdxFF_SaveEntradaPedidoInPV @DocEntryEntrega"; } }
        public string GCGetLotesPorArticulo { get { return "EXEC SpPdxFF_GetLotesPorArticulo @Articulo"; } }
        public string GCGetNewLote { get { return "EXEC SpPdxFF_GetLotesPorSisNum @SisNum"; } }
        public string GCUpdatePedidoCargado { get { return "EXEC SpPdxFF_UpdatePedidoCargado @Id"; } }

        #region ReservaPolietileno
        public string RPInsertaLineaReservaPolietileno { get { return "EXEC SpPdxFF_InsertaLineasFyGReservaPolietileno  @PlanProduccion, @OrdenFabricacion, @Pedido, @Linea, @Peso, @Operador"; } }


        #endregion

        #region ConsultaUnidades
        public string GCGetUnidadesActivas { get { return "EXEC SpPdxFF_GetUnidadesActivas "; } }
        public string GCGetEstadosUnidadesActivas { get { return "EXEC SpPdxFF_GetEstadosActivosUniades "; } }
        public string GCUpdateEstoUnidad { get { return "EXEC SpPdxFF_UpdateEstadoUnidad @Id, @Estado, @Comentarios, @Operador, @Ayudante1, @Ayudante2, @Ayudante3, @Ayudante4 "; } }

        #endregion

        #region Produccion
        public string GCGetParosProduccion { get { return "EXEC SpPdxFF_GetParosProduccion"; } }
        public string GCActualizarParoMantenimiento
        {
            get
            {
                return "EXEC SpPdxFF_ActualizarParoMantenimiento " +
                       "@ID, @FechaFin, @Usuario, @Tipo, @Rubro, @Orden, @Obs";
            }
        }
        public string GCReporteParosHistoricos
        {
            get
            {
                return "EXEC SpPdxFF_GetParosHistoricos " +
                       "@Inicio,@Fin,@Linea";
            }
        }
        #endregion

        #region GLOBAL
        public string GCInsertUserPushNot { get { return "EXEC SpPdxFF_InsertaConfiguracionPushNot @usuario , @p256dh , @auth , @endpoint , @disp "; } }
        public string GCNotifiNoLeidas { get { return "EXEC SpPdxFF_GetNotificacionesNoLeidas @usuario "; } }
        public string GCNotifiLeidas { get { return " EXEC SpPdxFF_MarcarNotificacionesComoLeidas @ids "; } }
        public string GCGetMetaDataSBO { get { return " EXEC SpPdxFF_GetMetaDataSBO @tabla,@campodefinido "; } }

        #endregion

        #endregion

        #region SQLFunctions
        //Ejecutar un query de resultado simple
        public string ExecuteSingleSelectQuery(string commandText, Dictionary<string, string> parameters)
        {
            string result = string.Empty;
            using (SqlConnection myConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString))
            {
                try
                {
                    myConnection.Open();

                    using (SqlCommand command = new SqlCommand(commandText, myConnection))
                    {
                        if (parameters != null && parameters.Count > 0)
                        {
                            foreach (var parameter in parameters)
                            {
                                command.Parameters.AddWithValue("@" + parameter.Key, parameter.Value);
                            }
                        }

                        command.CommandType = CommandType.Text;

                        // Ejecuta el comando y obtén el resultado
                        result = (string)command.ExecuteScalar();
                    }
                }
                finally
                {
                    if (myConnection.State == ConnectionState.Open)
                    {
                        myConnection.Close();
                    }
                }
            }

            return result;
        }
        //Ejecutar query de resultado multiple en formato JSONSTRING
        public string ExecuteProcedure(string commandText, Dictionary<string, string> parameters)
        {
            string result = string.Empty;
            using (SqlConnection myConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString))
            {
                try
                {
                    myConnection.Open();

                    using (SqlCommand cmd = new SqlCommand(commandText, myConnection))
                    {
                        cmd.CommandTimeout = 240;

                        if (parameters != null && parameters.Count > 0)
                        {
                            foreach (var parameter in parameters)
                            {
                                if (parameter.Value == null)
                                {
                                    cmd.Parameters.AddWithValue("@" + parameter.Key, DBNull.Value);
                                }
                                else
                                {
                                    cmd.Parameters.AddWithValue("@" + parameter.Key, parameter.Value);
                                }
                            }
                        }
                        cmd.CommandType = CommandType.Text;

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            using (StringWriter sw = new StringWriter())
                            using (JsonTextWriter jsonWriter = new JsonTextWriter(sw))
                            {
                                DataTable dtDocuments = new DataTable();
                                dtDocuments.Load(reader);

                                JsonSerializer serializer = new JsonSerializer();
                                serializer.Serialize(jsonWriter, dtDocuments);
                                result = sw.ToString();

                                //JsonSerializer serializer = new JsonSerializer
                                //{
                                //    // Configuraciones para escapar caracteres conflictivos y mejorar legibilidad
                                //    StringEscapeHandling = StringEscapeHandling.EscapeNonAscii,
                                //    Formatting = Formatting.Indented // Cambiar a None si no necesitas el formato legible
                                //};
                            }
                        }
                    }
                }
                catch (Exception E)
                {
                    StringBuilder Error = new StringBuilder();
                    Error.Append("Error: ");
                    Error.Append(E.Message ?? "");
                    Error.Append(E.InnerException != null ? E.InnerException.ToString() : "");
                    result = Error.ToString();
                }
                finally
                {
                    if (myConnection.State == ConnectionState.Open)
                    {
                        myConnection.Close();
                    }
                }
            }

            return result;
        }

        #endregion

        #region AditionalClassModel
        public class JsonResponse
        {
            public string Status { get; set; }
            public string Message { get; set; }
            public object Data { get; set; }
            public object Data2 { get; set; }
            public object Data3 { get; set; }
            public string ExtraData { get; set; }
            public string Other { get; set; }
        }

        public Dictionary<string, string> RequestParameters { get; set; }

        public class Documentos
        {

            //ID DOCUMENTO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string DocEntry { get; set; }

            //FOLIO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Folio { get; set; }

            //COMENTARIOS EXTRAS
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string ComentariosExtras { get; set; }

            //PRIORIDAD DE ORDEN
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Prioridad { get; set; }

            //ROLLOS
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Rollos { get; set; }

            //PIEZAS PRODUCIDAS
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string PiezasProducidas
            {
                get => _piezasproducidas ?? "";  // Si _comentarios es null, devolver una cadena vacía
                set => _piezasproducidas = value;
            }

            private string _piezasproducidas;

            //PEDIDO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Pedido { get; set; }

            //CODIGO CLIENTE
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string CodigoCliente { get; set; }

            //SOLICITADO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Solicitado
            {
                get => _solicitado ?? "";  // Si _comentarios es null, devolver una cadena vacía
                set => _solicitado = value;
            }

            private string _solicitado;

            //LINEA
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Linea { get; set; }

            //ARTICULO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Articulo { get; set; }

            //DESCRIPCION ARTICULO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string DescripcionArticulo { get; set; }

            //ALMACEN
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Almacen { get; set; }

            //METROS X ROLLO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string MetrosRollo { get; set; }

            //ESPECIFICACION
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Especificacion
            {
                get => _especificacion ?? "";  // Si _comentarios es null, devolver una cadena vacía
                set => _especificacion = value;
            }

            private string _especificacion;


            //HORA INICIO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string HoraInicio
            {
                get => _horainicio ?? "";  // Si _comentarios es null, devolver una cadena vacía
                set => _horainicio = value;
            }

            private string _horainicio;

            //HORA FINAL
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string HoraFinal
            {
                get => _horafinal ?? "";  // Si _comentarios es null, devolver una cadena vacía
                set => _horafinal = value;
            }

            private string _horafinal;


            //TIEMPO PRODUCCION
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string TiempoProduccion
            {
                get => _tiempoproduccion ?? "";  // Si _comentarios es null, devolver una cadena vacía
                set => _tiempoproduccion = value;
            }

            private string _tiempoproduccion;

            //CANTIDAD METROS
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string CantidadMetros { get; set; }

            //COMENTARIOS
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Comentarios
            {
                get => _comentarios ?? "";  // Si _comentarios es null, devolver una cadena vacía
                set => _comentarios = value;
            }

            private string _comentarios;

            //FECHA CONTABILIZACION
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string FechaContabilizacion
            {
                get => _fechacontabilizacion ?? "";  // Si _comentarios es null, devolver una cadena vacía
                set => _fechacontabilizacion = value;
            }

            private string _fechacontabilizacion;

            //FECHA FABRICACION
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string FechaFabricacion
            {
                get => _fechafabricacion ?? "";  // Si _comentarios es null, devolver una cadena vacía
                set => _fechafabricacion = value;
            }

            private string _fechafabricacion;


            //FECHA ENTREGA
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string FechaEntrega
            {
                get => _fechaentrega ?? "";  // Si _comentarios es null, devolver una cadena vacía
                set => _fechaentrega = value;
            }

            private string _fechaentrega;


            //CLIENTE
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Cliente { get; set; }

            //CANTIDAD EN KILOS
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string CantidadKilos { get; set; }

            //GENERAR ORDEN FABRICACION
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string GenerarOF { get; set; }

            //ORDEN FABRICACION
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string OrdenFabricacion { get; set; }

            //ESTATUS SAP OF
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string EstatusSapOF { get; set; }

            //ESTATUS PRODUCCION
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string EstatusProduccion { get; set; }


            //SERIES DE NUMERACION
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Series { get; set; }

            //URGENCIA
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Urgencia { get; set; }

            //ROWNUM
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string RowNum { get; set; }

            //ORDEN FISICA
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string U_OrdenFisica { get; set; }

            //PEDIMENTO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string U_Pedimento { get; set; }

            //PACKING LIST
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string U_PackingList { get; set; }

            //CARTIFICADO CALIDAD
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string U_CertificadoCalidad { get; set; }
        }

        public class PlanesProduccionCreados
        {
            // ID DOCUMENTO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string DocEntry { get; set; }

            // FOLIO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Folio { get; set; }

            // LINEA
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Linea { get; set; }

            // CANTIDAD EN KILOS
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string CantidadKilos { get; set; }

            // ARTICULO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Articulo { get; set; }

            // DESCRIPCION ARTICULO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string DescripcionArticulo { get; set; }

            // GENERAR ORDEN FABRICACION
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string GenerarOF { get; set; }

            // ORDEN FABRICACION
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string OrdenFabricacion { get; set; }

            // ESTATUS SAP OF
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string EstatusSapOF { get; set; }

            // ESTATUS PRODUCCION
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string EstatusProduccion { get; set; }

            // FECHA CREACION
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string FechaCreacion { get; set; }

            // NUEVOS CAMPOS PARA PAROS
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            public int? ParoEstatus { get; set; } // 1 = Abierto, 2 = En proceso, 3 = Terminado, etc.

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            public string MotivoParo { get; set; }

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            public string UsuarioParo { get; set; }

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            public DateTime? FechaInicioParo { get; set; }

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            public DateTime? FechaFinParo { get; set; }

        }


        public class ParosProduccion
        {
            //ID
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string ID { get; set; }
            //LINEA
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Linea { get; set; }

            //FECHA
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Fecha { get; set; }

            //MOTIVO REPARACION
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string MotivoReparacion { get; set; }

            //SOLICITANTE
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Solicitante { get; set; }

            //ESTATUS
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Estatus { get; set; }
        }

        public class ParosHistoricos
        {
            //ID
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string ID { get; set; }

            //LINEA / MAQUINA
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Linea { get; set; }

            //FECHA INICIO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string FechaInicio { get; set; }

            //FECHA FIN PARO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string FechaFinParo { get; set; }

            //TIPO MANTENIMIENTO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string TipoMantenimiento { get; set; }

            //MOTIVO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Motivo { get; set; }

            //SOLICITANTE
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Solicitante { get; set; }

            //USUARIO QUE REALIZO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string UsuarioRealizo { get; set; }

            //RUBRO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Rubro { get; set; }

            //OBSERVACIONES / COMENTARIOS
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Observaciones { get; set; }

            //ESTATUS
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Estatus { get; set; }

            //ORDEN DE TRABAJO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string OrdenTrabajo { get; set; }
        }

        public class ConfigPP
        {
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Seccion { get; set; }

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Nombre { get; set; }

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Campo { get; set; }

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Valor { get; set; }

        }


        public class PlanVentas
        {

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string id { get; set; }

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string folio { get; set; }

            //ID DOCUMENTO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string DocEntry { get; set; }

            //CANTIDAD EN METROS
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string NumeroViaje { get; set; }

            //FECHA PEDIDO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string F_Pedido { get; set; }

            //FECHA SOLICITUD PRODUCCION
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string F_SolicitudProduccion { get; set; }

            //FECHA ORIGINAL ENTREGA
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string F_OriginalEntrega { get; set; }

            //FECHA ENTREGA
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string F_Entrega { get; set; }

            //NUMERO VIAJE
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Pedido { get; set; }

            //FirmCode Linea
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string CodigoCliente { get; set; }

            //Cita
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Cliente { get; set; }

            //NUMERO DE ROLLOS
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Cita { get; set; }

            //Distancia
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string HoraInicio { get; set; }

            //PIEZAS ENTREGA
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string HoraFin { get; set; }

           

            //Cita
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string HoraEntrega { get; set; }



            //DOCENTRY ID PEDIDO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Articulo { get; set; }

            //PEDIDO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string CantidadMetros { get; set; }

            //CODIGO CLIENTE
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string NumRollos { get; set; }

            //CLIENTE
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string PiezasEntrega { get; set; }

            //CLIENTE
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string PiezasRestantes { get; set; }

            //COMENTARIOS
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Cotejado { get; set; }

            //HORA ENTREGA
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Direccion { get; set; }

            //ARTICULO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Comentarios { get; set; }

            //CANTIDAD EN METROS
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string LineaProd_Real { get; set; }

            //NUMERO DE ROLLOS
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string EntregaParcial { get; set; }

            //NUMERO DE ROLLOS
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Sucursal { get; set; }

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string DistRecorrida { get; set; }

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Autotransporte { get; set; }

            //Cita
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string ComentariosSN
            {
                get => _horario ?? "";  // Si _horario es null, devolver una cadena vacía
                set => _horario = value;
            }

            //NumRepro
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string NumRepro { get; set; }

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string NumReproSAP { get; set; }

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Reprogramado { get; set; }



            private string _horario;
        }

        public class PlanesVentasCreados
        {

            //FOLIO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Folio { get; set; }

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string FechaCreacion { get; set; }

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string TotalPedidos { get; set; }

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string TotalAutorizados { get; set; }

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string TotalNoAutorizados { get; set; }

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string TotalClientes { get; set; }

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string TotalArticulos { get; set; }

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string TotalConCita { get; set; }

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string TotalEntregaParcial { get; set; }

            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string TotalPiezasEntrega { get; set; }

        }



        public class MonitorLogistica
        {

            //FECHA PEDIDO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string FechaPedido { get; set; }

            //FECHA SOLICITUD PRODUCCION
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string FechaSolicitudProduccion { get; set; }

            //FECHA ORIGINAL ENTREGA
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string FechaOriginalEntrega { get; set; }

            //FECHA ENTREGA
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string FechaEntrega { get; set; }

            //NUMERO VIAJE
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string NumeroViaje { get; set; }

            //FirmCode Linea
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Linea { get; set; }

            //Cita
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Cita { get; set; }

            //Cita
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string HoraInicio { get; set; }

            //Cita
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string HoraFin { get; set; }



            //DOCENTRY ID PEDIDO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string IdPedido { get; set; }

            //PEDIDO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Pedido { get; set; }

            //CODIGO CLIENTE
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string CodigoCliente { get; set; }

            //CLIENTE
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Cliente { get; set; }

            //COMENTARIOS
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Comentarios { get; set; }

            //HORA ENTREGA
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string HoraEntrega { get; set; }

            //ARTICULO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Articulo { get; set; }

            //CANTIDAD EN METROS
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string CantidadMetros { get; set; }

            //NUMERO DE ROLLOS
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string NumRollos { get; set; }

            //Distancia
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Distancia { get; set; }

            //PIEZAS ENTREGA
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string PiezasEntrega { get; set; }

            //COTEJADO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Cotejado { get; set; }

            //DIRECCION
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Direccion { get; set; }

            //HORARIO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string HorarioCita
            {
                get => _horario ?? "";  // Si _horario es null, devolver una cadena vacía
                set => _horario = value;
            }

            private string _horario;
        }

        public class Monitores
        {

            //FOLIO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Folio { get; set; }

            //ESTATUS CARGA
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string EstatusCarga { get; set; }

            //TIPO REPARTO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string TipoReparto { get; set; }

            //FECHA PEDIDO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string FechaPedido { get; set; }

            //FECHA SOLICITUD PRODUCCION
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string FechaSolicitudProduccion { get; set; }

            //CLIENTE
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Cliente { get; set; }

            //PEDIDO
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Pedido { get; set; }

            //COMENTARIOS
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Comentarios { get; set; }
        }
        public class UserPush
        {
            //ID
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string id { get; set; }

            //Usuario
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Usuario { get; set; }

            //P256dh
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string P256dh { get; set; }

            //Auth
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Auth { get; set; }

            //Endpoint
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Endpoint { get; set; }

            //Dispositivo
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Dispositivo { get; set; }

            //Fecha
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string Fecha { get; set; }

        }


        public class DatosHojaEsp
        {
            //FirmCode: Linea
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string FirmCode { get; set; }

            //Producto
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string ItemCode { get; set; }

            //NumeroEspecificacion
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string U_NumEsp { get; set; }

            //NumeroCliente
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string U_NumCliente { get; set; }

            //Destino
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string U_DeptoDes { get; set; }

            //MetrosRollo
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string SalPakcUn { get; set; }


            //Espesor
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string U_EspesorEsp { get; set; }


            //Refilado
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string U_refilado { get; set; }

            //GM2
            [JsonProperty(DefaultValueHandling = DefaultValueHandling.Populate)]
            [DefaultValue("")]
            public string U_pesoxm2 { get; set; }

        }


        #endregion

        #region GlobalFunctions
        public StringBuilder Excepcion(Exception E, string msg)
        {

            // 6. Obtener el número de línea del error
            int lineNumber = new StackTrace(E, true).GetFrame(0).GetFileLineNumber();

            // 7. Crear un mensaje de error detallado
            StringBuilder sb = new StringBuilder();
            sb.Append(msg);
            sb.Append(E.Message);
            sb.Append($" (Línea: {lineNumber})");

            return sb;
        }
        #endregion
    }
}