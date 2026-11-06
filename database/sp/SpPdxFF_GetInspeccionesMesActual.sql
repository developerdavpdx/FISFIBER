/*
    SpPdxFF_GetInspeccionesMesActual  -  FIX 2026-11-06
    ------------------------------------------------------------
    Ignoraba el rango de fechas del dashboard (siempre mes actual).
    Se agregan @FI/@FF opcionales: si no se envían, conserva el
    comportamiento anterior (mes actual).
*/
ALTER PROCEDURE [dbo].[SpPdxFF_GetInspeccionesMesActual]
    @Linea NVARCHAR(50),
    @Turno NVARCHAR(50) = NULL,
    @GrupoArticulos NVARCHAR(50) = NULL,
    @FI DATE = NULL,
    @FF DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FechaInicio DATE = ISNULL(@FI, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1));
    DECLARE @FechaFin    DATE = ISNULL(@FF, EOMONTH(@FechaInicio));

    ;WITH FilterOIGN AS
    (
        SELECT
            G.DocNum,
            G.DocDate,
            G.DocEntry,
            G.U_Lineaproduccionreal
        FROM OIGN G
        WHERE
        (
            @Linea IS NULL OR
            G.U_Lineaproduccionreal LIKE dbo.Pdxfn_NormalizaLinea(@Linea)
        )
    )
    SELECT
        B.U_FechaIns      AS FechaIns,
        B.U_ov            AS Pedido,
        B.ItemCode        AS Producto,
        B.U_Conforme      AS Conforme,
        B.DistNumber      AS Lote,
        B.U_EstatusConf   AS EstatusConf,

        B.U_EtapaIns1 AS EtapaIns1,
        B.U_EtapaIns2 AS EtapaIns2,
        B.U_EtapaIns3 AS EtapaIns3,
        B.U_EtapaIns4 AS EtapaIns4,
        B.U_EtapaIns5 AS EtapaIns5,
        B.U_EtapaIns6 AS EtapaIns6,
        B.U_EtapaIns7 AS EtapaIns7,
        B.U_EtapaIns8 AS EtapaIns8,

        STUFF(COALESCE(' | ' + NULLIF(B.U_EtapaIns1, ''), '') +
            COALESCE(' | ' + NULLIF(B.U_EtapaIns2, ''), '') +
            COALESCE(' | ' + NULLIF(B.U_EtapaIns3, ''), '') +
            COALESCE(' | ' + NULLIF(B.U_EtapaIns4, ''), '') +
            COALESCE(' | ' + NULLIF(B.U_EtapaIns5, ''), '') +
            COALESCE(' | ' + NULLIF(B.U_EtapaIns6, ''), '') +
            COALESCE(' | ' + NULLIF(B.U_EtapaIns7, ''), '') +
            COALESCE(' | ' + NULLIF(B.U_EtapaIns8, ''), ''), 1, 3, '') AS EtapasConcatenadas,

        B.U_Ancho AS Ancho,
        B.U_Peso AS Peso,
        B.U_Gm2 AS GM2,

        G.U_Lineaproduccionreal
    FROM FilterOIGN G

    INNER JOIN IGN1 L
        ON L.DocEntry = G.DocEntry

    INNER JOIN OITL T
        ON T.DocEntry = G.DocEntry
       AND T.DocType = 59

    INNER JOIN ITL1 TL
        ON TL.LogEntry = T.LogEntry
       AND TL.ItemCode = L.ItemCode

    INNER JOIN OBTN B
        ON B.SysNumber = TL.SysNumber
       AND B.ItemCode = TL.ItemCode

    INNER JOIN OITM
        ON L.ItemCode = OITM.ItemCode

    WHERE
        B.U_FechaIns >= @FechaInicio
        AND B.U_FechaIns < DATEADD(DAY, 1, @FechaFin)
        AND (@Turno IS NULL OR L.U_Turno = @Turno)
        AND (@GrupoArticulos IS NULL OR OITM.ItmsGrpCod = @GrupoArticulos)
    ORDER BY L.ItemCode;
END
