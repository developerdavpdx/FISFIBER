/*
    SpPdxFF_InsertaLineasFyGReservaPolietileno  -  nuevo 2026-11-06
    ------------------------------------------------------------
    Registra un pesaje de polietileno (báscula) para una OF/línea.
    Devuelve la fila insertada porque el controlador espera datos
    (si el SP no devuelve filas, la web lo interpreta como error).
*/
CREATE PROCEDURE [dbo].[SpPdxFF_InsertaLineasFyGReservaPolietileno]
    @PlanProduccion   NVARCHAR(50)  = NULL,
    @OrdenFabricacion NVARCHAR(50)  = NULL,
    @Pedido           NVARCHAR(50)  = NULL,
    @Linea            NVARCHAR(50)  = NULL,
    @Peso             NVARCHAR(50)  = NULL,
    @Operador         NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @PesoNum DECIMAL(18,3) = TRY_CAST(REPLACE(ISNULL(@Peso, ''), ',', '.') AS DECIMAL(18,3));
    IF @PesoNum IS NULL SET @PesoNum = 0;

    DECLARE @Ref NVARCHAR(50) =
        COALESCE(
            NULLIF(LTRIM(RTRIM(@Pedido)), ''),
            NULLIF(LTRIM(RTRIM(@OrdenFabricacion)), ''),
            NULLIF(LTRIM(RTRIM(@PlanProduccion)), ''),
            N'SIN-REF'
        );

    DECLARE @Etiqueta VARCHAR(255) = CONCAT(
        'RP-', @Ref,
        ISNULL('-' + NULLIF(LTRIM(RTRIM(@Linea)), ''), ''),
        '-', FORMAT(SYSDATETIME(), 'yyMMdd-HHmmss')
    );

    INSERT INTO TblPdxFFReservaPolietilenoR (CantPeso, UnidadPeso, FechaH, Etiqueta, Operador)
    VALUES (@PesoNum, 'kg', GETDATE(), @Etiqueta, ISNULL(@Operador, ''));

    DECLARE @Id INT = SCOPE_IDENTITY();

    SELECT Id,
           ISNULL(CantPeso, 0) AS Peso,
           FechaH              AS Fecha,
           ISNULL(Etiqueta,'') AS Etiqueta,
           ISNULL(Operador,'') AS Operador
    FROM TblPdxFFReservaPolietilenoR
    WHERE Id = @Id;
END
