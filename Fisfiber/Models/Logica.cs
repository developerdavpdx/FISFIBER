using Fisfiber.Controllers;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using System.Web;

namespace Fisfiber.Models
{
    public class Logica
    {
        private string EmailsMantenimiento { get; }
        AccesoDatos AD = new AccesoDatos();
       
        /// <summary>
        /// Iniciar sesion
        /// </summary>
        /// <param name="userkeys"></param>
        /// <returns>bool</returns>
        public bool ValidaUsuario(Dictionary<string, string> userkeys)
        {
            string resultado = AD.ExecuteSingleSelectQuery(AD.GCValidaUsuarios, userkeys);
            return int.Parse(resultado) > 0;
        }

        /// <summary>
        ///Obtener lista de información a partir de una consulta almacenada
        /// </summary>
        /// <returns>JARRAY STRING</returns>
        public string GlobalProcedure(string ProcedureName, Dictionary<string, string> keys)
        {
            string resultado = AD.ExecuteProcedure(ProcedureName, keys);
            return resultado;
        }

        public string GlobalProcedureSigleR(string ProcedureName, Dictionary<string, string> keys)
        {
            string resultado = AD.ExecuteSingleSelectQuery(ProcedureName, keys);
            return resultado;
        }

        public bool NotificacionMantenimiento(string Asunto, string Titulo, string AsuntoHtml, string Mensaje,string To)
        {

            try
            {

                //Correo de confirmación de correo enviado
                string htmlBody = $@"
                            <!DOCTYPE html>
                            <html lang=""es"">
                              <head>
                                <meta charset=""UTF-8"">
                                <title>{Titulo}</title>
                              </head>
                              <body style=""margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;"">
                                <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"" bgcolor=""#f4f4f4"">
                                  <tr>
                                    <td align=""center"">
                                      <table width=""600"" cellpadding=""0"" cellspacing=""0"" border=""0"" style=""background-color:#ffffff;"">
                                        <!-- Encabezado -->
                                        <tr>
                                          <td style=""background-color:#000000; padding:20px 0; text-align:center;"">
                                            <img src=""cid:imgAct"" alt=""Encabezado"" width=""300"" height=""102"" style=""display:block; margin:auto;"">
                                          </td>
                                        </tr>

                                        <!-- Título -->
                                        <tr>
                                          <td style=""padding:30px 40px 10px 40px; color:#333333; font-size:20px; font-weight:bold; text-align:center;"">
                                            {AsuntoHtml}
                                          </td>
                                        </tr>

                                        <!-- Cuerpo -->
                                        <tr>
                                          <td style=""padding:10px 40px 30px 40px; color:#555555; font-size:16px; line-height:1.6;"">
                                            {Mensaje}
                                          </td>
                                        </tr>
                                        <!-- Pie de página -->
                                        <tr>
                                          <td style=""background-color:#eeeeee; padding:15px 40px; text-align:center; font-size:12px; color:#888888;"">
                                            © 2025 Paradox ET S. de R.L. de C.V. Todos los derechos reservados.
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </body>
                            </html>
                            ";




                // Email el mensaje de correo
                var Email = new MailMessage
                {
                    From = new MailAddress(ConfigurationManager.AppSettings["SMTP_USER"], "Registro Paros"),
                    Subject = Asunto,
                    Body = htmlBody,
                    IsBodyHtml = true
                };

                // Crear el recurso HTML con imagen embebida
                AlternateView avHtml = AlternateView.CreateAlternateViewFromString(htmlBody, null, MediaTypeNames.Text.Html);

                // Ruta física del archivo PNG
                string rutaImagen = HttpContext.Current.Server.MapPath("~/Images/logoFisfiber.png");

                // Crear el recurso de la imagen
                LinkedResource img = new LinkedResource(rutaImagen, "image/png");
                img.ContentId = "imgAct";  // Este debe coincidir con el cid en el HTML: <img src="cid:imgAct">
                img.ContentType.Name = "FFISA";
                img.TransferEncoding = TransferEncoding.Base64;

                // Adjuntar la imagen embebida a la vista HTML
                avHtml.LinkedResources.Add(img);

                // Agregar la vista alternativa al correo
                Email.AlternateViews.Add(avHtml);


                //LA CONFIGURACION DEL SMTP SE PEUDE CAMBIAR EN EL WEB CONFIG
                var smtpMail = new SmtpClient
                {
                    Host = ConfigurationManager.AppSettings["SMTP_HOST"],
                    Port = int.Parse(ConfigurationManager.AppSettings["SMTP_PORT"]),
                    EnableSsl = true,
                    Credentials = new NetworkCredential(
                     ConfigurationManager.AppSettings["SMTP_USER"],
                     ConfigurationManager.AppSettings["SMTP_PASSWORD"])
                };

                // Obtener destinatarios
                JArray Emails = JArray.Parse(To);
                foreach (JObject email in Emails)
                {
                    var direcciones = email["Email"].ToString().Split(',');
                    foreach (var direccion in direcciones)
                    {
                        if (!string.IsNullOrWhiteSpace(direccion))
                            Email.To.Add(direccion.Trim());
                    }
                }

                smtpMail.Send(Email);
                smtpMail.Dispose();
                Email.Dispose();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                return false;
            }
        }
    }
}