using DocumentFormat.OpenXml.Bibliography;
using DocumentFormat.OpenXml.Drawing;
using DocumentFormat.OpenXml.Spreadsheet;
using Fisfiber.Models;
using IniParser;
using IniParser.Model;
using log4net;
using Microsoft.Ajax.Utilities;
using Microsoft.AspNet.SignalR.Json;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;

namespace Fisfiber.Controllers
{
    public class PlanVentasController : Controller
    {

        Logica Logic = new Logica();
        AccesoDatos AD = new AccesoDatos();
        private static readonly ILog log = LogManager.GetLogger(typeof(PlanVentasController));
        GlobalController GC = new GlobalController();

        string htmlBody = @"
                <!DOCTYPE html>
                <html lang=""es"">
                  <head>
                    <meta charset=""UTF-8"">
                    <title>Notificación de Plan de Ventas</title>
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
                                📝 Se ha creado un nuevo Plan de Ventas
                              </td>
                            </tr>

                            <!-- Cuerpo -->
                            <tr>
                              <td style=""padding:10px 40px 30px 40px; color:#555555; font-size:16px; line-height:1.6;"">
                                Estimado usuario,<br><br>
                                Le informamos que se ha generado correctamente un nuevo plan de ventas en el sistema.<br><br>
                                <strong style=""color:#dc362e;"">Folio del plan:</strong> <span style=""font-size:18px; font-weight:bold;"">{{FOLIO}}</span><br><br>
                                Puede consultar más detalles directamente en el sistema.
                              </td>
                            </tr>

                            <!-- Botón / Footer -->
                            <tr>
                              <td align=""center"" style=""padding: 0 0 30px 0;"">
                                <a href=""{{link}}"" style=""background-color:#dc362e; color:#ffffff; padding:12px 25px; text-decoration:none; border-radius:4px; font-weight:bold;"">Ir al sistema</a>
                              </td>
                            </tr>

                            <!-- Pie de página -->
                            <tr>
                              <td style=""background-color:#eeeeee; padding:15px 40px; text-align:center; font-size:12px; color:#888888;"">
                                © 2025 Fis Fiber Industries S.A de C.V. Todos los derechos reservados.
                              </td>
                            </tr>

                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                ";

        string htmlBodyAuth = @"
                <!DOCTYPE html>
                <html lang=""es"">
                  <head>
                    <meta charset=""UTF-8"">
                    <title>Notificación de Plan de Ventas</title>
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
                                📝 SOLICITUD DE AUTORIZACION 
                              </td>
                            </tr>

                            <!-- Cuerpo dinámico con pedidos -->
                            <tr>
                              <td style=""padding:10px 40px 30px 40px; color:#555555; font-size:16px; line-height:1.6;"">
                                Estimado usuario,<br><br>
                                Se solicita de su autorización de reprogramación para los siguientes pedidos : <br><br>

                                {{LISTA_PEDIDOS}}

                              </td>
                            </tr>

                            <!-- Pie -->
                            <tr>
                              <td style=""background-color:#eeeeee; padding:15px 40px; text-align:center; font-size:12px; color:#888888;"">
                                © 2025 Fis Fiber Industries S.A de C.V. Todos los derechos reservados.
                              </td>
                            </tr>

                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                ";

        string htmlBodyCyC = @"
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>Notificación Reporte CyC</title>
        </head>
        <body style='font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;'>
            <table width='100%' cellspacing='0' cellpadding='0' style='background-color: #f4f4f4; padding: 20px 0;'>
                <tr>
                    <td align='center'>
                        <table width='600' cellspacing='0' cellpadding='0' style='background-color: #ffffff; border-radius: 6px; overflow: hidden;'>
                            <tr>
                                <td style='background-color: #000000; text-align: center; padding: 20px;'>
                                    <img src=""cid:imgAct"" width='300' height='102' alt='Encabezado' style='display: block; margin: 0 auto;'>
                                </td>
                            </tr>
                            <tr>
                                <td style='padding: 30px; color: #333333;'>
                                    <h2 style='color: #dc362e;'>Reporte de Credito y Cobranza</h2>
                                    <p>Se ha finalizado el plan de ventas:</p>
                                    <p style='font-size: 18px; font-weight: bold; color: #000;'>Folio: <span style='color: #dc362e;'>{{FOLIO}}</span></p>

                                    <p>A continuación, los detalles del plan:</p>

                                    <table width='100%' border='1' cellpadding='5' cellspacing='0' style='border-collapse: collapse; font-size: 12px;'>
                                        <thead style='background-color: #dc362e; color: white;'>
                                            <tr>
                                                <th>Núm. Viaje</th>
                                                <th>F. Pedido</th>
                                                <th>F. Solicitud Producción</th>
                                                <th>F. Original Entrega</th>
                                                <th>F. Entrega</th>
                                                <th>Pedido</th>
                                                <th>Código Cliente</th>
                                                <th>Cliente</th>
                                                <th>Cita</th>
                                                <th>Hora Inicio</th>
                                                <th>Hora Fin</th>
                                                <th>Hora Entrega</th>
                                                <th>Articulo</th>
                                                <th>Cantidad Metros</th>
                                                <th>Núm Rollos</th>
                                                <th>Piezas Entrega</th>
                                                <th>Cotejado</th>
                                                <th>Direccion</th>
                                                <th>Comentarios</th>
                                                <th>Linea Prod.Real</th>
                                                <th>Autotransporte</th>
                                                <th>Comentarios SN</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {{filas}}
                                        </tbody>
                                    </table>

                                    <p style='margin-top: 20px;'>Este correo fue generado automáticamente. No responda a este mensaje.</p>
                                </td>
                            </tr>
                            <tr>
                                <td style='background-color: #000000; color: #ffffff; text-align: center; padding: 15px; font-size: 12px;'>
                                    © 2025 Tu Empresa. Todos los derechos reservados.
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        ";

        string url =
                    ConfigurationManager.AppSettings["Localhost"] == "true" ?
                     ConfigurationManager.AppSettings["UrlLocalEmail"] :
                     ConfigurationManager.AppSettings["UrlProdEmial"];

        //string codePV = ConfigurationManager.AppSettings["PlanVentas"];
        string codeNuevoPlanVentas = ConfigurationManager.AppSettings["NuevoPlanVentas"];
        //string codeCyC = ConfigurationManager.AppSettings["CyC"];
        string codeNotificacionCyC = ConfigurationManager.AppSettings["NotificacionCyC"];
        string codeSegundaRepro = ConfigurationManager.AppSettings["SegundaRepro"];

        

        // GET: PlanVentas
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult PlanVentas()
        {
            return View();
        }

        public ActionResult ConsultaEdicionPV()
        {
            string CodeISO = IniConfigManager.LeerValor("PlanOV_CodeISO", "Valor");
            string Nivel = IniConfigManager.LeerValor("PlanOV_Nivel", "Valor");
            string FechaRev = IniConfigManager.LeerValor("PlanOV_FechaRevision", "Valor");
            string Revision = IniConfigManager.LeerValor("PlanOV_Revision", "Valor");
            string FechaLib = IniConfigManager.LeerValor("PlanOV_FechaLiberacion", "Valor");

            ViewBag.CodeISO = CodeISO;
            ViewBag.Nivel = Nivel;
            ViewBag.FechaRev = FechaRev;
            ViewBag.FechaLib = FechaLib;
            ViewBag.Revision = Revision;


            return View();
        }

        public ActionResult PlanesFinales()
        {
            string CodeISO = IniConfigManager.LeerValor("CodeISO", "Valor");
            string Nivel = IniConfigManager.LeerValor("Nivel", "Valor");
            string FechaRev = IniConfigManager.LeerValor("FechaRevision", "Valor");
            string FechaLib = IniConfigManager.LeerValor("FechaLiberacion", "Valor");

            ViewBag.CodeISO = CodeISO;
            ViewBag.Nivel = Nivel;
            ViewBag.FechaRev = FechaRev;
            ViewBag.FechaLib = FechaLib;

            return View();
        }

        //Obtienen los pedidos del listado inicial 
        public JsonResult GetPedidosParaEntregas(string fecha_entrega, string usuario)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();


                string updateParciales = Logic.GlobalProcedure(AD.GCUpdateParciales, AD.RequestParameters);


                AD.RequestParameters.Add("fecha_entrega", (fecha_entrega != "" ? fecha_entrega : null));
                //Numero de veces que se ha realizado una peticion
                string draw = Request.Form["draw"];
                string drawValue = !string.IsNullOrEmpty(draw) ? draw : "0";
                int NroPeticion = Convert.ToInt32(drawValue);


                //Cantidad de registros a devolver
                string lenght = Request.Form["length"];
                string lenghtValue = !string.IsNullOrEmpty(lenght) ? lenght : "0";
                int CantidadRegistros = Convert.ToInt32(lenghtValue);

                //Cantidad de registros a omitir
                string start = Request.Form["start"];
                string startValue = !string.IsNullOrEmpty(start) ? start : "0";
                int OmitirRegistros = Convert.ToInt32(startValue);

                //Texto de busqueda
                string search = Request.Form["search[value]"];
                string searchValue = !string.IsNullOrEmpty(search) ? search : "";
                string FiltroBusqueda = searchValue;

                int TotalRegistros = 0;

                //=================================OBTENER DATOS===========================//

                List<AccesoDatos.PlanVentas> PedidosEntregas = new List<AccesoDatos.PlanVentas>();
                string connectionString = string.Empty;
                string reporte = Logic.GlobalProcedure(AD.GCGetPedidosEntregasVentas, AD.RequestParameters);
                PedidosEntregas = JsonConvert.DeserializeObject<List<AccesoDatos.PlanVentas>>(reporte);
                TotalRegistros = PedidosEntregas.Count();

                if (FiltroBusqueda != string.Empty)
                    PedidosEntregas = PedidosEntregas.Where(e =>
                        string.Concat(e.F_Pedido, e.F_SolicitudProduccion, e.F_OriginalEntrega, e.F_Entrega,
                                      e.Pedido, e.CodigoCliente, e.Cliente, e.ComentariosSN, e.Articulo, e.CantidadMetros,
                                      e.PiezasEntrega, e.HoraEntrega, e.Cotejado, e.Comentarios).Contains(FiltroBusqueda)).ToList();

                //Total de registros filtrados
                int totalRegistrosFiltrados = PedidosEntregas.Count();
                //Resultado final de busqueda
                PedidosEntregas = PedidosEntregas.Skip(OmitirRegistros).Take(CantidadRegistros).ToList();

                //retornamos en JSON la data obtenida
                var EncuestasFiltradas = Json(new
                {
                    draw = NroPeticion,
                    recordsTotal = TotalRegistros,
                    recordsFiltered = totalRegistrosFiltrados,
                    data = PedidosEntregas,
                }, JsonRequestBehavior.AllowGet);

                EncuestasFiltradas.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return EncuestasFiltradas;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de pedidos para entregas " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }
        //Guardar plan de ordenes de ventas
        public JsonResult SavePlanVentas(
            string PlanVentas, string Usuario,
            string Tabla, string PedidosAuth)
        {

            try
            {
                //Insertar el plan de produccion
                string Folios = string.Empty;
                AD.RequestParameters = new Dictionary<string, string>();
                //Folio generado finalmente|
                //dynamic MonitorData = JsonConvert.DeserializeObject<dynamic>(PlanVentas);
                var monitorData = JArray.Parse(PlanVentas);

                string idsInsertados = string.Empty;

                string folioML = Logic.GlobalProcedureSigleR(AD.GCInsertaPlanVentas, null);
                //// Validación del los datos
                if (folioML.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = folioML });
                }
                //No existe información
                else if (folioML.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    {
                        Status = "ERROR",
                        Message = "No fue posible generar el folio para el plan de ordenes ventas"
                    });
                }

                //Insertar los pedidos del plan de ordenes ventas
                AD.RequestParameters.Clear();

                foreach (JObject item in monitorData)
                {
                    AD.RequestParameters.Add("folio", folioML); // tu folio personalizado

                    foreach (var propiedad in item.Properties())
                    {

                        var valor = propiedad.Value?.ToString() ?? "";

                        if (propiedad.Name.Contains("Hora"))
                        {
                            // Caso especial
                            if (valor == "--")
                            {
                                valor = "";
                            }
                            else
                            {
                                // Quitar espacios
                                valor = valor.Trim();

                                // Dejar solo números
                                valor = new string(valor.Where(char.IsDigit).ToArray());

                                // Limitar a 4 dígitos
                                if (valor.Length > 4)
                                {
                                    valor = valor.Substring(0, 4);
                                }
                            }
                        }

                        AD.RequestParameters.Add(propiedad.Name, valor);
                    }


                    // Ejecución del procedimiento almacenado
                    string json = JsonConvert.SerializeObject(AD.RequestParameters);
                    Console.WriteLine(json);

                    string lineaPP = Logic.GlobalProcedure(AD.GCInsertaPlanVentasDetails, AD.RequestParameters);
                    idsInsertados = lineaPP;
                    AD.RequestParameters.Clear();
                }
                //Guardar loso folios generadosc
                Folios += folioML + ",";

                //Registrar movimiento en bitacora
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", folioML);
                AD.RequestParameters.Add("descripcion", "Se ha creado el plan de ordenes ventas: " + folioML);
                AD.RequestParameters.Add("usuario", Usuario);
                AD.RequestParameters.Add("tabla", Tabla);
                string Revision = Logic.GlobalProcedure(AD.GCInsertaBitacora, AD.RequestParameters);

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", folioML);
                AD.RequestParameters.Add("tabla", "PlanVentas");
                string headerBitacora = Logic.GlobalProcedure(AD.GetBitacoraHeaderDetails, AD.RequestParameters);

                //Envio notificacion a Logistica
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Code", codeNuevoPlanVentas);//Codigo para busqueda en tabla
                string EmailsLogistica = Logic.GlobalProcedure(AD.GCGetEmiailsCode, AD.RequestParameters);
                List<Correos> listaEmails = JsonConvert.DeserializeObject<List<Correos>>(EmailsLogistica);

                htmlBody = htmlBody.Replace("{{FOLIO}}", folioML);
                htmlBody = htmlBody.Replace("{{link}}", url);
                EmailRequest emailRequest = new EmailRequest();
                emailRequest.To = "";
                emailRequest.Subject = "Nuevo plan ventas";
                emailRequest.Body = htmlBody;
                emailRequest.IsHtml = true;

                GC.SendEmails(emailRequest, "~/Images/logoFisfiber.png", listaEmails, codeNuevoPlanVentas);

                //NOTIFICACION POR SEGUNDA REPROGRAMACION 
                var resultAuth = this.SendAuth(folioML);

                //OK
                var Result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Detalles de folio obtenidos correctamente.",
                    Data = headerBitacora,
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
                string msg = "No es posible crear el plan de ordenes ventas " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        //Envio de correos sobre pedidos que requieren autorizacion por segunda reprogramacion 
        public JsonResult SendAuth(string folio)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();

                //Obtener info de pedidos que requieren auth
                List<AccesoDatos.PlanVentas> PedidosEntregas = new List<AccesoDatos.PlanVentas>();
                AD.RequestParameters.Add("Folio", folio.ToString());
                string reporte = Logic.GlobalProcedure(AD.GCGetIfoAuthOVByFolio, AD.RequestParameters);
                PedidosEntregas = JsonConvert.DeserializeObject<List<AccesoDatos.PlanVentas>>(reporte);

                //Envio notificacion a Logistica
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Code", codeSegundaRepro);//Codigo para busqueda en tabla
                string EmailsLogistica = Logic.GlobalProcedure(AD.GCGetEmiailsCode, AD.RequestParameters);
                List<Correos> listaEmails = JsonConvert.DeserializeObject<List<Correos>>(EmailsLogistica);





                if (PedidosEntregas.Count() > 0)
                {
                    var pedidosHtml = new StringBuilder();
                    foreach (AccesoDatos.PlanVentas pedido in PedidosEntregas)
                    {
                        string baseUrl = $"{url}";
                        string encryptedId = HttpUtility.UrlEncode(Convert.ToBase64String(Encoding.UTF8.GetBytes(pedido.id)));
                        string encryptedPedido = HttpUtility.UrlEncode(Convert.ToBase64String(Encoding.UTF8.GetBytes(pedido.Pedido)));
                        string encryptedAutorizadoSi = HttpUtility.UrlEncode(Convert.ToBase64String(Encoding.UTF8.GetBytes("1")));
                        string encryptedAutorizadoNo = HttpUtility.UrlEncode(Convert.ToBase64String(Encoding.UTF8.GetBytes("0")));
                        string aceptarUrl = $"{baseUrl}PlanVentas/AutorizacionPedidos?idpedido={encryptedId}&Autorizado={encryptedAutorizadoSi}&Pedido={encryptedPedido}";
                        string rechazadoUrl = $"{baseUrl}PlanVentas/AutorizacionPedidos?idpedido={encryptedId}&Autorizado={encryptedAutorizadoNo}&Pedido={encryptedPedido}";


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
                    }

                    //htmlBody = htmlBody.Replace("{{FOLIO}}", folio);
                    htmlBodyAuth = htmlBodyAuth.Replace("{{LISTA_PEDIDOS}}", pedidosHtml.ToString());

                    //htmlBody = htmlBody.Replace("{{FOLIO}}", folioML);
                    EmailRequest emailRequest = new EmailRequest();
                    emailRequest.To = "";
                    emailRequest.Subject = "Solicitud Autorización";
                    emailRequest.Body = htmlBodyAuth;
                    emailRequest.IsHtml = true;

                    GC.SendEmails(emailRequest, "~/Images/logoFisfiber.png", listaEmails, codeSegundaRepro);
                }


                var Result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Detalles de folio obtenidos correctamente.",
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
                string msg = "No es posible crear el plan de ordenes ventas " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        [AllowAnonymous]
        [HttpGet]
        public ActionResult AutorizacionPedidos()
        {
            string result = string.Empty;
            Dictionary<string, string> parameters = new Dictionary<string, string>();
            string IdEmail = string.Empty;
            string AutorizadoEmail = string.Empty;
            try
            {

                //ANTES DE CONTINUAR CON LA SOLICITUD, VALIDAR SI YA HA SIDO ATENDIDA
                string decodedId = Encoding.UTF8.GetString(Convert.FromBase64String(Request.QueryString["idpedido"]));
                string decodedAutorizado = Encoding.UTF8.GetString(Convert.FromBase64String(Request.QueryString["Autorizado"]));
                string decodedPedido = Encoding.UTF8.GetString(Convert.FromBase64String(Request.QueryString["Pedido"]));
                IdEmail = decodedId;
                AutorizadoEmail = decodedAutorizado;
                parameters.Add("ID", IdEmail);
                parameters.Add("Auth", AutorizadoEmail);
                string atendida = Logic.GlobalProcedure(AD.GCUpdateAuthRepro, parameters);

                JArray atendidaResult = JArray.Parse(atendida);
                result = atendidaResult[0]["Msj"].ToString();
                string reAuth = atendidaResult[0]["AuthRepro"].ToString();
                string reAtendida = atendidaResult[0]["Atendida"].ToString();

                AutorizadoEmail = reAuth;

                StringBuilder Mensaje = new StringBuilder();
                string OC = string.Empty;
                string Estatus = string.Empty;
                string IconResult = string.Empty;

                Estatus = (AutorizadoEmail == "True" ? "Autorizada" : "Rechazada");
                IconResult = (AutorizadoEmail == "True" ? $@"<i class=""bi bi-check-circle-fill icon-ok""></i>" : $@"<i class=""bi bi-x-circle-fill icon-no""></i>");
                Mensaje.Append("La solicitud de autorización para el pedido: " + decodedPedido + " ha sido: " + Estatus + ".");

                //Enviar notificacion al usuario de el estatus de su solicitud;
                ViewBag.Mensaje = Mensaje;
                ViewBag.Result = result;
                ViewBag.IconResult = IconResult;
                //ViewBag.Autorizado = AutorizadoEmail;
                //ViewBag.Pedido = AutorizadoEmail;




                return View();

            }
            catch (Exception ex)
            {
                StringBuilder Error = new StringBuilder();
                //string OC = FolioEmail.Split('-').ElementAt(0);
                //Error.Append("No fue posible realizar la autorización de la OC: " + OC);
                Error.Append(ex.Message != null ? ex.Message.ToString() : string.Empty);
                Error.Append(ex.InnerException != null ? ex.InnerException.ToString() : string.Empty);
                ViewBag.Mensaje = Error.ToString();
                return View();
            }
        }

        [AllowAnonymous]
        [HttpGet]
        public ActionResult AutorizacionDeletePedidos()
        {
            string result = string.Empty;
            Dictionary<string, string> parameters = new Dictionary<string, string>();
            string IdEmail = string.Empty;
            string AutorizadoEmail = string.Empty;
            try
            {
                
                //ANTES DE CONTINUAR CON LA SOLICITUD, VALIDAR SI YA HA SIDO ATENDIDA
                string decodedId = Encoding.UTF8.GetString(Convert.FromBase64String(Request.QueryString["idpedido"]));
                string decodedAutorizado = Encoding.UTF8.GetString(Convert.FromBase64String(Request.QueryString["Autorizado"]));
                string decodedEstDelete = Encoding.UTF8.GetString(Convert.FromBase64String(Request.QueryString["EstDelete"]));
                string decodedPedido = Encoding.UTF8.GetString(Convert.FromBase64String(Request.QueryString["Pedido"]));
                IdEmail = decodedId;
                AutorizadoEmail = decodedAutorizado;
                parameters.Add("ID", IdEmail);
                parameters.Add("Auth", AutorizadoEmail);  
                parameters.Add("EstDelete", decodedEstDelete); 
                string atendida = Logic.GlobalProcedure(AD.GCUpdateAuthDelete, parameters);

                if (atendida.Contains("Error"))
                {
                    ViewBag.Mensaje = atendida;
                    return View();
                }

                JArray atendidaResult = JArray.Parse(atendida);
                result = atendidaResult[0]["Msj"].ToString();
                string reAuth = atendidaResult[0]["Autorizado"].ToString();
                string reDelete = atendidaResult[0]["EstDelete"].ToString();
                string reAtendida = atendidaResult[0]["Atendida"].ToString();

                AutorizadoEmail = reAuth;

                StringBuilder Mensaje = new StringBuilder();
                string OC = string.Empty;
                string Estatus = string.Empty;
                string IconResult = string.Empty;

                Estatus = (AutorizadoEmail == "False" ? "Autorizada. El pedido fue eliminado." : "Rechazada. El pedido se mantendra en el plan.");
                IconResult = (AutorizadoEmail == "False" ? $@"<i class=""bi bi-check-circle-fill icon-ok""></i>" : $@"<i class=""bi bi-x-circle-fill icon-no""></i>");
                Mensaje.Append("La solicitud de autorización para el pedido: " + decodedPedido + " ha sido: " + Estatus + ".");

                //Enviar notificacion al usuario de el estatus de su solicitud;
                ViewBag.Mensaje = Mensaje;
                ViewBag.Result = result;
                ViewBag.IconResult = IconResult;


                return View();

            }
            catch (Exception ex)
            {
                StringBuilder Error = new StringBuilder();
                //string OC = FolioEmail.Split('-').ElementAt(0);
                //Error.Append("No fue posible realizar la autorización de la OC: " + OC);
                Error.Append(ex.Message != null ? ex.Message.ToString() : string.Empty);
                Error.Append(ex.InnerException != null ? ex.InnerException.ToString() : string.Empty);
                ViewBag.Mensaje = Error.ToString();
                return View();
            }
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="usuario"></param>
        /// <param name="configuracion"></param>
        /// <returns></returns>
        public JsonResult GetConfigxUsuarioPE(string usuario, string configuracion)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("usuario", usuario);


                string CPP = Logic.GlobalProcedure(AD.GCGetConfiguracionPE, AD.RequestParameters);
                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (CPP.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = CPP });
                }
                //No existe información
                else if (CPP.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente al usuario: " + usuario + "." });
                }
                //OK
                var result = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de configuración obtenidos correctamente.", Data = CPP });
                result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return result;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la configuración del plan de producción " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        //Exportar un plan de ordenes de ventas a Excel
        public ActionResult ExportarVentas(string folio)
        {
            AD.RequestParameters = new Dictionary<string, string>();
            AD.RequestParameters.Clear();
            AD.RequestParameters.Add("Folio", folio);
            string PPD = Logic.GlobalProcedure(AD.GCGetPlanesVentasDetailsSAP, AD.RequestParameters);
            var ventas = JsonConvert.DeserializeObject<List<AccesoDatos.PlanVentas>>(PPD);
            var excelBytes = ExcelExporter.ExportToExcel(ventas);
            return File(excelBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Ventas.xlsx");
        }
        public JsonResult GetPlanesVentas(string Status)
        {
            try
            {
                //Numero de veces que se ha realizado una peticion
                string draw = Request.Form["draw"];
                string drawValue = !string.IsNullOrEmpty(draw) ? draw : "0";
                int NroPeticion = Convert.ToInt32(drawValue);


                //Cantidad de registros a devolver
                string lenght = Request.Form["length"];
                string lenghtValue = !string.IsNullOrEmpty(lenght) ? lenght : "0";
                int CantidadRegistros = Convert.ToInt32(lenghtValue);

                //Cantidad de registros a omitir
                string start = Request.Form["start"];
                string startValue = !string.IsNullOrEmpty(start) ? start : "0";
                int OmitirRegistros = Convert.ToInt32(startValue);

                //Texto de busqueda
                string search = Request.Form["search[value]"];
                string searchValue = !string.IsNullOrEmpty(search) ? search : "";
                string FiltroBusqueda = searchValue;

                int TotalRegistros = 0;

                //=================================OBTENER DATOS===========================//

                List<AccesoDatos.PlanesVentasCreados> PP = new List<AccesoDatos.PlanesVentasCreados>();
                string connectionString = string.Empty;
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("Status", Status);
                string reporte = Logic.GlobalProcedure(AD.GCGetPlanesVentas, AD.RequestParameters);
                PP = JsonConvert.DeserializeObject<List<AccesoDatos.PlanesVentasCreados>>(reporte);
                TotalRegistros = PP.Count();

                if (FiltroBusqueda != string.Empty)
                    PP = PP.Where(e => string.Concat(e.Folio, e.FechaCreacion).Contains(FiltroBusqueda)).ToList();
                //Total de registros filtrados
                int totalRegistrosFiltrados = PP.Count();
                //Resultado final de busqueda
                PP = PP.Skip(OmitirRegistros).Take(CantidadRegistros).ToList();

                //retornamos en JSON la data obtenida
                var EncuestasFiltradas = Json(new
                {
                    draw = NroPeticion,
                    recordsTotal = TotalRegistros,
                    recordsFiltered = totalRegistrosFiltrados,
                    data = PP
                }, JsonRequestBehavior.AllowGet);

                EncuestasFiltradas.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return EncuestasFiltradas;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de planes de producción " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();

                log.Error($"{finalmessage} - {E.Message}", E);


                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }
        public JsonResult GetPlanesVetnasDetails(string folio)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Folio", folio);
                string PPD = Logic.GlobalProcedure(AD.GCGetPlanVentasDetByFolio, AD.RequestParameters);
                string InfoPV = Logic.GlobalProcedure(AD.GCGetInfoPv, AD.RequestParameters);
                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (PPD.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = PPD });
                }
                //No existe información
                else if (PPD.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente al plan: " + folio + "." });
                }

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", folio);
                AD.RequestParameters.Add("tabla", "PlanVentas");
                string headerBitacora = Logic.GlobalProcedure(AD.GetBitacoraHeaderDetails, AD.RequestParameters);


                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Detalles de plan obtenidos correctamente.",
                    Data = PPD,
                    ExtraData = headerBitacora,
                    Other = InfoPV
                });
                result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return result;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de planes de ventas " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetPlanesVentasDetailsCyC(string folio)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Folio", folio);
                string PPD = Logic.GlobalProcedure(AD.GCGetPlanesVentasDetailsByFolioP, AD.RequestParameters);
                string InfoPVD = Logic.GlobalProcedure(AD.GCGetInfoPv, AD.RequestParameters);
                //string PPD = Logic.GlobalProcedure(AD.GCGetPlanesVentasDetailsSAP, AD.RequestParameters);
                //string PPDT = Logic.GlobalProcedure(AD.GCGetPlanesVentasDetails, AD.RequestParameters);


                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (PPD.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = PPD });
                }
                //No existe información
                else if (PPD.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente al plan: " + folio + "." });
                }

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", folio);
                AD.RequestParameters.Add("tabla", "PlanVentas");
                string headerBitacora = Logic.GlobalProcedure(AD.GetBitacoraHeaderDetails, AD.RequestParameters);


                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Detalles de plan obtenidos correctamente.",
                    Data = PPD,
                    ExtraData = headerBitacora,
                    Other = InfoPVD
                });
                result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return result;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de planes de ventas " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }
        public JsonResult UpdateOrderRowsDetailsV(string orderRows, string Folio)
        {
            try
            {
                log.Info($"[UpdateOrderRowsDetails] Inicio del proceso de actualización de orden del plan con folio: {Folio}, orden: {orderRows}");
                AD.RequestParameters = new Dictionary<string, string>();

                // Crear un diccionario para los parámetros
                var requestParameters = new Dictionary<string, string>
                {
                    { "JsonData", orderRows } // El JSON se pasa directamente
                };

                // Ejecutar el procedimiento almacenado
                log.Info($"[UpdateOrderRowsDetails] generando actualización.");
                var reporte = Logic.GlobalProcedure(AD.GCUpdateOrderRowsDetailsV, requestParameters);

                // Validación de los datos
                if (reporte.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    {
                        Status = "ERROR",
                        Message = reporte
                    });
                }

                log.Info($"[UpdateOrderRowsDetails] actualizando tiempos,horas,capacidad del plan.");
                AD.RequestParameters.Add("folio", Folio);

                // Respuesta exitosa
                log.Info($"[UpdateOrderRowsDetails] proceso completado.");
                return Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Data = "",
                    Message = "Operación realizada correctamente"
                });
            }
            catch (Exception ex)
            {
                // Manejo de excepciones
                string methodName = MethodBase.GetCurrentMethod().Name;
                string controllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = $"No es posible actualizar la lista de plan ventas details en {methodName} en {controllerName}. Por favor contacte al administrador del sistema.";
                string finalMessage = AD.Excepcion(ex, msg).ToString();
                log.Error($"[UpdateOrderRowsDetails] no fue posible completar el proceso de cambio de orden del plan: {finalMessage.ToString()}.");

                return Json(new AccesoDatos.JsonResponse
                {
                    Status = "ERROR",
                    Message = finalMessage,
                    Data = "[]"
                });
            }
        }
        public JsonResult ActualizarOV(
            string PlanVentas, string folioPP, string HistorialEdiciones,
            string usuario, string Tabla, string FilasM)
        {
            try
            {
                log.Info($"[ActualizarOV] Inicio del proceso de actualizar plan de producción: {folioPP} en tabla {Tabla} con - Usuario: {usuario} recibiendo: {PlanVentas} con historial de ediciones: {HistorialEdiciones} ");

                AD.RequestParameters = new Dictionary<string, string>();

                //Insertar el plan de produccion

                log.Info($"[ActualizarOV] Actualizando plan de producción");
                AD.RequestParameters.Clear();
                JArray LineasPP = JArray.Parse(PlanVentas);
                JArray LineasM = JArray.Parse(FilasM);

                foreach (JObject item in LineasPP)
                {
                    //Agregar resto de parametros de consulta
                    foreach (var linea in item.Properties())
                    {

                        AD.RequestParameters.Add(linea.Name, linea.Value.ToString());
                    }


                    //Insertar la linea
                    string lineaPP = Logic.GlobalProcedure(AD.GCUpdatePlanesVentasDetails, AD.RequestParameters);


                    if (lineaPP.Contains("Error"))
                    {
                        log.Error($"[ActualizarOV] Error al actualizar plan: {lineaPP}");
                        return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = lineaPP, Data = "[]" });
                    }
                    log.Info($"[ActualizarOV] Actualizacion correcta pedidos actualizados : {lineaPP.ToString()}");

                    //Limpiar los parametros
                    AD.RequestParameters.Clear();
                }


                AD.RequestParameters.Clear();

                foreach (JObject item in LineasM)
                {
                    AD.RequestParameters.Add("folio", folioPP); // tu folio personalizado

                    foreach (var propiedad in item.Properties())
                    {
                        //AD.RequestParameters.Add(propiedad.Name, propiedad.Value.ToString());

                        var valor = propiedad.Value?.ToString() ?? "";


                        if (propiedad.Name.Contains("Hora"))
                        {
                            // Caso especial
                            if (valor == "--")
                            {
                                valor = "";
                            }
                            else
                            {
                                // Quitar espacios
                                valor = valor.Trim();

                                // Dejar solo números
                                valor = new string(valor.Where(char.IsDigit).ToArray());

                                // Limitar a 4 dígitos
                                if (valor.Length > 4)
                                {
                                    valor = valor.Substring(0, 4);
                                }
                            }
                        }

                        AD.RequestParameters.Add(propiedad.Name, valor);
                    }

                    // Ejecución del procedimiento almacenado
                    string json = JsonConvert.SerializeObject(AD.RequestParameters);
                    Console.WriteLine(json);

                    string lineaPP = Logic.GlobalProcedure(AD.GCInsertaPlanVentasDetails, AD.RequestParameters);
                    AD.RequestParameters.Clear();
                }

                //OK
                log.Info($"[ActualizarOF] Proceso completado.");
                var Result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Plan actualizado correctamente.",
                    Data = "[]",
                    ExtraData = ""
                });
                Result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return Result;

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible actualizar las ordenes de fabricación " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"[ActualizarOF] No fue posible completar el proceso de actualización del plan: {finalmessage.ToString()}");

                var Result = Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
                Result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return Result;
            }
        }

        //Guardar plan de ordenes de ventas
        public JsonResult AddOrdenesVentas(
            string PlanVentas, string Folio,
            string Usuario, string Tabla)
        {

            try
            {

                AD.RequestParameters = new Dictionary<string, string>();
                //Folio generado finalmente|
                //dynamic MonitorData = JsonConvert.DeserializeObject<dynamic>(PlanVentas);
                var monitorData = JArray.Parse(PlanVentas);
                string pedidos = String.Empty;

                //Insertar los pedidos del plan de ordenes ventas
                foreach (JObject item in monitorData)
                {
                    AD.RequestParameters.Add("folio", Folio); // tu folio personalizado

                    foreach (var propiedad in item.Properties())
                    {
                        AD.RequestParameters.Add(propiedad.Name, propiedad.Value.ToString());
                    }

                    //Para mantener el orden
                    AD.RequestParameters["Orden"] = "-1";

                    // Ejecución del procedimiento almacenado
                    string json = JsonConvert.SerializeObject(AD.RequestParameters);
                    //Console.WriteLine(json);

                    string lineaPP = Logic.GlobalProcedure(AD.GCInsertaPlanVentasDetails, AD.RequestParameters);
                    pedidos += AD.RequestParameters["Pedido"] + ",";
                    AD.RequestParameters.Clear();
                }


                //Registrar movimiento en bitacora
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", Folio);
                AD.RequestParameters.Add("descripcion", "Se agregaron pedidos al plan: " + Folio);
                AD.RequestParameters.Add("usuario", Usuario);
                AD.RequestParameters.Add("tabla", Tabla);
                string Revision = Logic.GlobalProcedure(AD.GCInsertaBitacora, AD.RequestParameters);

                dynamic rev = JsonConvert.DeserializeObject<dynamic>(Revision);

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", Folio);
                AD.RequestParameters.Add("tabla", "PlanVentas");
                string headerBitacora = Logic.GlobalProcedure(AD.GetBitacoraHeaderDetails, AD.RequestParameters);


                //Envio notificacion a Logistica de nuevos pedidos
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Code", codeNuevoPlanVentas);//Codigo para busqueda en tabla
                string EmailsLogistica = Logic.GlobalProcedure(AD.GCGetEmiailsCode, AD.RequestParameters);
                List<Correos> listaEmails = JsonConvert.DeserializeObject<List<Correos>>(EmailsLogistica);

                //Cambiando estatus a pendiente revision
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Folio", Folio);
                AD.RequestParameters.Add("Estatus", "0");
                string updatePVCC = Logic.GlobalProcedure(AD.GCUpdateEstRevCC, AD.RequestParameters);



                string plantillaHtml = System.IO.File.ReadAllText(
                    Server.MapPath("~/Plantillas/CorreoBase.html"));

                // Cuerpo dinámico
                string cuerpo = @"
                Estimado usuario,<br><br>
                Le informamos que se agregaron los pedidos : {{PEDIDOS}}.<br><br>
                <strong style='color:#dc362e;'>Folio del plan: </strong> 
                <span style='font-size:18px; font-weight:bold;'>{{FOLIO}}</span><br><br>
                <strong style='color:#dc362e;'>Revisión: </strong> 
                <span style='font-size:18px; font-weight:bold;'>{{REV}}</span><br><br>
                Puede consultar más detalles directamente en el sistema.";

                //Eliminar la ultima ,
                if (!string.IsNullOrEmpty(pedidos))
                {
                    pedidos = pedidos.Substring(0, pedidos.Length - 1);
                }


                cuerpo = cuerpo
                    .Replace("{{PEDIDOS}}", pedidos)
                    .Replace("{{FOLIO}}", Folio)
                    .Replace("{{REV}}", rev[0]["Revision"].ToString());

                // Reemplazar los valores
                string htmlFinal = plantillaHtml
                    .Replace("{{TITLEH}}", "Actualización de plan")
                    .Replace("{{TITLE}}", "📝 Se ha modificado el plan de ventas")
                    .Replace("{{BODY}}", cuerpo)
                    .Replace("{{LINK}}", url);


                EmailRequest emailRequest = new EmailRequest();
                emailRequest.To = "";
                emailRequest.Subject = "Actuzalización de plan " + Folio;
                emailRequest.Body = htmlFinal;
                emailRequest.IsHtml = true;

                GC.SendEmails(emailRequest, "~/Images/logoFisfiber.png", listaEmails, codeNuevoPlanVentas);

                this.SendAuth(Folio);

                //OK
                var Result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Detalles de folio obtenidos correctamente.",
                    Data = headerBitacora,
                    ExtraData = Revision
                });

                Result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return Result;

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible crear el plan de ordenes ventas " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult DeleteItemPV(string id, string usuario)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();


                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Id", id);

                string result = Logic.GlobalProcedure(AD.GCDeleteItemPV, AD.RequestParameters);


                if (result.Contains("Error"))
                {
                    throw new Exception(result);
                }

                GC.SendPedidoDelete(id,"ventas");

                //OK
                var Result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Detalles de folio obtenidos correctamente.",

                });

                Result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return Result;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible eliminar el pedido de la orden de venta " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }


        public JsonResult GetPedidosEntregasByDocEntry(string DocEntrys)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();

                List<AccesoDatos.PlanVentas> PedidosEntregas = new List<AccesoDatos.PlanVentas>();
                AD.RequestParameters.Add("DocEntry", DocEntrys.ToString());


                string reporte = Logic.GlobalProcedure(AD.GCGetPedidosVentasByDocEntry, AD.RequestParameters);
                PedidosEntregas = JsonConvert.DeserializeObject<List<AccesoDatos.PlanVentas>>(reporte);


                //retornamos en JSON la data obtenida
                var EncuestasFiltradas = Json(new
                {
                    Status = "OK",
                    Data = PedidosEntregas,
                }, JsonRequestBehavior.AllowGet);

                EncuestasFiltradas.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return EncuestasFiltradas;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de pedidos para entregas " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetPlanesFinales()
        {
            try
            {
                //Numero de veces que se ha realizado una peticion
                string draw = Request.Form["draw"];
                string drawValue = !string.IsNullOrEmpty(draw) ? draw : "0";
                int NroPeticion = Convert.ToInt32(drawValue);


                //Cantidad de registros a devolver
                string lenght = Request.Form["length"];
                string lenghtValue = !string.IsNullOrEmpty(lenght) ? lenght : "0";
                int CantidadRegistros = Convert.ToInt32(lenghtValue);

                //Cantidad de registros a omitir
                string start = Request.Form["start"];
                string startValue = !string.IsNullOrEmpty(start) ? start : "0";
                int OmitirRegistros = Convert.ToInt32(startValue);

                //Texto de busqueda
                string search = Request.Form["search[value]"];
                string searchValue = !string.IsNullOrEmpty(search) ? search : "";
                string FiltroBusqueda = searchValue;

                int TotalRegistros = 0;

                //=================================OBTENER DATOS===========================//

                List<AccesoDatos.PlanesVentasCreados> PP = new List<AccesoDatos.PlanesVentasCreados>();
                string connectionString = string.Empty;
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("Status", "1");
                string reporte = Logic.GlobalProcedure(AD.GCGetPlanesVentasCerrados, AD.RequestParameters);
                PP = JsonConvert.DeserializeObject<List<AccesoDatos.PlanesVentasCreados>>(reporte);
                TotalRegistros = PP.Count();

                if (FiltroBusqueda != string.Empty)
                    PP = PP.Where(e => string.Concat(e.Folio).Contains(FiltroBusqueda)).ToList();
                //Total de registros filtrados
                int totalRegistrosFiltrados = PP.Count();
                //Resultado final de busqueda
                PP = PP.Skip(OmitirRegistros).Take(CantidadRegistros).ToList();

                //retornamos en JSON la data obtenida
                var EncuestasFiltradas = Json(new
                {
                    draw = NroPeticion,
                    recordsTotal = TotalRegistros,
                    recordsFiltered = totalRegistrosFiltrados,
                    data = PP
                }, JsonRequestBehavior.AllowGet);

                EncuestasFiltradas.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return EncuestasFiltradas;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de planes de producción " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();

                log.Error($"{finalmessage} - {E.Message}", E);


                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult FinalizarPlanVentas(string folio)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();


                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Folio", folio);
                string resultUpdate = Logic.GlobalProcedure(AD.GCFinalizarPlan, AD.RequestParameters);



                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Plan finalizado correctamente.",
                    Data = "[]",
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
                string msg = "No es posible obtener la lista de planes de ventas " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }


        public JsonResult EnviarReporteCyC(string folio)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Folio", folio);
                string PPD = Logic.GlobalProcedure(AD.GCGetPlanesVentasDetailsSAP, AD.RequestParameters);
                var pedidos = JsonConvert.DeserializeObject<List<AccesoDatos.PlanVentas>>(PPD);


                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (PPD.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = PPD });
                }
                //No existe información
                else if (PPD.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente al plan: " + folio + "." });
                }

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", folio);
                AD.RequestParameters.Add("tabla", "PlanVentas");
                string headerBitacora = Logic.GlobalProcedure(AD.GetBitacoraHeaderDetails, AD.RequestParameters);



                //Alerta para pedidos que requieren autorizacion
                if (pedidos.Count() > 0)
                {
                    var tablaHtml = new StringBuilder();

                    foreach (var plan in pedidos)
                    {
                        tablaHtml.AppendLine("<tr>");
                        tablaHtml.AppendLine($"<td>{plan.NumeroViaje}</td>");
                        tablaHtml.AppendLine($"<td>{plan.F_Pedido}</td>");
                        tablaHtml.AppendLine($"<td>{plan.F_SolicitudProduccion}</td>");
                        tablaHtml.AppendLine($"<td>{plan.F_OriginalEntrega}</td>");
                        tablaHtml.AppendLine($"<td>{plan.F_Entrega}</td>");
                        tablaHtml.AppendLine($"<td>{plan.Pedido}</td>");
                        tablaHtml.AppendLine($"<td>{plan.CodigoCliente}</td>");
                        tablaHtml.AppendLine($"<td>{plan.Cliente}</td>");
                        tablaHtml.AppendLine($"<td>{plan.Cita}</td>");
                        tablaHtml.AppendLine($"<td>{plan.HoraInicio}</td>");
                        tablaHtml.AppendLine($"<td>{plan.HoraFin}</td>");
                        tablaHtml.AppendLine($"<td>{plan.HoraEntrega}</td>");
                        tablaHtml.AppendLine($"<td>{plan.Articulo}</td>");
                        tablaHtml.AppendLine($"<td>{plan.CantidadMetros}</td>");
                        tablaHtml.AppendLine($"<td>{plan.NumRollos}</td>");
                        tablaHtml.AppendLine($"<td>{plan.PiezasEntrega}</td>");
                        tablaHtml.AppendLine($"<td>{plan.Cotejado}</td>");
                        tablaHtml.AppendLine($"<td>{plan.Direccion}</td>");
                        tablaHtml.AppendLine($"<td>{plan.Comentarios}</td>");
                        tablaHtml.AppendLine($"<td>{plan.LineaProd_Real}</td>");
                        tablaHtml.AppendLine($"<td>{plan.Autotransporte}</td>");
                        tablaHtml.AppendLine($"<td>{plan.ComentariosSN}</td>");
                        tablaHtml.AppendLine("</tr>");
                    }


                    string cuerpoTabla = tablaHtml.ToString();
                    htmlBodyCyC = htmlBodyCyC.Replace("{{filas}}", cuerpoTabla);

                    //Envio notificacion a Logistica
                    AD.RequestParameters.Clear();
                    AD.RequestParameters.Add("Code", codeNotificacionCyC);//Codigo para busqueda en tabla
                    string EmailsLogistica = Logic.GlobalProcedure(AD.GCGetEmiailsCode, AD.RequestParameters);
                    List<Correos> listaEmails = JsonConvert.DeserializeObject<List<Correos>>(EmailsLogistica);

                    htmlBodyCyC = htmlBodyCyC.Replace("{{FOLIO}}", folio);
                    EmailRequest emailRequest = new EmailRequest();
                    emailRequest.To = "";
                    emailRequest.Subject = "Reporte CyC Plan " + folio;
                    emailRequest.Body = htmlBodyCyC;
                    emailRequest.IsHtml = true;

                    GC.SendEmails(emailRequest, "~/Images/logoFisfiber.png", listaEmails, codeNotificacionCyC);

                }


                //OK
                var result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Detalles de plan obtenidos correctamente.",
                    Data = PPD,
                    ExtraData = headerBitacora,
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
                string msg = "No es posible obtener la lista de planes de ventas " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

    }
}
