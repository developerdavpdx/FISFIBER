/*
    SpPdxFF_GetParosMantByDia  -  FIX 2026-11-06
    ------------------------------------------------------------
    Ignoraba @FI/@FF y siempre consultaba el mes actual
    (GETDATE()), por lo que el filtro de fechas del dashboard
    no tenía efecto en la gráfica de paros por día.
*/
ALTER PROCEDURE [dbo].[SpPdxFF_GetParosMantByDia]
(
    @FI DATE = NULL,
    @FF DATE = NULL,
    @Linea NVARCHAR(50) = NULL,
    @Turno NVARCHAR(50) = NULL,
    @GrupoArticulos NVARCHAR(50) = NULL
)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FechaInicio DATE = ISNULL(@FI, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1));
    DECLARE @FechaFin    DATE = ISNULL(@FF, EOMONTH(@FechaInicio));

    SELECT
        CAST(PM.FechaReal AS DATE) AS Fecha,
        DAY(PM.FechaReal) AS DiaDelMes,
        SUM(dbo.Pdxfn_DifMinAjustada(PM.Fecha, PM.FechaFinParo)) AS MinutosDeParo
    FROM TblPdxFFParosMantenimiento PM
    CROSS APPLY dbo.Pdxfn_GetTurnoPorRangoParos(PM.Fecha, PM.FechaFinParo) AS T
    LEFT JOIN ORDR ON CAST(ORDR.DocNum AS NVARCHAR) = PM.Pedido
    LEFT JOIN RDR1 ON RDR1.DocEntry = ORDR.DocEntry
    LEFT JOIN OITM ON OITM.ItemCode = RDR1.ItemCode
    WHERE
        PM.Fecha >= @FechaInicio
        AND PM.Fecha < DATEADD(DAY, 1, @FechaFin)
        AND (@Linea IS NULL OR PM.Linea = @Linea)
        AND (@GrupoArticulos IS NULL OR OITM.ItmsGrpCod = @GrupoArticulos)
        AND (@Turno IS NULL OR T.Turno = @Turno)
    GROUP BY
        CAST(PM.FechaReal AS DATE),
        DAY(PM.FechaReal)
    ORDER BY
        CAST(PM.FechaReal AS DATE);
END
