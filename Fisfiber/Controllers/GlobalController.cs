using Fisfiber.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Reflection;
using System.Security.Policy;
using System.Text;
using System.Threading;
using System.Web;
using System.Web.Hosting;
using System.Web.Mvc;


namespace Fisfiber.Controllers
{
    public class GlobalController : Controller
    {
        Logica Logic = new Logica();
        AccesoDatos AD = new AccesoDatos();

        string url =
                   ConfigurationManager.AppSettings["Localhost"] == "true" ?
                    ConfigurationManager.AppSettings["UrlLocalEmail"] :
                    ConfigurationManager.AppSettings["UrlProdEmial"];

        //string codePV = ConfigurationManager.AppSettings["PlanVentas"];
        //string codeCyC = ConfigurationManager.AppSettings["CyC"];
        string codeAuthPlanEmbarque = ConfigurationManager.AppSettings["AutPlanEmbarque"];

        /// <summary>
        /// Obtiene los detalles del documento (lineas)
        /// </summary>
        /// <param name="ObjectCode"></param>
        /// <returns>JSON ARRAY</returns>
        public JsonResult GetOrdenesVentaDetails(string DocEntry)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("DocEntry", DocEntry);
                string details = Logic.GlobalProcedure(AD.GCOrdenesVentaDetails, AD.RequestParameters);
                // Validación del los datos
                if (details.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = details });
                }
                //No existe información
                else if (details.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente la OV: " + DocEntry + "." });
                }
                //OK
                return Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de orden obtenidos correctamente.", Data = details });

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener los detalles de la OV " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetOrdenesVentaDetailsML(string DocEntry)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("DocEntry", DocEntry);
                string details = Logic.GlobalProcedure(AD.GCOrdenesVentaDetailsML, AD.RequestParameters);
                // Validación del los datos
                if (details.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = details });
                }
                //No existe información
                else if (details.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente la OV: " + DocEntry + "." });
                }
                //OK
                return Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de orden obtenidos correctamente.", Data = details });

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener los detalles de la OV " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }


        /// <summary>
        /// Obtiene las series de numeración de el documento que se requiera
        /// </summary>
        /// <param name="ObjectCode"></param>
        /// <returns>JSON ARRAY</returns>
        public JsonResult GetSeriesNumeracionDocs(string ObjectCode)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("ObjectCode", ObjectCode);
                string series = Logic.GlobalProcedure(AD.GCSeriesNumeracionDocs, AD.RequestParameters);
                //retornamos en JSON la data obtenida
                var resultado = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Lista de series de numeración obtenida correctamente".ToString(), Data = series });
                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de las series de numeración de las OV " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetInfoFamilias()
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                string lineas = Logic.GlobalProcedure(AD.GCGetInfoFamilias, AD.RequestParameters);
                //retornamos en JSON la data obtenida
                var resultado = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Lista de nombre de familias obtenida correctamente".ToString(), Data = lineas });
                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de nombre de familias " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }
        public JsonResult GetNameAllLineas()
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                string lineas = Logic.GlobalProcedure(AD.GCAllLineas, AD.RequestParameters);
                //retornamos en JSON la data obtenida
                var resultado = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Lista de nombre de lineas obtenida correctamente".ToString(), Data = lineas });
                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de nombre de lineas " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetNameLineas()
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                string lineas = Logic.GlobalProcedure(AD.GCLineas, AD.RequestParameters);
                //retornamos en JSON la data obtenida
                var resultado = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Lista de nombre de lineas obtenida correctamente".ToString(), Data = lineas });
                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de nombre de lineas " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetNameLineasProduccion()
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                string lineas = Logic.GlobalProcedure(AD.GCLineasProduccion, AD.RequestParameters);
                //retornamos en JSON la data obtenida
                var resultado = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Lista de nombre de lineas obtenida correctamente".ToString(), Data = lineas });
                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de nombre de lineas " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetNameLineasTerminadas()
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                string lineas = Logic.GlobalProcedure(AD.GCLineasProduccionT, AD.RequestParameters);
                //retornamos en JSON la data obtenida
                var resultado = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Lista de nombre de lineas obtenida correctamente".ToString(), Data = lineas });
                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de nombre de lineas " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult InsertaConfiguracionPushNot(string Usuario, string P256dh, string Auth, string Endpoint, string Dispositivo)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("Usuario", Usuario);
                AD.RequestParameters.Add("P256dh", P256dh);
                AD.RequestParameters.Add("Auth", Auth);
                AD.RequestParameters.Add("Endpoint", Endpoint);
                AD.RequestParameters.Add("Dispositivo", Dispositivo);
                string details = Logic.GlobalProcedure(AD.GCInsertaConfiguracionPushNot, AD.RequestParameters);
                // Validación del los datos
                if (details.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = details });
                }
                //No existe información
                else if (details.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No fue posible guardar la  información referente las notificaciones para el usuario: " + Usuario + "." });
                }
                //OK
                return Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de orden obtenidos correctamente.", Data = "[]" });
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "posible guardar la  información referente las notificaciones para el usuario: " + Usuario + " " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        /// <summary>
        /// Metodo para insertar al usuario en push notifications 
        /// </summary>
        /// <returns>returns Json();</returns>
        public JsonResult SuscribUser(string usuario, string p256dh, string auth, string endpoint, string disp)
        {
            try
            {
                //Parametros de fecha
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("usuario", usuario);
                AD.RequestParameters.Add("p256dh", p256dh);
                AD.RequestParameters.Add("auth", auth);
                AD.RequestParameters.Add("endpoint", endpoint);
                AD.RequestParameters.Add("disp", disp);

                string connectionString = string.Empty;

                string result = Logic.GlobalProcedure(AD.GCInsertUserPushNot, AD.RequestParameters);

                //retornamos en JSON la data obtenida
                var resolve = Json(new
                {
                    data = result
                }, JsonRequestBehavior.AllowGet);

                resolve.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resolve;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible suscribir al usuario " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        /// <summary>
        /// Metodo para obtener las notificaciones pendientes 
        /// </summary>
        /// <returns>returns Json();</returns>
        public JsonResult NotifiPend(string usuario)
        {
            try
            {
                //Parametros de fecha
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("usuario", usuario);


                string connectionString = string.Empty;

                string result = Logic.GlobalProcedure(AD.GCNotifiNoLeidas, AD.RequestParameters);

                //retornamos en JSON la data obtenida
                var resolve = Json(new
                {
                    data = result
                }, JsonRequestBehavior.AllowGet);

                resolve.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resolve;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener las notificaciones pendientes " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        /// <summary>
        /// Metodo para obtener las notificaciones pendientes 
        /// </summary>
        /// <returns>returns Json();</returns>
        public JsonResult NotifiLeidas(string ids)
        {
            try
            {
                //Parametros de fecha
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("ids", ids);


                string connectionString = string.Empty;

                string result = Logic.GlobalProcedure(AD.GCNotifiLeidas, AD.RequestParameters);

                //retornamos en JSON la data obtenida
                var resolve = Json(new
                {
                    data = result
                }, JsonRequestBehavior.AllowGet);

                resolve.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resolve;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible leer las notificaciones pendientes " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public ActionResult Autorizacion()
        {
            return View();
        }

        /// <summary>
        /// Obtiene los estatus de carga para el monitor de logistica
        /// </summary>
        /// <param name="ObjectCode"></param>
        /// <returns>JSON ARRAY</returns>
        public JsonResult GetEstatusCarga(string tabla, string campodefinido)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("tabla", tabla);
                AD.RequestParameters.Add("campodefinido", campodefinido);
                string series = Logic.GlobalProcedure(AD.GCGetMetaDataSBO, AD.RequestParameters);
                //retornamos en JSON la data obtenida
                var resultado = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Lista de metadatos obtenida correctamente".ToString(), Data = series });
                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener los metadatos desde SAP BUSINNES ONE " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        /// <summary>
        /// Obtiene los estatus de produccion para el plan de produccion
        /// </summary>
        /// <param name="ObjectCode"></param>
        /// <returns>JSON ARRAY</returns>
        public JsonResult GetEstatusProduccion()
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                string series = Logic.GlobalProcedure(AD.GCGetEstatusPP, AD.RequestParameters);
                //retornamos en JSON la data obtenida
                var resultado = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Lista de metadatos obtenida correctamente".ToString(), Data = series });
                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener los metadatos desde SAP BUSINNES ONE " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult CreateConfigPP(string email)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("correo", email);
                string details = Logic.GlobalProcedure(AD.GCCheckConfigPP, AD.RequestParameters);
                // Validación del los datos
                if (details.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = details });
                }

                //OK
                return Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de orden obtenidos correctamente.", Data = details });

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener los detalles de la OV " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetCapLinea(string linea)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>
                {
                    { "Linea", linea }
                };

                string lineas = Logic.GlobalProcedure(AD.GCGetCapLinea, AD.RequestParameters);
                //retornamos en JSON la data obtenida
                var resultado = Json(new AccesoDatos.JsonResponse
                { Status = "OK", Message = "Capacidad de linea obtenida correctamente".ToString(), Data = lineas });
                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de nombre de lineas " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetTiempoParoPorDia(string linea)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>
                {
                    { "Linea", linea }
                };

                string lineas = Logic.GlobalProcedure(AD.GCGetTiempoParoPorDia, AD.RequestParameters);
                //retornamos en JSON la data obtenida
                var resultado = Json(new AccesoDatos.JsonResponse
                { Status = "OK", Message = "tiempo de paro obtenido correctamente".ToString(), Data = lineas });
                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener el tiempo de paro por línea " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }


        [ValidateInput(false)]
        public ActionResult SendEmail(EmailRequest emailRequest)
        {
            try
            {

                // Configurar el cliente SMTP
                var smtp = new SmtpClient
                {
                    Host = "smtp.office365.com", // Cambia según tu servidor SMTP
                    Port = 587, // Cambia según el puerto de tu servidor SMTP
                    EnableSsl = true,
                    Credentials = new NetworkCredential("soporte@paradox-et.com", "Paradox#2023")
                };

                // Crear el mensaje de correo
                var mail = new MailMessage
                {
                    From = new MailAddress("soporte@paradox-et.com"),
                    Subject = emailRequest.Subject,
                    Body = emailRequest.Body,
                    IsBodyHtml = emailRequest.IsHtml
                };

                // Agregar destinatario
                mail.To.Add(emailRequest.To);

                // Enviar el correo
                smtp.Send(mail);

                return Json(new { success = true, message = "Correo enviado correctamente" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error al enviar el correo: {ex.Message}" });
            }
        }

        [ValidateInput(false)]
        public ActionResult SendEmails(EmailRequest emailRequest, string pathImg, List<Correos> correos, string Alias)
        {
            try
            {
                // Obtener la lista de correos

                AD.RequestParameters = new Dictionary<string, string>();

                string result = Logic.GlobalProcedure("", AD.RequestParameters);
                // correos = JsonConvert.DeserializeObject<List<Correos>>(result);

                if (correos == null || !correos.Any())
                {
                    return Json(new { success = false, message = "No se encontraron destinatarios." });
                }

                //LA CONFIGURACION DEL SMTP SE PEUDE CAMBIAR EN EL WEB CONFIG
                var smtp = new SmtpClient
                {
                    Host = ConfigurationManager.AppSettings["SMTP_HOST"],
                    Port = int.Parse(ConfigurationManager.AppSettings["SMTP_PORT"] ?? "587"),
                    EnableSsl = true,
                    Credentials = new NetworkCredential(
                     ConfigurationManager.AppSettings["SMTP_USER"],
                     ConfigurationManager.AppSettings["SMTP_PASSWORD"])
                };

                // Iterar sobre la lista de correos para enviar los mensajes
                foreach (var correo in correos)
                {
                    try
                    {
                        // Crear el mensaje de correo
                        var mail = new MailMessage
                        {
                            From = new MailAddress(ConfigurationManager.AppSettings["SMTP_USER"], Alias),
                            Subject = emailRequest.Subject,
                            Body = emailRequest.Body,
                            IsBodyHtml = emailRequest.IsHtml
                        };

                        // Crear una vista alternativa con el HTML del cuerpo
                        var alternateView = AlternateView.CreateAlternateViewFromString(emailRequest.Body, null, "text/html");

                        // Agregar la imagen como recurso embebido
                        string imagePath = HostingEnvironment.MapPath(pathImg);  // Ruta local de la imagen
                        var linkedResource = new LinkedResource(imagePath, "image/jpeg")
                        {
                            ContentId = "imgAct", // Identificador único para referenciar la imagen
                            TransferEncoding = System.Net.Mime.TransferEncoding.Base64
                        };

                        // Asociar el recurso embebido con la vista alternativa
                        alternateView.LinkedResources.Add(linkedResource);
                        mail.AlternateViews.Add(alternateView);

                        // Agregar destinatario
                        mail.To.Add(correo.Correo);

                        // Enviar el correo
                        smtp.Send(mail);
                    }
                    catch (Exception ex)
                    {
                        // Loguear errores de correos individuales si es necesario
                        // Continuar con el siguiente correo
                        Console.WriteLine($"Error al enviar a {correo.Correo}: {ex.Message}");
                    }
                }

                smtp.Dispose();


                return Json(new { success = true, message = "Correos enviados correctamente" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error general: {ex.Message}" });
            }
        }


        public JsonResult UpdateHeaderISO(string Modulo, string FL, string FR, string Code, string Nivel, string Revision)
        {
            try
            {
                //Prefijos de secciones
                //Plan de producción -> PlanPro_
                //Hoja de especificación -> HojaE_
                //Plan de órdenes de venta -> PlanOV_
                //Reporte de crédito y cobranza -> ReporteCC_
                //Plan de embarques – mascara->PlanEmb_
                //Monitor->Monitor_
                //Dashboard->Dashboard_

                IniConfigManager.GuardarValor(Modulo + "FechaLiberacion", "Valor", FL);
                IniConfigManager.GuardarValor(Modulo + "FechaRevision", "Valor", FR);
                IniConfigManager.GuardarValor(Modulo + "CodeISO", "Valor", Code);
                IniConfigManager.GuardarValor(Modulo + "Nivel", "Valor", Nivel);
                IniConfigManager.GuardarValor(Modulo + "Revision", "Valor", Revision);



                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "El header ISO fue actulizado correctamente..",
                    Data = "",
                    ExtraData = "",
                    Other = ""
                });
                result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return result;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de estatus de carga " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult SendPedidoDelete(string id, string modulo = "ventas")
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();

                //Obtener info de pedidos que requieren auth
                List<AccesoDatos.PlanVentas> PedidosEntregas = new List<AccesoDatos.PlanVentas>();
                AD.RequestParameters.Add("Id", id);
                string reporte = Logic.GlobalProcedure(AD.GCGetPedDelete, AD.RequestParameters);
                PedidosEntregas = JsonConvert.DeserializeObject<List<AccesoDatos.PlanVentas>>(reporte);

                //Envio notificacion a Logistica
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Code", codeAuthPlanEmbarque);//Codigo para busqueda en tabla
                string EmailsLogistica = Logic.GlobalProcedure(AD.GCGetEmiailsCode, AD.RequestParameters);
                List<Correos> listaEmails = JsonConvert.DeserializeObject<List<Correos>>(EmailsLogistica);

                if (PedidosEntregas.Count() > 0)
                {
                    var pedidosHtml = new StringBuilder();
                    pedidosHtml.Append($@"Estimado usuario,<br><br>
                                Se solicita de su autorización de eliminación para los siguientes pedidos : <br><br>
");
                    string folio = "";
                    foreach (AccesoDatos.PlanVentas pedido in PedidosEntregas)
                    {
                        string baseUrl = $"{url}";
                        string encryptedId = HttpUtility.UrlEncode(Convert.ToBase64String(Encoding.UTF8.GetBytes(pedido.id)));
                        string encryptedPedido = HttpUtility.UrlEncode(Convert.ToBase64String(Encoding.UTF8.GetBytes(pedido.Pedido)));
                        string encryptedAutorizadoOne = HttpUtility.UrlEncode(Convert.ToBase64String(Encoding.UTF8.GetBytes("1")));
                        string encryptedAutorizadoCero = HttpUtility.UrlEncode(Convert.ToBase64String(Encoding.UTF8.GetBytes("0")));
                        //Aceptar -> se elimina el pedido
                        string aceptarUrl = $"{baseUrl}PlanVentas/AutorizacionDeletePedidos?idpedido={encryptedId}&Autorizado={encryptedAutorizadoCero}&EstDelete={encryptedAutorizadoOne}&Pedido={encryptedPedido}";
                        //Rechazar -> el pedido se regresa al plan
                        string rechazadoUrl = $"{baseUrl}PlanVentas/AutorizacionDeletePedidos?idpedido={encryptedId}&Autorizado={encryptedAutorizadoOne}&EstDelete={encryptedAutorizadoCero}&Pedido={encryptedPedido}";


                        pedidosHtml.Append($@"
                            <div style=""margin-bottom:20px; border-bottom:1px solid #ddd; padding-bottom:10px;"">
                                <strong>Pedido:</strong> {pedido.Pedido} | 
                                <strong>Fecha Entrega:</strong> {pedido.F_Entrega} |                       
                                <strong>Piezas Entrega:</strong> {pedido.PiezasEntrega}<br>
                                <strong>Cliente:</strong> {pedido.Cliente} | 
                                <strong>Fecha Original Entrega :</strong> {pedido.F_OriginalEntrega}<br><br>
                                <a href=""{aceptarUrl}"" 
                                   style=""background-color:#28a745; color:#fff; padding:8px 12px; text-decoration:none; border-radius:4px; margin-right:10px;"">
                                   Autorizar
                                </a>
                                <a href=""{rechazadoUrl}"" 
                                   style=""background-color:#dc3545; color:#fff; padding:8px 12px; text-decoration:none; border-radius:4px;"">
                                   Rechazar
                                </a>
                            </div>");

                        folio = pedido.folio;
                    }

                    string ruta = Path.Combine(
     AppDomain.CurrentDomain.BaseDirectory,
     "Plantillas",
     "CorreoBase.html"
 );

                    string plantillaHtml = System.IO.File.ReadAllText(ruta);



                    //    string plantillaHtml = System.IO.File.ReadAllText(
                    //Server.MapPath("~/Plantillas/CorreoBase.html"));



                    // Reemplazar los valores
                    string htmlFinal = plantillaHtml
                        .Replace("{{TITLEH}}", "Plan " + modulo + " :" + folio)
                        .Replace("{{TITLE}}", "⚠ Pedidos eliminados por " + modulo + ". Plan : " + folio)
                        .Replace("{{BODY}}", pedidosHtml.ToString())
                        .Replace("{{LINK}}", url);

                    EmailRequest emailRequest = new EmailRequest();
                    emailRequest.To = "";
                    emailRequest.Subject = "Solicitud Autorización";
                    emailRequest.Body = htmlFinal;
                    emailRequest.IsHtml = true;

                    SendEmails(emailRequest, "~/Images/logoFisfiber.png", listaEmails, codeAuthPlanEmbarque);
                }

                var Result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Pedidos eliminados enviados por correo.",
                    Data = "",
                    ExtraData = string.Empty
                });

                Result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return Result;

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible enviar el emial de autorización " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

    }
}
