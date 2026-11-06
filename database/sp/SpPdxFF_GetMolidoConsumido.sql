/*
    SpPdxFF_GetMolidoConsumido  -  FIX 2026-11-06
    ------------------------------------------------------------
    Bug: el JOIN comparaba el artículo de la OF (producto terminado)
         contra el componente de WOR1:
             OV_Fibras.FibraOW = W1.ItemCode
         Nunca coincide (DEMO-10 vs 'MOLIDO FB'), por lo que el
         dashboard siempre mostraba "MOLIDO CONSUMIDO" vacío.

    Fix:
      - Se compara el componente: OV_Fibras.Fibra = W1.ItemCode.
      - El consumo se agrupa por OF + componente (WOR1.IssuedQty)
        para no duplicarlo por cada recepción.
      - Se atribuye a la línea/turno del primer recibo de la OF.
      - @FI/@FF se respetan (antes solo el CTE los usaba).
*/
ALTER PROCEDURE [dbo].[SpPdxFF_GetMolidoConsumido]
    @Linea NVARCHAR(100),
    @FI    DATE,
    @FF    DATE
AS
BEGIN
    SET NOCOUNT ON;

    IF @FI IS NULL SET @FI = DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1);
    IF @FF IS NULL SET @FF = EOMONTH(@FI);

    ;WITH ConsumoOF AS
    (
        SELECT
            OW.DocEntry                 AS OfEntry,
            OW.U_Status                 AS Pedido,
            W1.ItemCode                 AS Fibra,
            SUM(ISNULL(W1.IssuedQty,0)) AS Consumido
        FROM OWOR OW
        INNER JOIN WOR1 W1 ON W1.DocEntry = OW.DocEntry
        WHERE OW.Status = 'L'
          AND OW.U_Status IS NOT NULL
          AND W1.ItemCode IN ('MOLIDO FB', 'MOLIDO MODACRYL')
        GROUP BY OW.DocEntry, OW.U_Status, W1.ItemCode
    ),
    PrimerRecibo AS
    (
        SELECT
            I1.BaseEntry             AS OfEntry,
            I1.U_Turno               AS Turno,
            IG.U_Lineaproduccionreal AS Linea,
            ROW_NUMBER() OVER (PARTITION BY I1.BaseEntry ORDER BY IG.DocDate, IG.DocEntry) AS rn
        FROM IGN1 I1
        INNER JOIN OIGN IG ON IG.DocEntry = I1.DocEntry
        WHERE I1.BaseType = 202
          AND IG.DocDate >= @FI
          AND IG.DocDate < DATEADD(DAY, 1, @FF)
    )
    SELECT
        C.Fibra                AS Fibra,
        P.Linea                AS Linea,
        P.Turno                AS Turno,
        SUM(C.Consumido)       AS Consumido
    FROM ConsumoOF C
    INNER JOIN PrimerRecibo P
        ON P.OfEntry = C.OfEntry
       AND P.rn = 1
    WHERE P.Linea = dbo.Pdxfn_CleanLinea(@Linea)
    GROUP BY C.Fibra, P.Linea, P.Turno
    ORDER BY P.Turno;
END
