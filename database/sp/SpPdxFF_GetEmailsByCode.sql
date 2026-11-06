/*
    SpPdxFF_GetEmailsByCode  -  FIX 2026-11-06
    ------------------------------------------------------------
    @FFISA_E_MAIL tiene un solo registro por Code (Code es PK), así
    que un mismo aviso no podía mandarse a más de un correo.
    Ahora U_MailAuto admite varios destinatarios separados por ';'
    (o ',') y el SP devuelve una fila por correo.
*/
ALTER PROCEDURE [dbo].[SpPdxFF_GetEmailsByCode]
    @Code NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT LTRIM(RTRIM(s.value)) AS Correo
    FROM [@FFISA_E_MAIL]
    CROSS APPLY STRING_SPLIT(REPLACE(ISNULL(U_MailAuto, ''), ',', ';'), ';') AS s
    WHERE Code = @Code
      AND LTRIM(RTRIM(s.value)) <> '';
END
