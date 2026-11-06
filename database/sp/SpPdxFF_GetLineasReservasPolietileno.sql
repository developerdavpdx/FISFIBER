/*
    SpPdxFF_GetLineasReservasPolietileno  -  nuevo 2026-11-06
    ------------------------------------------------------------
    Devuelve el histórico de pesajes de polietileno que consume la
    pestaña "Reserva de Polietileno" de Produccion/ConsultaPlanProduccion.
*/
CREATE PROCEDURE [dbo].[SpPdxFF_GetLineasReservasPolietileno]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id,
           ISNULL(CantPeso, 0) AS Peso,
           FechaH              AS Fecha,
           ISNULL(Etiqueta,'') AS Etiqueta,
           ISNULL(Operador,'') AS Operador
    FROM TblPdxFFReservaPolietilenoR
    ORDER BY Id DESC;
END
