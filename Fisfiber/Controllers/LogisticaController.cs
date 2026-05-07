using Fisfiber.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web.Mvc;
using System.Web.UI.WebControls;

namespace Fisfiber.Controllers
{
    public class LogisticaController : Controller
    {
        Logica Logic = new Logica();
        AccesoDatos AD = new AccesoDatos();
        #region VIEWS
        // GET: PlanProduccion
        public ActionResult Monitor()
        {
            return View();
        }
        public ActionResult ConsultaEdicion()
        {
            return View();
        }
        #endregion

        #region Creacion
        public JsonResult SaveMonitor(string Monitor, string Usuario, string Tabla)
        {

            try
            {
                //Insertar el plan de produccion
                string Folios = string.Empty;
                AD.RequestParameters = new Dictionary<string, string>();
                //Folio generado finalmente
                dynamic MonitorData = JsonConvert.DeserializeObject<dynamic>(Monitor);

                foreach (var linea in MonitorData)
                {
                    string folioML = Logic.GlobalProcedureSigleR(AD.GCInsertaMonitorLogistica, null);
                    //// Validación del los datos
                    if (folioML.Contains("Error"))
                    {
                        return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = folioML });
                    }
                    //No existe información
                    else if (folioML.Contains("[]"))
                    {
                        return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No fue posible generar el folio para el plan de producción." });
                    }

                    //Insertar las lineas del plan de produccion
                    AD.RequestParameters.Clear();

                    foreach (var item in linea.Value)
                    {
                        //Agregar el folio a los parametros
                        AD.RequestParameters.Add("folio", folioML);
                        //Agregar resto de parametros de consulta
                        foreach (var ProduccionLine in item.Properties())
                        {
                            AD.RequestParameters.Add(ProduccionLine.Name, ProduccionLine.Value.ToString());
                        }

                        //Eliminar parametros inecesarios para este caso
                        AD.RequestParameters.Remove("Folio");
                        AD.RequestParameters.Remove("Generada");
                        AD.RequestParameters.Remove("Estatus");
                        //Parametros que siempre se traen de  SAP
                        AD.RequestParameters.Remove("Cita");
                        AD.RequestParameters.Remove("HoraInicio");
                        AD.RequestParameters.Remove("HoraFin");
                        AD.RequestParameters.Remove("Distancia");

                        string json = JsonConvert.SerializeObject(AD.RequestParameters);
                        Console.WriteLine(json);

                        //Insertar la linea
                        string lineaPP = Logic.GlobalProcedure(AD.GCInsertaMonitorLogisticaDetails, AD.RequestParameters);
                        //Limpiar los parametros
                        AD.RequestParameters.Clear();
                    }


                    //Guardar loso folios generados
                    Folios += folioML + ",";

                    //Registrar movimiento en bitacora
                    AD.RequestParameters.Clear();
                    AD.RequestParameters.Add("folio", folioML);
                    AD.RequestParameters.Add("descripcion", "Se ha creado el monitor de logística: " + folioML);
                    AD.RequestParameters.Add("usuario", Usuario);
                    AD.RequestParameters.Add("tabla", Tabla);


                    string Revision = Logic.GlobalProcedure(AD.GCInsertaBitacora, AD.RequestParameters);
                    //Insertar historial de bitacora
                    //JArray RevisionResult = JArray.Parse(Revision);


                    //foreach (var item in linea.Value)
                    //{
                    //    //Agregar el folio a los parametros
                    //    AD.RequestParameters.Add("folio", folioML);
                    //    //Agregar revision a los parametros
                    //    AD.RequestParameters.Add("revision", RevisionResult[0]["Revision"].ToString());
                    //    //Agregar resto de parametros de consulta
                    //    foreach (var ProduccionLine in item.Properties())
                    //    {
                    //        AD.RequestParameters.Add(ProduccionLine.Name, ProduccionLine.Value.ToString());
                    //    }
                    //    //Eliminar parametros inecesarios para este caso
                    //    AD.RequestParameters.Remove("Folio");
                    //    AD.RequestParameters.Remove("Generada");
                    //    AD.RequestParameters.Remove("Estatus");
                    //    //INSERTAR EL HISTORIAL DE REVISION
                    //    string lineaPPH = Logic.GlobalProcedure(AD.GCInsertarPlanProduccionHistorial, AD.RequestParameters);

                    //    //Limpiar los parametros
                    //    AD.RequestParameters.Clear();
                    //}
                }

                //Obtener las ordenes de venta pendientes
                //AD.RequestParameters.Clear();
                //AD.RequestParameters.Add("PlanProduccion", null);
                //string OVP = Logic.GlobalProcedure(AD.GCGetOrdenesFabricacionPendientes, AD.RequestParameters);

                ////Generar las ordenes de fabricacion y guardar el resultado correspondiente
                //JArray OF = JArray.Parse(OVP);
                //foreach (JObject item in OF)
                //{
                //    AD.RequestParameters = Logic.GenerarOF(item);
                //    Logic.GlobalProcedure(AD.GCUpdatePlanProduccionDetails, AD.RequestParameters);
                //}
                ////Lista final del plan de producción creado
                //AD.RequestParameters.Clear();
                ////remover el último carácter de una cadena en C# solo si es una coma (,),
                //if (!string.IsNullOrEmpty(Folios) && Folios.EndsWith(","))
                //{
                //    Folios = Folios.Substring(0, Folios.Length - 1);
                //}
                //AD.RequestParameters.Add("folios", Folios);
                //string FLOVP = Logic.GlobalProcedure(AD.GCGetResultPlanProduccion, AD.RequestParameters);

                //OK
                var Result = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de folio obtenidos correctamente.", Data = string.Empty, ExtraData = string.Empty });
                Result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return Result;

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible generar las ordenes de fabricación " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }
        //fecha_entrega de ir en formato yyyy/mm/dd o genera un error en el store
        public JsonResult GetPedidosParaEntregas(string fecha_entrega, string usuario)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
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

                List<AccesoDatos.MonitorLogistica> PedidosEntregas = new List<AccesoDatos.MonitorLogistica>();
                string connectionString = string.Empty;

                string reporte = Logic.GlobalProcedure(AD.GCGetPedidosParaEntregas, AD.RequestParameters);
                PedidosEntregas = JsonConvert.DeserializeObject<List<AccesoDatos.MonitorLogistica>>(reporte);
                TotalRegistros = PedidosEntregas.Count();

                if (FiltroBusqueda != string.Empty)
                    PedidosEntregas = PedidosEntregas.Where(e => string.Concat(e.FechaPedido, e.FechaSolicitudProduccion, e.FechaOriginalEntrega, e.FechaEntrega, e.Pedido, e.CodigoCliente, e.Cliente, e.HoraEntrega, e.Articulo, e.CantidadMetros, e.PiezasEntrega, e.HorarioCita, e.Cotejado, e.Comentarios).Contains(FiltroBusqueda)).ToList();
                //Total de registros filtrados
                int totalRegistrosFiltrados = PedidosEntregas.Count();
                //Resultado final de busqueda
                PedidosEntregas = PedidosEntregas.Skip(OmitirRegistros).Take(CantidadRegistros).ToList();

                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("usuario", usuario);

                string CPP = Logic.GlobalProcedure(AD.GCGetConfiguracionCML, AD.RequestParameters);


                //retornamos en JSON la data obtenida
                var EncuestasFiltradas = Json(new
                {
                    draw = NroPeticion,
                    recordsTotal = TotalRegistros,
                    recordsFiltered = totalRegistrosFiltrados,
                    data = PedidosEntregas,
                    configCol = CPP
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

        /// <summary>
        /// Inserta o Actualiza la configuracion de columnas para la consulta de el plan de produccion
        /// ademas de insertar la configuracion si no existe y si existe la actualiza
        /// </summary>
        /// <param name="usuario"></param>
        /// <returns></returns>
        public JsonResult InsertaConfigxUsuarioML(string usuario, string configuracion)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();

                //Si contiene configuracion de las columnas
                if (configuracion != null && configuracion != "{}")
                {
                    //Agregar usuario
                    AD.RequestParameters.Add("usuario", usuario);
                    //Agregar orden
                    AD.RequestParameters.Add("configuracion", configuracion);

                    //JObject config = JObject.Parse(configuracion);

                    // Agregar el resto de los parámetros de consulta
                    //foreach (var column in config)
                    //{
                    //    // column.Key es el nombre de la propiedad
                    //    string key = column.Key;

                    //    // Convierte el valor a string, suponiendo que column.Value es el valor que deseas como parámetro
                    //    string value = column.Value.ToString();

                    //    AD.RequestParameters.Add(key, value);
                    //}
                }
                string CPP = Logic.GlobalProcedure(AD.GCInsertaConfiguracionML, AD.RequestParameters);
                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (CPP.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = CPP });
                }
                //No existe información
                else if (CPP.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente al usuario: " + string.Empty + "." });
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
                string msg = "No es posible guardar la información del monitor de logística " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult InsertaConfigxUsuarioCML(string usuario, string configuracion)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();

                //Si contiene configuracion de las columnas
                if (configuracion != null && configuracion != "{}")
                {
                    //Agregar usuario
                    AD.RequestParameters.Add("usuario", usuario);
                    //Agregar orden
                    AD.RequestParameters.Add("configuracion", configuracion);

                    //JObject config = JObject.Parse(configuracion);

                    // Agregar el resto de los parámetros de consulta
                    //foreach (var column in config)
                    //{
                    //    // column.Key es el nombre de la propiedad
                    //    string key = column.Key;

                    //    // Convierte el valor a string, suponiendo que column.Value es el valor que deseas como parámetro
                    //    string value = column.Value.ToString();

                    //    AD.RequestParameters.Add(key, value);
                    //}
                }
                string CPP = Logic.GlobalProcedure(AD.GCInsertaConfiguracionCML, AD.RequestParameters);
                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (CPP.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = CPP });
                }
                //No existe información
                else if (CPP.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente al usuario: " + string.Empty + "." });
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
                string msg = "No es posible guardar la información del monitor de logística " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult UpdateMonitor(string Monitor)
        {

            try
            {
                //Insertar el plan de produccion
                string Folios = string.Empty;
                AD.RequestParameters = new Dictionary<string, string>();
                //Folio generado finalmente
                dynamic MonitorData = JsonConvert.DeserializeObject<dynamic>(Monitor);

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Code", "Compras");
                string correos = Logic.GlobalProcedure(AD.GCGetEmailAuth, AD.RequestParameters);


                foreach (var linea in MonitorData)
                {
                    AD.RequestParameters.Clear();
                    AD.RequestParameters.Add("DocEntry", linea["DocEntry"].ToString());
                    AD.RequestParameters.Add("EstatusCarga", linea["EstatusCarga"].ToString());
                    AD.RequestParameters.Add("TipoReparto", linea["TipoReparto"].ToString());
                    AD.RequestParameters.Add("FechaOriginalEntrega", linea["FechaOriginalEntrega"].ToString());
                    AD.RequestParameters.Add("EstatusReparto", linea["EstatusReparto"].ToString());


                    string Revision = Logic.GlobalProcedure(AD.GCUpdateMonitorLogisticaDetails, AD.RequestParameters);

                    if (Revision.Contains("Error"))
                    {
                        return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = Revision });
                    }
                    //No existe información
                    else if (Revision.Contains("[]"))
                    {
                        return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No fue posible actualizar" });
                    }
                    else if (!string.IsNullOrWhiteSpace(Revision))
                    {
                        try
                        {
                            var infoCorreo = JsonConvert.DeserializeObject(Revision);

                            Console.WriteLine(infoCorreo);
                        }
                        catch (JsonException ex)
                        {
                            return Json(new AccesoDatos.JsonResponse
                            {
                                Status = "ERROR",
                                Message = "Error al procesar el JSON",
                                ExtraData = ex.Message // Opcional: enviar detalles del error
                            });
                        }
                    }


                }

                //OK
                var Result = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de folio obtenidos correctamente.", Data = string.Empty, ExtraData = string.Empty });
                Result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return Result;

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible generar las ordenes de fabricación " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        //public JsonResult SendEmailNewAct(string idAct)
        //{
        //    try
        //    {
        //        //Se trae la info del ultimo movimiento para enviar por correo
        //        AD.RequestParameters = new Dictionary<string, string>
        //        {
        //            { "Id_Producto",idAct },
        //        };

        //        string result = Logic.GlobalProcedure(AD.GCGetActivo, AD.RequestParameters);
        //        List<Producto> producto = JsonConvert.DeserializeObject<List<Producto>>(result);




        //        string bodyCorreo = $@"
        //                        <!DOCTYPE html>
        //                        <html lang=""en"">
        //                        <head>
        //                            <meta charset=""UTF-8"">
        //                            <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
        //                            <title>Alta de activo</title>
        //                            <style>
        //                                body {{
        //                                    font-family: Arial, sans-serif;
        //                                    margin: 0;
        //                                    padding: 0;
        //                                    background-color: #f4f4f4;
        //                                }}
        //                                .container {{
        //                                    max-width: 600px;
        //                                    margin: 20px auto;
        //                                    background: #ffffff;
        //                                    border-radius: 8px;
        //                                    overflow: hidden;
        //                                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        //                                }}

        //                                .header {{
        //                                    background-color: #354152;
        //                                    color: white;
        //                                    text-align: center;
        //                                    height: 90px;
        //                                }}
        //                                .header h1 {{
        //                                    margin: 0;
        //                                    padding: 15px 0;
        //                                }}
        //                                .content {{
        //                                    padding: 20px;
        //                                    text-align: center;
        //                                }}
        //                                .info {{
        //                                    display: table;
        //                                    width: 100%;
        //                                    margin-bottom: 20px;
        //                                    table-layout: fixed;
        //                                }}
        //                                .info img {{
        //                                    max-width: 100%;
        //                                    height: auto;
        //                                }}
        //                                .info td {{
        //                                    padding: 10px;
        //                                    vertical-align: top;
        //                                }}
        //                                .footer {{
        //                                    background-color: #354152;
        //                                    color: #f0f1f2;
        //                                    text-align: center;
        //                                    padding: 10px;
        //                                    font-size: 12px;
        //                                }}
        //                                .footer a {{
        //                                    text-decoration: none;
        //                                    color: #f0f1f2;
        //                                }}
        //                            </style>
        //                        </head>
        //                        <body>
        //                            <table class=""container"" cellpadding=""0"" cellspacing=""0"" width=""100%"">
        //                                <tr>
        //                                    <td class=""header"" align=""center"">
        //                                        <h1>Detalles del Activo</h1>
        //                                    </td>
        //                                </tr>
        //                                <tr>
        //                                    <td class=""content"">
        //                                        <table class=""info"" cellpadding=""0"" cellspacing=""0"">
        //                                            <tr>
        //                                                <td style=""width: 40%; align-content: center; text-align: center; border-right: 1px solid rgb(90, 88, 88);"">
        //                                                    <img src='cid:imgAct' style='width: 100%;' alt=""Activo"">
        //                                                </td>
        //                                                <td style=""width: 60%; vertical-align: top; text-align: left;"">
        //                                                    <p><strong>ID Activo:</strong> {producto[0].Id_Producto}</p>
        //                                                    <p><strong>Nombre Activo:</strong> {producto[0].Nombre}</p>
        //                                                    <p><strong>Descripción:</strong> {producto[0].Descripcion} &nbsp; </p>
        //                                                    <p><strong>Alta por usuario:</strong> {Session["Usuario"]} </p>
        //                                                    <p><strong><strong>Correo Usuario: </strong> {Session["Correo"]}</p>
        //                                                    <p><strong>Serie Fabricacion:</strong> {producto[0].SerieFabrica} </p>
        //                                                    <p><strong>Sello Interno:</strong> {producto[0].SelloInterno} </p>
        //                                                    <p><strong>Estado:</strong> {producto[0].Estado} </p>
        //                                                    <p><strong>Ubicacion Actual:</strong> {producto[0].UbicacionAct}</p>
        //                                                </td>
        //                                            </tr>
        //                                        </table>
        //                                    </td>
        //                                </tr>
        //                                <tr>
        //                                    <td class=""footer"">
        //                                        <p>Este es un correo generado automáticamente. Si tienes alguna duda, por favor
        //                                        <strong>
        //                                            <a href=""mailto:{Environment.GetEnvironmentVariable("SMTP_USER")}"">contáctanos</a>.
        //                                        </strong></p>
        //                                    </td>
        //                                </tr>
        //                            </table>
        //                        </body>
        //                        </html>";


        //        EmailRequest email = new EmailRequest();
        //        email.To = "";
        //        email.Subject = "Alta de activo";
        //        email.IsHtml = true;
        //        email.Body = bodyCorreo;

        //        Global.SendEmails(email, "~/" + producto[0].FotoActivo);

        //        var datos = Json(new
        //        {
        //            Status = "OK",
        //            Data = "[]",
        //        }, JsonRequestBehavior.AllowGet);

        //        return datos;
        //    }
        //    catch (Exception ex)
        //    {
        //        string MethodName = MethodBase.GetCurrentMethod().Name;
        //        string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
        //        string msg = "No es posible insertar el movimiento " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
        //        string finalmessage = AD.Excepcion(ex, msg).ToString();
        //        return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
        //    }
        //}


        #endregion

        #region ConsultaMonitorLogistica
        public JsonResult GetMonitoresLogistica()
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

                List<AccesoDatos.Monitores> PP = new List<AccesoDatos.Monitores>();
                string connectionString = string.Empty;

                string reporte = Logic.GlobalProcedure(AD.GCGetMonitoresLogistica, AD.RequestParameters);
                PP = JsonConvert.DeserializeObject<List<AccesoDatos.Monitores>>(reporte);
                TotalRegistros = PP.Count();

                if (FiltroBusqueda != string.Empty)
                    PP = PP.Where(e => string.Concat(e.Folio, e.EstatusCarga, e.TipoReparto, e.FechaPedido, e.FechaSolicitudProduccion, e.Cliente, e.Comentarios).Contains(FiltroBusqueda)).ToList();
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
                string msg = "No es posible obtener la lista de monitores de logística " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetMonitorLogisticaDetails(string folio, string usuario, string tabla)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                //Configuracion del monitor de logistica por usuario
                AD.RequestParameters.Add("usuario", usuario);
                string CXUML = Logic.GlobalProcedure(AD.GCGetConfiguracionML, AD.RequestParameters);

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", folio);
                AD.RequestParameters.Add("usuario", usuario);
                AD.RequestParameters.Add("tabla", tabla);
                string MLD = Logic.GlobalProcedure(AD.GCGetMonitorLogisticaDetails, AD.RequestParameters);
                string MLDH = Logic.GlobalProcedure(AD.GetBitacoraHeaderDetails, AD.RequestParameters);


                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (MLD.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = MLD });
                }
                //No existe información
                else if (MLD.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente al plan: " + folio + "." });
                }
                //OK
                var result = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de plan obtenidos correctamente.", Data = MLD, ExtraData = MLDH, Other = CXUML });
                result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return result;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener los detalles del monitor de logística " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        /// <summary>
        /// Obtiene la configuracion de columnas para la consulta de el plan de produccion
        /// </summary>
        /// <param name="usuario"></param>
        /// <returns></returns>
        public JsonResult GetConfigxUsuarioML(string usuario, string configuracion)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("usuario", usuario);

                //Si contiene configuracion de las columnas
                if (configuracion != null && configuracion != "{}")
                {
                    JObject config = JObject.Parse(configuracion);

                    // Agregar el resto de los parámetros de consulta
                    foreach (var column in config)
                    {
                        // column.Key es el nombre de la propiedad
                        string key = column.Key;

                        // Convierte el valor a string, suponiendo que column.Value es el valor que deseas como parámetro
                        string value = column.Value.ToString();

                        AD.RequestParameters.Add(key, value);
                    }
                }
                string CPP = Logic.GlobalProcedure(AD.GCGetConfiguracionML, AD.RequestParameters);
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
                string msg = "No es posible obtener la configuración de el monitor de logística " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetConfigxUsuarioCML(string usuario, string configuracion)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("usuario", usuario);

                //Si contiene configuracion de las columnas
                if (configuracion != null && configuracion != "{}")
                {
                    JObject config = JObject.Parse(configuracion);

                    // Agregar el resto de los parámetros de consulta
                    foreach (var column in config)
                    {
                        // column.Key es el nombre de la propiedad
                        string key = column.Key;

                        // Convierte el valor a string, suponiendo que column.Value es el valor que deseas como parámetro
                        string value = column.Value.ToString();

                        AD.RequestParameters.Add(key, value);
                    }
                }
                string CPP = Logic.GlobalProcedure(AD.GCGetConfiguracionCML, AD.RequestParameters);
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
                string msg = "No es posible obtener la configuración de el monitor de logística " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }
        #endregion
    }
}
