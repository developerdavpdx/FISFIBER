/*
    SpPdxFF_GetParosMantByFecha  -  FIX 2026-11-06
    ------------------------------------------------------------
    Ignoraba @FI/@FF y siempre consultaba el mes actual
    (GETDATE()), por lo que el filtro de fechas del dashboard
    no tenía efecto.
*/
ALTER PROCEDURE [dbo].[SpPdxFF_GetParosMantByFecha]
    @FI DATE = NULL,
    @FF DATE = NULL,
    @Linea NVARCHAR(50) = NULL,
    @Turno NVARCHAR(50) = NULL,
    @GrupoArticulos NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        DECLARE @FechaInicio DATE = ISNULL(@FI, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1));
        DECLARE @FechaFin    DATE = ISNULL(@FF, EOMONTH(@FechaInicio));

        SELECT
            PM.ID,
            CASE
                WHEN PM.Estatus = 1 THEN 'Abierto'
                WHEN PM.Estatus = 2 THEN 'En Proceso'
                WHEN PM.Estatus = 3 THEN 'Terminado'
                ELSE 'Desconocido'
            END AS Estatus,
            PM.Linea,
            PM.Fecha,
            PM.FechaReal,
            DAY(PM.FechaReal) AS DiaDelMes,
            PM.FechaFinParo,
            PM.FechaRealFin,
            dbo.Pdxfn_DifMinAjustada(PM.Fecha, PM.FechaFinParo) AS MinutosDeParo,
            ISNULL(PM.TipoMantenimiento, '') AS TipoMantenimiento,
            ISNULL(PM.Rubro, '') AS Rubro,
            ISNULL(PM.MotivoReparacion, '') AS MotivoReparacion,
            ISNULL(PM.OrdenTrabajo, '') AS OrdenTrabajo,
            T.Turno,
            OITM.ItmsGrpCod
        FROM TblPdxFFParosMantenimiento PM
        CROSS APPLY dbo.Pdxfn_GetTurnoPorRangoParos(PM.Fecha, PM.FechaFinParo) AS T
        LEFT JOIN ORDR ORDR ON CAST(ORDR.DocNum AS NVARCHAR) = PM.Pedido
        LEFT JOIN RDR1 RDR1 ON RDR1.DocEntry = ORDR.DocEntry
        LEFT JOIN OITM OITM ON OITM.ItemCode = RDR1.ItemCode
        WHERE
            PM.Fecha >= @FechaInicio
            AND PM.Fecha < DATEADD(DAY, 1, @FechaFin)
            AND (@Linea IS NULL OR PM.Linea = @Linea)
            AND (@GrupoArticulos IS NULL OR OITM.ItmsGrpCod = @GrupoArticulos)
            AND (@Turno IS NULL OR T.Turno = @Turno)
        ORDER BY PM.FechaReal DESC;

    END TRY
    BEGIN CATCH
        DECLARE
            @ErrorMessage NVARCHAR(4000),
            @ErrorSeverity INT,
            @ErrorState INT;

        SELECT
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        RAISERROR('Error al ejecutar [SpPdxFF_GetParosMantenimientoByFecha]: %s',
                  @ErrorSeverity, @ErrorState, @ErrorMessage);
    END CATCH
END
