using DocumentFormat.OpenXml.Drawing.Charts;
using DocumentFormat.OpenXml.Office2010.Excel;
using DocumentFormat.OpenXml.Wordprocessing;
using Fisfiber.Hubs;
using Fisfiber.Models;
using log4net;
using Microsoft.AspNet.SignalR;
using Microsoft.SqlServer.Server;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Drawing.Drawing2D;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Threading.Tasks;
using System.Web.Mvc;
using System.Web.UI.WebControls;

namespace Fisfiber.Controllers
{
    public class PlanProduccionController : Controller
    {
        Logica Logic = new Logica();
        AccesoDatos AD = new AccesoDatos();
        private static readonly ILog log = LogManager.GetLogger(typeof(ProduccionController));

        #region VIEWS
        // GET: PlanProduccion
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult HojaEspecificaciones()
        {
            return View();
        }
        public ActionResult ConsultaEdicion()
        {
            string CodeISO = IniConfigManager.LeerValor("PlanPro_CodeISO", "Valor");
            string Nivel = IniConfigManager.LeerValor("PlanPro_Nivel", "Valor");
            string FechaRev = IniConfigManager.LeerValor("PlanPro_FechaRevision", "Valor");
            string Revision = IniConfigManager.LeerValor("PlanPro_Revision", "Valor");
            string FechaLib = IniConfigManager.LeerValor("PlanPro_FechaLiberacion", "Valor");

            ViewBag.CodeISO = CodeISO;
            ViewBag.Nivel = Nivel;
            ViewBag.FechaRev = FechaRev;
            ViewBag.FechaLib = FechaLib;
            ViewBag.Revision = Revision;

            return View();
        }
        public ActionResult Reportes()
        {
            return View();
        }
        public ActionResult ReporteOFconOV()
        {
            return View();
        }


        #endregion

        #region CreacionPP
        public JsonResult GetOrdenesVenta(
            string FI, string FF, string Series,
            string email, string DocEntrys, string Lineas,
            string FolioFamilia, string NumFamilias
            )
        {
            try
            {
                //Parametros de fecha
                AD.RequestParameters = new Dictionary<string, string>
                {
                    { "FI", (FI == string.Empty ? null : FI) },
                    { "FF", (FF == string.Empty ? null : FF) },
                    { "Series", (Series == string.Empty ? null : Series) },
                    { "usuario", email },
                    { "DocEntry", (DocEntrys == string.Empty ? null : DocEntrys) },
                    { "Lineas", (Lineas == string.Empty ? null : Lineas) },
                    { "FolioFamilia", (FolioFamilia == string.Empty ? null : FolioFamilia) },
                    { "NumFamilias", (NumFamilias == string.Empty ? null : NumFamilias) }
                };

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
                //Tabla general de Medicos con funciones de busqueda
                //IQueryable<EncuestaRecibimientoV4> BusquedaEncuestas = db.EncuestaRecibimientoV4;
                //Total de registros antes de filtrar
                //int TotalRegistros = BusquedaEncuestas.Count();

                //List<AccesoDatos.Documentos> OC = new List<AccesoDatos.Documentos>();
                string connectionString = string.Empty;

                string reporte = Logic.GlobalProcedure(AD.GCOrdenesVenta, AD.RequestParameters);
                /// SI SE DESEA MANTENER EL ORDEN DE LAS COLUMNAS DESDE SQL UTILIZAR UN DICTIONARY
                var OC = JsonConvert.DeserializeObject<List<Dictionary<string, object>>>(reporte);
                //OC = JsonConvert.DeserializeObject<List<AccesoDatos.Documentos>>(reporte);



                TotalRegistros = OC.Count();

                //Cuando se consulta solo los entris
                if (!string.IsNullOrEmpty(DocEntrys))
                {
                    var ListDocEntrys = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de orden obtenidos correctamente.", Data = OC }, JsonRequestBehavior.AllowGet);
                    ListDocEntrys.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                    return ListDocEntrys;
                }



                if (!string.IsNullOrEmpty(FiltroBusqueda))
                {
                    OC = OC.Where(e => e.Values
                        .Where(v => v != null) // Ignorar valores nulos
                        .Any(v => v.ToString().IndexOf(FiltroBusqueda, StringComparison.OrdinalIgnoreCase) >= 0))
                        .ToList();
                }
                //Total de registros filtrados
                int totalRegistrosFiltrados = OC.Count();
                //Resultado final de busqueda
                OC = OC.Skip(OmitirRegistros).Take(CantidadRegistros).ToList();

                //retornamos en JSON la data obtenida
                var EncuestasFiltradas = Json(new
                {
                    draw = NroPeticion,
                    recordsTotal = TotalRegistros,
                    recordsFiltered = totalRegistrosFiltrados,
                    data = OC
                }, JsonRequestBehavior.AllowGet);

                EncuestasFiltradas.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return EncuestasFiltradas;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de OC " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetOrdenesOF(
          string FI, string FF, string Series,
          string email, string DocEntrys, string Lineas,
          string FolioFamilia, string NumFamilias
          )
        {
            try
            {
                //Parametros de fecha
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("FI", (FI == string.Empty ? null : FI));
                AD.RequestParameters.Add("FF", (FF == string.Empty ? null : FF));
                AD.RequestParameters.Add("Series", (Series == string.Empty ? null : Series));
                AD.RequestParameters.Add("usuario", email);
                AD.RequestParameters.Add("DocEntry", (DocEntrys == string.Empty ? null : DocEntrys));
                AD.RequestParameters.Add("Lineas", (Lineas == string.Empty ? null : Lineas));
                AD.RequestParameters.Add("FolioFamilia", (FolioFamilia == string.Empty ? null : FolioFamilia));
                AD.RequestParameters.Add("NumFamilias", (NumFamilias == string.Empty ? null : NumFamilias));

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
                //Tabla general de Medicos con funciones de busqueda
                //IQueryable<EncuestaRecibimientoV4> BusquedaEncuestas = db.EncuestaRecibimientoV4;
                //Total de registros antes de filtrar
                //int TotalRegistros = BusquedaEncuestas.Count();

                //List<AccesoDatos.Documentos> OC = new List<AccesoDatos.Documentos>();
                string connectionString = string.Empty;

                string reporte = Logic.GlobalProcedure(AD.GCOrdenesFabricacionE, AD.RequestParameters);
                /// SI SE DESEA MANTENER EL ORDEN DE LAS COLUMNAS DESDE SQL UTILIZAR UN DICTIONARY
                var OC = JsonConvert.DeserializeObject<List<Dictionary<string, object>>>(reporte);
                //OC = JsonConvert.DeserializeObject<List<AccesoDatos.Documentos>>(reporte);



                TotalRegistros = OC.Count();

                //Cuando se consulta solo los entris
                if (!string.IsNullOrEmpty(DocEntrys))
                {
                    var ListDocEntrys = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de orden obtenidos correctamente.", Data = OC }, JsonRequestBehavior.AllowGet);
                    ListDocEntrys.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                    return ListDocEntrys;
                }



                if (!string.IsNullOrEmpty(FiltroBusqueda))
                {
                    OC = OC.Where(e => e.Values
                        .Where(v => v != null) // Ignorar valores nulos
                        .Any(v => v.ToString().IndexOf(FiltroBusqueda, StringComparison.OrdinalIgnoreCase) >= 0))
                        .ToList();
                }
                //Total de registros filtrados
                int totalRegistrosFiltrados = OC.Count();
                //Resultado final de busqueda
                OC = OC.Skip(OmitirRegistros).Take(CantidadRegistros).ToList();

                //retornamos en JSON la data obtenida
                var EncuestasFiltradas = Json(new
                {
                    draw = NroPeticion,
                    recordsTotal = TotalRegistros,
                    recordsFiltered = totalRegistrosFiltrados,
                    data = OC
                }, JsonRequestBehavior.AllowGet);

                EncuestasFiltradas.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return EncuestasFiltradas;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de OC " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();

                log.Error($"{finalmessage} - {E.Message}", E);


                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }


        public JsonResult GetOrdenesVentaOF(
          string FI, string FF, string OV,
          string OF, string EstatusOF, string EstatusOV
          )
        {
            try
            {
                //Parametros de fecha
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("FI", (FI == string.Empty ? null : FI));
                AD.RequestParameters.Add("FF", (FF == string.Empty ? null : FF));
                AD.RequestParameters.Add("OV", (OV == string.Empty ? null : OV));
                AD.RequestParameters.Add("OF", (OF == string.Empty ? null : OF));
                AD.RequestParameters.Add("EstatusOV", (EstatusOV == string.Empty ? null : EstatusOV));
                AD.RequestParameters.Add("EstatusOF", (EstatusOF == string.Empty ? null : EstatusOF));


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
                //Tabla general de Medicos con funciones de busqueda
                //IQueryable<EncuestaRecibimientoV4> BusquedaEncuestas = db.EncuestaRecibimientoV4;
                //Total de registros antes de filtrar
                //int TotalRegistros = BusquedaEncuestas.Count();

                //List<AccesoDatos.Documentos> OC = new List<AccesoDatos.Documentos>();
                string connectionString = string.Empty;

                string reporte = Logic.GlobalProcedure(AD.GCOrdenesVentaOF, AD.RequestParameters);
                /// SI SE DESEA MANTENER EL ORDEN DE LAS COLUMNAS DESDE SQL UTILIZAR UN DICTIONARY
                var OC = JsonConvert.DeserializeObject<List<Dictionary<string, object>>>(reporte);
                //OC = JsonConvert.DeserializeObject<List<AccesoDatos.Documentos>>(reporte);



                TotalRegistros = OC.Count();

                if (!string.IsNullOrEmpty(FiltroBusqueda))
                {
                    OC = OC.Where(e => e.Values
                        .Where(v => v != null) // Ignorar valores nulos
                        .Any(v => v.ToString().IndexOf(FiltroBusqueda, StringComparison.OrdinalIgnoreCase) >= 0))
                        .ToList();
                }
                //Total de registros filtrados
                int totalRegistrosFiltrados = OC.Count();
                //Resultado final de busqueda
                OC = OC.Skip(OmitirRegistros).Take(CantidadRegistros).ToList();

                //retornamos en JSON la data obtenida
                var EncuestasFiltradas = Json(new
                {
                    draw = NroPeticion,
                    recordsTotal = TotalRegistros,
                    recordsFiltered = totalRegistrosFiltrados,
                    data = OC
                }, JsonRequestBehavior.AllowGet);

                EncuestasFiltradas.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return EncuestasFiltradas;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de OC " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();

                log.Error($"{finalmessage} - {E.Message}", E);


                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetItemsByOV(string DocEntrys)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("DocEntrys", DocEntrys);
                string details = Logic.GlobalProcedure(AD.GCGetItemsByOV, AD.RequestParameters);
                // Validación del los datos
                if (details.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = details });
                }
                //No existe información
                else if (details.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente la OV: " + DocEntrys + "." });
                }
                //OK
                //retornamos en JSON la data obtenida
                var EncuestasFiltradas = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de orden obtenidos correctamente.", Data = details }, JsonRequestBehavior.AllowGet);
                EncuestasFiltradas.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return EncuestasFiltradas;

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener los detalles de la OV " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();

                log.Error($"{finalmessage} - {E.Message}", E);


                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }
        public JsonResult CheckTimeOV(string DocEntry)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("DocEntry", DocEntry);
                string details = Logic.GlobalProcedure(AD.GCCheckTimeOV, AD.RequestParameters);
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
                //retornamos en JSON la data obtenida
                var EncuestasFiltradas = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de orden obtenidos correctamente.", Data = details }, JsonRequestBehavior.AllowGet);
                EncuestasFiltradas.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return EncuestasFiltradas;

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener los detalles de la OV " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();

                log.Error($"{finalmessage} - {E.Message}", E);


                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }
        //Generar las ordenes de fabricacion
        public async Task<JsonResult> GenerarOF(string PlanProduccion, string PreviewFolio, string Usuario, string Tabla)
        {
            string Folios = string.Empty;
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                dynamic PlanProduccionData = JsonConvert.DeserializeObject<dynamic>(PlanProduccion);

                log.Info($"Inicio [Creación de plan de producción] - Usuario: {Usuario}, Tabla: {Tabla}, PreviewFolio: {PreviewFolio}, PlanProduccion: {PlanProduccion}");

                foreach (var linea in PlanProduccionData)
                {
                    log.Info($"[Creación de plan de producción] Procesando línea: {linea.Name}");
                    AD.RequestParameters.Add("linea", linea.Name);
                    string folioPP = Logic.GlobalProcedureSigleR(AD.GCInsertaPlanProduccion, AD.RequestParameters);
                    log.Info($"[Creación de plan de producción] Folio generado: {folioPP}");

                    if (folioPP.Contains("Error"))
                    {
                        log.Error($"[Creación de plan de producción] Error al generar folio: {folioPP}");
                        return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = folioPP });
                    }
                    else if (folioPP.Contains("[]"))
                    {
                        log.Warn($"[Creación de plan de producción] Folio vacío o inválido para línea: {linea.Name}");
                        return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No fue posible generar el folio para el plan de producción." });
                    }

                    AD.RequestParameters.Clear();
                    foreach (var item in linea.Value)
                    {
                        AD.RequestParameters.Add("folio", folioPP);
                        AD.RequestParameters.Add("EstatusProduccion", string.Empty);

                        foreach (var ProduccionLine in item.Properties())
                        {
                            AD.RequestParameters.Add(ProduccionLine.Name, ProduccionLine.Value.ToString());
                        }

                        AD.RequestParameters.Remove("Folio");
                        AD.RequestParameters.Remove("Generada");
                        AD.RequestParameters.Remove("Estatus");

                        log.Debug($"[Creación de plan de producción] Validando si el pedido: {AD.RequestParameters["Pedido"]} con DocEntry: {AD.RequestParameters["DocEntry"]} ya esta registrado.");
                        string PedidoDuplicado = string.Empty;
                        Dictionary<string, string> PD = new Dictionary<string, string>
                        {
                            { "Pedido", AD.RequestParameters["Pedido"] },
                            { "DocEntry", AD.RequestParameters["DocEntry"] }
                        };
                        PedidoDuplicado = Logic.GlobalProcedure(AD.GCExisteRegistroPP, PD);
                        JArray RPD = JArray.Parse(PedidoDuplicado.ToString());
                        //Si no existe ya el pedido en las tablas
                        if (RPD[0]["Existe"].ToString() == "0")
                        {
                            string lineaPP = Logic.GlobalProcedure(AD.GCInsertarPlanProduccionDetails, AD.RequestParameters);
                            log.Debug($"[Creación de plan de producción] Detalle insertado para folio {folioPP}: {lineaPP}");
                        }
                        else
                        {
                            log.Debug($"[Creación de plan de producción] El pedido: {AD.RequestParameters["Pedido"]} con DocEntry {AD.RequestParameters["DocEntry"]} ya existe.");
                        }

                        AD.RequestParameters.Clear();
                    }

                    Folios += folioPP + ",";

                    AD.RequestParameters.Clear();
                    AD.RequestParameters.Add("folio", folioPP);
                    AD.RequestParameters.Add("descripcion", $"Se ha creado el plan de producción: {folioPP}");
                    AD.RequestParameters.Add("usuario", Usuario);
                    AD.RequestParameters.Add("tabla", Tabla);

                    string Revision = Logic.GlobalProcedureSigleR(AD.GCInsertaBitacora, AD.RequestParameters);
                    log.Info($"[Creación de plan de producción] Bitácora registrada con revisión: {Revision} para folio: {folioPP}");

                    AD.RequestParameters.Clear();

                    foreach (var item in linea.Value)
                    {
                        AD.RequestParameters.Add("folio", folioPP);
                        AD.RequestParameters.Add("revision", Revision);

                        foreach (var ProduccionLine in item.Properties())
                        {
                            AD.RequestParameters.Add(ProduccionLine.Name, ProduccionLine.Value.ToString());
                        }

                        AD.RequestParameters.Remove("Folio");
                        AD.RequestParameters.Remove("Generada");
                        AD.RequestParameters.Remove("Estatus");

                        string lineaPPH = Logic.GlobalProcedure(AD.GCInsertarPlanProduccionHistorial, AD.RequestParameters);
                        log.Debug($"[Creación de plan de producción] Historial insertado para folio {folioPP}: {lineaPPH}");

                        AD.RequestParameters.Clear();
                    }
                }


                log.Info($"[Creación de plan de producción] Generando OF desde API REST, LOG EN API REST: {AD.URLAPIPDX}");

                if (!string.IsNullOrEmpty(Folios) && Folios.EndsWith(","))
                {
                    Folios = Folios.Substring(0, Folios.Length - 1);
                }
                try
                {
                    // En tu Controller, usa using para asegurar la liberación de recursos
                    int TimeOutWebApiConnect = int.Parse(ConfigurationManager.AppSettings["TimeOutWebApiConnect"].ToString());

                    HttpClient httpClientWebApi = new HttpClient
                    {
                        Timeout = TimeSpan.FromMinutes(TimeOutWebApiConnect) // ⏱️ Tiempo de espera de 2 minutos
                    };

                    // Crear contenido como application/x-www-form-urlencoded
                    var contenido = new FormUrlEncodedContent(new[]
                    {
                    new KeyValuePair<string, string>("PlanProduccion", Folios)
                });

                    // Realizar la petición POST
                    HttpResponseMessage response = await httpClientWebApi.PostAsync(AD.URLAPIPDX + "WebApp/GenerarOF", contenido);

                    string resultado = await response.Content.ReadAsStringAsync();
                }
                catch (Exception E)
                {
                    string message = AD.Excepcion(E, string.Empty).ToString();
                    log.Error($"[Creación de plan de producción ERROR] no se obtuvo respuesta del servidor de SAP desde el API REST: {message}");

                    AD.RequestParameters.Clear();
                    AD.RequestParameters.Add("PlanProduccion", Folios);
                    string OVP = Logic.GlobalProcedure(AD.GCGetOrdenesFabricacionPendientes, AD.RequestParameters);
                    JArray OF = JArray.Parse(OVP);
                    foreach (JObject item in OF)
                    {

                        AD.RequestParameters = new Dictionary<string, string>
                        {
                            {"id", item["id"].ToString()},
                            {"StatusSap", "No es posible conectar con sap para generar las ordenes de fabricación."},
                            {"DocNumOF", ""},
                            {"DocEntryOF", ""},
                            {"StatusProduccion", "1"},
                            {"Orden", "-1"}
                        };

                        Logic.GlobalProcedure(AD.GCUpdatePlanProduccionDetails, AD.RequestParameters);

                        AD.RequestParameters.Clear();
                    }
                }

                AD.RequestParameters.Add("folios", Folios);
                string FLOVP = Logic.GlobalProcedure(AD.GCGetResultPlanProduccion, AD.RequestParameters);
                string DRPP = Logic.GlobalProcedure(AD.GCDeleteResultPlanProduccion, AD.RequestParameters);
                string UniPPLD = Logic.GlobalProcedure(AD.GCUnificarPlanes, AD.RequestParameters);
                var UPPLD = JsonConvert.DeserializeObject(UniPPLD);

                log.Info($"[Creación de plan de producción] Planes de producción procesados correctamente. Folios: {Folios}");

                var Result = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Detalles de folio obtenidos correctamente.",
                    Data = FLOVP,
                    ExtraData = null,
                });
                Result.MaxJsonLength = 2147483644;
                return Result;
            }
            catch (Exception E)
            {
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = $"ERROR en método {MethodName} del controlador {ControllerName}";
                string finalmessage = AD.Excepcion(E, msg).ToString();

                log.Error($"[Creación de plan de producción ERROR] {finalmessage} - {E.Message}", E);

                AD.RequestParameters.Add("folios", Folios);
                string DRPP = Logic.GlobalProcedure(AD.GCDeleteResultPlanProduccion, AD.RequestParameters);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }
        //Agregar of a un plan existente. "OF sin apertura"
        public async Task<JsonResult> ModifyOF(string PlanProduccion, string LineaOriginal, string PreviewFolio, string Usuario, string Tabla)
        {
            //Modificar el plan de produccion
            string Folios = string.Empty;

            try
            {
                log.Info($"Inicio [Agregar OF Sin Apertura] - LineaOriginal: {LineaOriginal}, Usuario: {Usuario}, Tabla: {Tabla}, PreviewFolio: {PreviewFolio}, PlanProduccion: {PlanProduccion}");

                AD.RequestParameters = new Dictionary<string, string>();
                //Folio generado finalmente
                dynamic PlanProduccionData = JsonConvert.DeserializeObject<dynamic>(PlanProduccion);
                int SameLine = 0;

                // Deserializar como JObject (porque es un objeto)
                var jObject = JsonConvert.DeserializeObject<JObject>(PlanProduccion);

                // Ahora puedes acceder a cada propiedad (001, 006, etc.)
                foreach (var prop in jObject.Properties())
                {
                    if (prop.Name == LineaOriginal)
                    {
                        SameLine++;
                        break;
                    }
                }

                //GENERAR LA CONFIGURACION DE USUARIO SI NO EXISTE
                log.Info($"[Agregar OF Sin Apertura] obteniendo/generando configuración del usuario");
                AD.RequestParameters.Add("usuario", Usuario);
                string CXUPP = Logic.GlobalProcedure(AD.GCGetConfiguracionPP, AD.RequestParameters);

                if (SameLine > 0) //SI se inserto al menos una orden al plan original
                {
                    log.Info($"[Agregar OF Sin Apertura] Registrando movimiento en bitácora");
                    //Registrar movimiento en bitacora
                    AD.RequestParameters.Clear();
                    AD.RequestParameters.Add("folio", PreviewFolio);
                    AD.RequestParameters.Add("descripcion", "Se ha modificado el plan de producción: " + PreviewFolio + " agregando nuevas ordenes de venta.");
                    AD.RequestParameters.Add("usuario", Usuario);
                    AD.RequestParameters.Add("tabla", Tabla);


                    string Revision = Logic.GlobalProcedureSigleR(AD.GCInsertaBitacora, AD.RequestParameters);
                    //Fin Insertar en Bitacora

                    //Guardar los datos del plan de produccion anterior como revision
                    AD.RequestParameters.Clear();
                    AD.RequestParameters = new Dictionary<string, string>
                    {
                        { "folio", PreviewFolio },
                        { "usuario", Usuario },
                        { "Linea", null }
                    };

                    log.Info($"[Agregar OF Sin Apertura] Registrando versión anterior del plan");
                    //string PPA = Logic.GlobalProcedure(AD.GCGetPlanesProduccionDetails, AD.RequestParameters);
                    string PPAH = Logic.GlobalProcedure(AD.GCGetPlanesProduccionDetailsHistorial, AD.RequestParameters);


                    //GUARDAR EL PLAN DE PRODUCCION ANTERIOR
                    AD.RequestParameters.Clear();
                    JArray LineasPPA = JArray.Parse(PPAH);

                    foreach (JObject item in LineasPPA)
                    {
                        //Agregar el numero de revisión  a los parametros
                        AD.RequestParameters.Remove("Revision");
                        AD.RequestParameters.Add("revision", Revision);
                        //Agregar resto de parametros de consulta
                        foreach (var linea in item.Properties())
                        {
                            AD.RequestParameters.Add(linea.Name, linea.Value.ToString());
                        }

                        AD.RequestParameters.Add("Prioridad", "");

                        //Insertar la linea
                        string lineaPPA = Logic.GlobalProcedure(AD.GCInsertarPlanProduccionHistorial, AD.RequestParameters);
                        //Limpiar los parametros
                        AD.RequestParameters.Clear();
                    }
                }

                log.Info($"[Agregar OF Sin Apertura] Actualizando plan de producción.");
                foreach (var linea in PlanProduccionData)
                {

                    //Insertar las lineas del plan de produccion
                    AD.RequestParameters.Clear();

                    foreach (var item in linea.Value)
                    {
                        Folios += PreviewFolio + ",";
                        //Agregar el folio a los parametros
                        AD.RequestParameters.Add("folio", PreviewFolio);
                        //Agregar resto de parametros de consulta
                        foreach (var ProduccionLine in item.Properties())
                        {
                            AD.RequestParameters.Add(ProduccionLine.Name, ProduccionLine.Value.ToString());
                        }

                        //Eliminar parametros inecesarios para este caso
                        AD.RequestParameters.Remove("Folio");
                        AD.RequestParameters.Remove("Generada");
                        AD.RequestParameters.Remove("Estatus");
                        AD.RequestParameters.Remove("NewRow");

                        log.Debug($"[Agregar OF Sin Apertura] Validando si el pedido: {AD.RequestParameters["Pedido"]} con DocEntry: {AD.RequestParameters["DocEntry"]} ya esta registrado.");
                        string PedidoDuplicado = string.Empty;
                        Dictionary<string, string> PD = new Dictionary<string, string>
                        {
                            { "Pedido", AD.RequestParameters["Pedido"] },
                            { "DocEntry", AD.RequestParameters["DocEntry"] }
                        };
                        PedidoDuplicado = Logic.GlobalProcedure(AD.GCExisteRegistroPP, PD);
                        JArray RPD = JArray.Parse(PedidoDuplicado.ToString());
                        //Si no existe ya el pedido en las tablas
                        if (RPD[0]["Existe"].ToString() == "0")
                        {
                            //Insertar la linea
                            string lineaPP = Logic.GlobalProcedure(AD.GCModificaPlanProduccionDetails, AD.RequestParameters);
                            log.Debug($"[Agregar OF Sin Apertura] Detalle insertado para folio {PreviewFolio}: {lineaPP}");
                        }
                        else
                        {
                            log.Debug($"[Agregar OF Sin Apertura] El pedido: {AD.RequestParameters["Pedido"]} con DocEntry {AD.RequestParameters["DocEntry"]} ya existe.");
                        }

                        //Limpiar los parametros
                        AD.RequestParameters.Clear();
                    }

                }

                //Mandar nuevas OF al final del plan
                log.Info($"[Agregar OF Sin Apertura] Generando OF desde API REST, LOG EN API REST: {AD.URLAPIPDX}");
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", PreviewFolio);
                string OrdenarOFs = Logic.GlobalProcedure(AD.GCUpdateOrdenPorFolio, AD.RequestParameters);

                //Generar Orden de Fabricación

                if (!string.IsNullOrEmpty(Folios) && Folios.EndsWith(","))
                {
                    Folios = Folios.Substring(0, Folios.Length - 1);
                }
                try
                {
                    // En tu Controller, usa using para asegurar la liberación de recursos
                    int TimeOutWebApiConnect = int.Parse(ConfigurationManager.AppSettings["TimeOutWebApiConnect"].ToString());
                    HttpClient httpClientWebApi = new HttpClient
                    {
                        Timeout = TimeSpan.FromMinutes(TimeOutWebApiConnect) // ⏱️ Tiempo de espera de 2 minutos
                    };

                    // Crear contenido como application/x-www-form-urlencoded
                    var contenido = new FormUrlEncodedContent(new[]
                    {
                    new KeyValuePair<string, string>("PlanProduccion", Folios)
                });

                    // Realizar la petición POST
                    HttpResponseMessage response = await httpClientWebApi.PostAsync(AD.URLAPIPDX + "WebApp/GenerarOF", contenido);

                    string resultado = await response.Content.ReadAsStringAsync();
                }
                catch (Exception E)
                {
                    string message = AD.Excepcion(E, string.Empty).ToString();
                    log.Error($"[Agregar OF Sin Apertura ERROR] no se obtuvo respuesta del servidor de SAP desde el API REST: {message}");

                    AD.RequestParameters.Clear();
                    AD.RequestParameters.Add("PlanProduccion", Folios);
                    string OVP = Logic.GlobalProcedure(AD.GCGetOrdenesFabricacionPendientes, AD.RequestParameters);
                    JArray OF = JArray.Parse(OVP);
                    foreach (JObject item in OF)
                    {

                        AD.RequestParameters = new Dictionary<string, string>
                        {
                            {"id", item["id"].ToString()},
                            {"StatusSap", "No es posible conectar con sap para generar las ordenes de fabricación."},
                            {"DocNumOF", ""},
                            {"DocEntryOF", ""},
                            {"StatusProduccion", "1"},
                            {"Orden", "-1"}
                        };

                        Logic.GlobalProcedure(AD.GCUpdatePlanProduccionDetails, AD.RequestParameters);

                        AD.RequestParameters.Clear();
                    }
                }
                //Lista final del plan de producción creado
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folios", Folios);
                string FLOVP = Logic.GlobalProcedure(AD.GCGetResultPlanProduccion, AD.RequestParameters);
                string DRPP = Logic.GlobalProcedure(AD.GCDeleteResultPlanProduccion, AD.RequestParameters); //Elimina ordenes no creadas y folios vacios


                //SECCIONAMIENTO DE PLANES
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", PreviewFolio);
                string SeccionamientoPlanes = Logic.GlobalProcedure(AD.GCSpPdxFF_SeccionarPlanes, AD.RequestParameters);

                string jsonS = JsonConvert.SerializeObject(SeccionamientoPlanes);
                //Console.WriteLine(jsonS);
                // Primer paso: Deserializar como string
                var jsonReal = JsonConvert.DeserializeObject<string>(jsonS);

                // Segundo paso: Deserializar el string real a JArray
                var array = JsonConvert.DeserializeObject<JArray>(jsonReal);

                // Ahora puedes hacer GroupBy
                var resultadoByLinea = array
                    .GroupBy(x => (string)x["Linea"])  // aquí usamos ["Linea"] en vez de .Linea
                    .Select(g => g.First())            // Tomar el primero de cada grupo
                    .ToList();

                // Agrupar por línea y proyectar a un nuevo formato
                var resultadoPedidos = array
                    .Select(g => (string)g["Pedido"])
                    .ToList();



                //Se inserta historial de bitacora cuando se secciono alguna pedido a otro plan
                foreach (var lineaS in resultadoByLinea)
                {

                    //Mandar nuevas OF al final del plan
                    AD.RequestParameters.Clear();
                    AD.RequestParameters.Add("folio", lineaS["FolioNuevo"].ToString());
                    string OrdenarOF = Logic.GlobalProcedure(AD.GCUpdateOrdenPorFolio, AD.RequestParameters);

                    //Obtener numero de revision
                    AD.RequestParameters.Clear();
                    AD.RequestParameters.Add("folio", lineaS["FolioNuevo"].ToString());
                    string NumRevision = Logic.GlobalProcedure(AD.GCGetRevisionBitacora, AD.RequestParameters);
                    var revisiones = JsonConvert.DeserializeObject<List<dynamic>>(NumRevision);
                    //Console.WriteLine(revisiones);

                    string MensajeB = "Se ha generado el plan de producción: " + lineaS["FolioNuevo"].ToString() + " a partir de la edición del plan " + lineaS["FolioAnterior"];

                    if (revisiones != null && revisiones.Count > 0)
                    {
                        MensajeB = "Se han agregado nuevas ordenes al plan a partir de la edición del plan : " + lineaS["FolioAnterior"];
                    }

                    //Registrar movimiento en bitacora
                    AD.RequestParameters.Clear();
                    AD.RequestParameters.Add("folio", lineaS["FolioNuevo"].ToString());
                    AD.RequestParameters.Add("descripcion", MensajeB);
                    AD.RequestParameters.Add("usuario", Usuario);
                    AD.RequestParameters.Add("tabla", Tabla);


                    string RevisionNuevoPlan = Logic.GlobalProcedureSigleR(AD.GCInsertaBitacora, AD.RequestParameters);

                    AD.RequestParameters = new Dictionary<string, string>
                    {
                        { "folio", lineaS["FolioNuevo"].ToString() },
                        { "usuario", Usuario },
                        { "Linea",lineaS["Linea"].ToString()}
                    };
                    //string PPA = Logic.GlobalProcedure(AD.GCGetPlanesProduccionDetails, AD.RequestParameters);
                    string PPAHS = Logic.GlobalProcedure(AD.GCGetPlanesProduccionDetailsHistorial, AD.RequestParameters);


                    //GUARDAR EL PLAN DE PRODUCCION ANTERIOR
                    AD.RequestParameters.Clear();
                    JArray LineasPPAS = JArray.Parse(PPAHS);

                    foreach (JObject item in LineasPPAS)
                    {
                        var pedido = item["Pedido"].ToString();
                        //Si el pedido se crea por primera vez, insertar todo
                        if (!resultadoPedidos.Contains(item["Pedido"].ToString()) || revisiones.Count == 0)
                        {
                            //Agregar el numero de revisión  a los parametros
                            AD.RequestParameters.Remove("Revision");
                            AD.RequestParameters.Add("revision", RevisionNuevoPlan);
                            //Agregar resto de parametros de consulta
                            foreach (var linea in item.Properties())
                            {
                                AD.RequestParameters.Add(linea.Name, linea.Value.ToString());
                            }

                            AD.RequestParameters.Add("Prioridad", "");

                            //Insertar la linea
                            string lineaPPA = Logic.GlobalProcedure(AD.GCInsertarPlanProduccionHistorial, AD.RequestParameters);
                            //Limpiar los parametros
                            AD.RequestParameters.Clear();
                        }
                    }
                }

                //OK
                log.Info($"[Agregar OF Sin Apertura] Planes de producción procesados correctamente. Folios: {Folios}");
                var Result = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de folio obtenidos correctamente.", Data = FLOVP, ExtraData = string.Empty });
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

                log.Error($"[Agregar OF Sin Apertura ERROR] {finalmessage} - {E.Message}", E);


                AD.RequestParameters.Add("folios", Folios);
                string DRPP = Logic.GlobalProcedure(AD.GCDeleteResultPlanProduccion, AD.RequestParameters); //Elimina ordenes no creadas y folios vacios

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }
        //Agregar of existentes a un plan "Agregar Ordenes Fabricación" (Validar que solo se inserte el historial si la linea de las nuevas ordenes es igual)
        //Si es diferente no insertar historial
        public JsonResult AddOF(string FolioOriginal, string LineaOriginal, string PlanProduccion, string PreviewFolio, string Usuario, string Tabla)
        {
            try
            {
                log.Info($"Inicio [Agregar OF Existente] - LineaOriginal: {LineaOriginal}, Usuario: {Usuario}, Tabla: {Tabla}, PreviewFolio: {PreviewFolio}, PlanProduccion: {PlanProduccion}");
                //Modificar el plan de produccion
                string Folios = string.Empty;
                int SameLine = 0;
                AD.RequestParameters = new Dictionary<string, string>();

                dynamic PlanProduccionData = JsonConvert.DeserializeObject<dynamic>(PlanProduccion);

                // Deserializar como JObject (porque es un objeto)
                var jObject = JsonConvert.DeserializeObject<JObject>(PlanProduccion);

                // Ahora puedes acceder a cada propiedad (001, 006, etc.)
                foreach (var prop in jObject.Properties())
                {
                    if (prop.Name == LineaOriginal)
                    {
                        SameLine++;
                        break;
                    }
                }


                //GENERAR LA CONFIGURACION DE USUARIO SI NO EXISTE
                log.Info($"[Agregar OF Existente] obteniendo/generando configuración del usuario");
                AD.RequestParameters.Add("usuario", Usuario);
                string CXUPP = Logic.GlobalProcedure(AD.GCGetConfiguracionPP, AD.RequestParameters);

                string Revision = string.Empty;

                if (SameLine > 0) //SI se inserto al menos una orden al plan original
                {
                    //Registrar movimiento en bitacora
                    log.Info($"[Agregar OF Existente] Registrando movimiento en bitácora");
                    AD.RequestParameters.Clear();
                    AD.RequestParameters.Add("folio", PreviewFolio);
                    AD.RequestParameters.Add("descripcion", "Se ha modificado el plan de producción: " + PreviewFolio + " agregando nuevas ordenes de fabricación.");
                    AD.RequestParameters.Add("usuario", Usuario);
                    AD.RequestParameters.Add("tabla", Tabla);


                    Revision = Logic.GlobalProcedureSigleR(AD.GCInsertaBitacora, AD.RequestParameters);

                    //Fin Insertar en Bitacora

                    //Guardar los datos de el plan de produccion anterior como revision
                    AD.RequestParameters.Clear();
                    AD.RequestParameters = new Dictionary<string, string>
                {
                    { "folio", PreviewFolio },
                    { "usuario", Usuario },
                    { "Linea",LineaOriginal}
                };
                    //string PPA = Logic.GlobalProcedure(AD.GCGetPlanesProduccionDetails, AD.RequestParameters);
                    string PPAH = Logic.GlobalProcedure(AD.GCGetPlanesProduccionDetailsHistorial, AD.RequestParameters);


                    //GUARDAR EL PLAN DE PRODUCCION ANTERIOR
                    log.Info($"[Agregar OF Existente] Registrando versión anterior del plan");
                    AD.RequestParameters.Clear();
                    JArray LineasPPA = JArray.Parse(PPAH);

                    foreach (JObject item in LineasPPA)
                    {
                        //Agregar el numero de revisión  a los parametros
                        AD.RequestParameters.Remove("Revision");
                        AD.RequestParameters.Add("revision", Revision);
                        //Agregar resto de parametros de consulta
                        foreach (var linea in item.Properties())
                        {
                            AD.RequestParameters.Add(linea.Name, linea.Value.ToString());
                        }

                        AD.RequestParameters.Add("Prioridad", "");

                        //Insertar la linea
                        string lineaPPA = Logic.GlobalProcedure(AD.GCInsertarPlanProduccionHistorial, AD.RequestParameters);
                        //Limpiar los parametros
                        AD.RequestParameters.Clear();
                    }
                }


                log.Info($"[Agregar OF Existente] Actualizando plan de producción.");
                foreach (var linea in PlanProduccionData)
                {

                    //Insertar las lineas del plan de produccion
                    AD.RequestParameters.Clear();

                    foreach (var item in linea.Value)
                    {
                        Folios += PreviewFolio + ",";
                        //Agregar el folio a los parametros
                        AD.RequestParameters.Add("folio", PreviewFolio);
                        //Agregar resto de parametros de consulta
                        foreach (var ProduccionLine in item.Properties())
                        {
                            AD.RequestParameters.Add(ProduccionLine.Name, ProduccionLine.Value.ToString());
                        }

                        //Eliminar parametros inecesarios para este caso
                        AD.RequestParameters.Remove("Folio");
                        AD.RequestParameters.Remove("Generada");
                        AD.RequestParameters.Remove("Estatus");
                        AD.RequestParameters.Remove("NewRow");
                        //Insertar la linea
                        string lineaPP = Logic.GlobalProcedure(AD.GCModificaPlanProduccionDetailsOF, AD.RequestParameters);
                        //Limpiar los parametros
                        AD.RequestParameters.Clear();
                    }

                }

                //Mandar nuevas OF al final del plan
                log.Info($"[Agregar OF Existente] Finalizando: orden, obteniendo lista final.");
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", PreviewFolio);
                string OrdenarOFs = Logic.GlobalProcedure(AD.GCUpdateOrdenPorFolio, AD.RequestParameters);


                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("PlanProduccion", null);


                //Lista final del plan de producción creado
                AD.RequestParameters.Clear();
                //remover el último carácter de una cadena en C# solo si es una coma (,),
                if (!string.IsNullOrEmpty(Folios) && Folios.EndsWith(","))
                {
                    Folios = Folios.Substring(0, Folios.Length - 1);
                }
                //RESULTADO DE PLAN DE PRODUCCIÓN
                AD.RequestParameters.Add("folios", Folios);
                string FLOVP = Logic.GlobalProcedure(AD.GCGetResultPlanProduccion, AD.RequestParameters);

                //SECCIONAMIENTO DE PLANES
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", PreviewFolio);
                string SeccionamientoPlanes = Logic.GlobalProcedure(AD.GCSpPdxFF_SeccionarPlanes, AD.RequestParameters);

                string jsonS = JsonConvert.SerializeObject(SeccionamientoPlanes);
                //Console.WriteLine(jsonS);
                // Primer paso: Deserializar como string
                var jsonReal = JsonConvert.DeserializeObject<string>(jsonS);

                // Segundo paso: Deserializar el string real a JArray
                var array = JsonConvert.DeserializeObject<JArray>(jsonReal);

                // Ahora puedes hacer GroupBy
                var resultadoByLinea = array
                    .GroupBy(x => (string)x["Linea"])  // aquí usamos ["Linea"] en vez de .Linea
                    .Select(g => g.First())            // Tomar el primero de cada grupo
                    .ToList();

                // Agrupar por línea y proyectar a un nuevo formato
                var resultadoPedidos = array
                    .Select(g => (string)g["Pedido"])
                    .ToList();



                //Se inserta historial de bitacora cuando se secciono alguna pedido a otro plan
                foreach (var lineaS in resultadoByLinea)
                {

                    //Mandar nuevas OF al final del plan
                    AD.RequestParameters.Clear();
                    AD.RequestParameters.Add("folio", lineaS["FolioNuevo"].ToString());
                    string OrdenarOF = Logic.GlobalProcedure(AD.GCUpdateOrdenPorFolio, AD.RequestParameters);

                    //Obtener numero de revision
                    AD.RequestParameters.Clear();
                    AD.RequestParameters.Add("folio", lineaS["FolioNuevo"].ToString());
                    string NumRevision = Logic.GlobalProcedure(AD.GCGetRevisionBitacora, AD.RequestParameters);
                    var revisiones = JsonConvert.DeserializeObject<List<dynamic>>(NumRevision);
                    //Console.WriteLine(revisiones);

                    string MensajeB = "Se ha generado el plan de producción: " + lineaS["FolioNuevo"].ToString() + " a partir de la edición del plan: " + lineaS["FolioAnterior"];

                    if (revisiones != null && revisiones.Count > 0)
                    {
                        MensajeB = "Se han agregado nuevas ordenes al plan, apartir de la edición del plan: " + lineaS["FolioAnterior"];
                    }

                    //Registrar movimiento en bitacora
                    AD.RequestParameters.Clear();
                    AD.RequestParameters.Add("folio", lineaS["FolioNuevo"].ToString());
                    AD.RequestParameters.Add("descripcion", MensajeB);
                    AD.RequestParameters.Add("usuario", Usuario);
                    AD.RequestParameters.Add("tabla", Tabla);


                    string RevisionNuevoPlan = Logic.GlobalProcedureSigleR(AD.GCInsertaBitacora, AD.RequestParameters);

                    AD.RequestParameters = new Dictionary<string, string>
                    {
                        { "folio", lineaS["FolioNuevo"].ToString() },
                        { "usuario", Usuario },
                        { "Linea",lineaS["Linea"].ToString()}
                    };
                    //string PPA = Logic.GlobalProcedure(AD.GCGetPlanesProduccionDetails, AD.RequestParameters);
                    string PPAHS = Logic.GlobalProcedure(AD.GCGetPlanesProduccionDetailsHistorial, AD.RequestParameters);


                    //GUARDAR EL PLAN DE PRODUCCION ANTERIOR
                    AD.RequestParameters.Clear();
                    JArray LineasPPAS = JArray.Parse(PPAHS);

                    foreach (JObject item in LineasPPAS)
                    {
                        var pedido = item["Pedido"].ToString();
                        //Si el pedido se crea por primera vez, insertar todo
                        if (!resultadoPedidos.Contains(item["Pedido"].ToString()) || revisiones.Count == 0)
                        {
                            //Agregar el numero de revisión  a los parametros
                            AD.RequestParameters.Remove("Revision");
                            AD.RequestParameters.Add("revision", RevisionNuevoPlan);
                            //Agregar resto de parametros de consulta
                            foreach (var linea in item.Properties())
                            {
                                AD.RequestParameters.Add(linea.Name, linea.Value.ToString());
                            }

                            AD.RequestParameters.Add("Prioridad", "");

                            //Insertar la linea
                            string lineaPPA = Logic.GlobalProcedure(AD.GCInsertarPlanProduccionHistorial, AD.RequestParameters);
                            //Limpiar los parametros
                            AD.RequestParameters.Clear();
                        }
                    }
                }




                //OK
                log.Info($"[Agregar OF Existente] Planes de producción procesados correctamente. Folios: {Folios}");
                var Result = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de folio obtenidos correctamente.", Data = FLOVP, ExtraData = string.Empty });
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

                log.Error($"[Agregar OF Existente ERROR] {finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        //Producción Guata y Filtro
        //Procesamiento de informacion para seccion de Reserva polietileno GyF
        public JsonResult InsertaLineaRPolietileno(ReservaPolietilenoDto modeloInsertaRPolietileno)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>
                {
                    { "PlanProduccion", modeloInsertaRPolietileno.PlanProduccion },
                    { "OrdenFabricacion", modeloInsertaRPolietileno.OrdenFabricacion },
                    { "Pedido", modeloInsertaRPolietileno.Pedido },
                    { "Linea", modeloInsertaRPolietileno.Linea },
                    { "Peso", modeloInsertaRPolietileno.BasculaPeso.ToString() },
                    { "Operador", modeloInsertaRPolietileno.Empleado }
                };
                string RPInserta = Logic.GlobalProcedure(AD.RPInsertaLineaReservaPolietileno, AD.RequestParameters);


                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (RPInserta.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = RPInserta });
                }
                //No existe información
                else if (RPInserta.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "Ocurrio un error al insertar la linea: " + string.Empty + "." });
                }
                //OK
                var result = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Información insertada correctamente.", Data = RPInserta });
                result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return result;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible insertar la informacion de reserva de polietileno " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }


        #endregion

        #region ConsultaPP
        public JsonResult GetPlanesProduccion(string terminados, string lineas, string FI, string FF)
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

                List<AccesoDatos.PlanesProduccionCreados> PP = new List<AccesoDatos.PlanesProduccionCreados>();
                string connectionString = string.Empty;
                AD.RequestParameters = new Dictionary<string, string>
                {
                    { "terminados", terminados },
                    { "Lineas", (lineas == string.Empty ? null : lineas) },
                    { "FI", (FI == string.Empty ? null : FI) },
                    { "FF", (FF == string.Empty ? null : FF) }
                };
                string reporte = Logic.GlobalProcedure(AD.GCGetPlanesProduccion, AD.RequestParameters);
                PP = JsonConvert.DeserializeObject<List<AccesoDatos.PlanesProduccionCreados>>(reporte);
                TotalRegistros = PP.Count();

                if (FiltroBusqueda != string.Empty)
                    PP = PP.Where(e => string.Concat(e.Folio, e.Linea, e.CantidadKilos, e.Articulo, e.DescripcionArticulo, e.GenerarOF, e.OrdenFabricacion, e.EstatusSapOF, e.EstatusProduccion).Contains(FiltroBusqueda)).ToList();
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
        public JsonResult GetPlanesProduccionDetailsCCP(string folio, string usuario, string tabla)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                //Configuracion del plan de produccion por usuario
                AD.RequestParameters.Add("usuario", usuario);
                string CXUPP = Logic.GlobalProcedure(AD.GCGetConfiguracionPP, AD.RequestParameters);

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", folio);
                AD.RequestParameters.Add("usuario", usuario);
                AD.RequestParameters.Add("tabla", tabla);
                string PPD = Logic.GlobalProcedure(AD.GCGetPlanesProduccionDetailsCCP, AD.RequestParameters);
                string PPDH = Logic.GlobalProcedure(AD.GetBitacoraHeaderDetails, AD.RequestParameters);


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
                //OK
                var result = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de plan obtenidos correctamente.", Data = PPD, ExtraData = PPDH, Other = CXUPP });
                result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return result;
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
        public JsonResult GetPlanesProduccionDetailsReportes(string folio, string usuario, string tabla)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                //Configuracion del plan de produccion por usuario
                AD.RequestParameters.Add("usuario", usuario);
                string CXUPP = Logic.GlobalProcedure(AD.GCGetConfiguracionPP, AD.RequestParameters);

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", folio);
                AD.RequestParameters.Add("usuario", usuario);
                AD.RequestParameters.Add("tabla", tabla);
                string PPD = Logic.GlobalProcedure(AD.GCGetPlanesProduccionDetailsR, AD.RequestParameters);
                string PPDH = Logic.GlobalProcedure(AD.GetBitacoraHeaderDetails, AD.RequestParameters);


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
                //OK
                var result = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de plan obtenidos correctamente.", Data = PPD, ExtraData = PPDH, Other = CXUPP });
                result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return result;
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
        /// <summary>
        /// Consulta de detalles de plan de produccion para planeación
        /// </summary>
        /// <param name="folio"></param>
        /// <param name="usuario"></param>
        /// <param name="tabla"></param>
        /// <returns></returns>
        public JsonResult GetPlanesProduccionDetails(string folio, string usuario, string tabla)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                //Configuracion del plan de produccion por usuario
                AD.RequestParameters.Add("usuario", usuario);
                string CXUPP = Logic.GlobalProcedure(AD.GCGetConfiguracionPP, AD.RequestParameters);

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", folio);
                AD.RequestParameters.Add("usuario", usuario);
                AD.RequestParameters.Add("tabla", tabla);
                //Actualiza Tiempo de Produccion
                string TP = Logic.GlobalProcedure(AD.GCUpdateTiempoProduccion, AD.RequestParameters);
                //Actualiza la Hora Propuesta
                string HP = Logic.GlobalProcedure(AD.GCUpdateHoraPropuesta, AD.RequestParameters);
                //Actualiza la Suma de Capacidades
                string SC = Logic.GlobalProcedure(AD.GCUpdateSumCap, AD.RequestParameters);
                //Obtener detalles de los planes de produccion
                string PPD = Logic.GlobalProcedure(AD.GCGetPlanesProduccionDetails, AD.RequestParameters);
                string PPDH = Logic.GlobalProcedure(AD.GetBitacoraHeaderDetails, AD.RequestParameters);


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
                //OK
                var result = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de plan obtenidos correctamente.", Data = PPD, ExtraData = PPDH, Other = CXUPP });
                result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return result;
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
        public JsonResult GetBitacoraPP(string folio, string Tabla)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("folio", folio);
                AD.RequestParameters.Add("tabla", Tabla);
                string BPP = Logic.GlobalProcedure(AD.GCGetBitacora, AD.RequestParameters);
                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (BPP.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = BPP });
                }
                //No existe información
                else if (BPP.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente al plan: " + folio + "." });
                }
                //OK
                var result = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de plan obtenidos correctamente.", Data = BPP });
                result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return result;
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
        /// <summary>
        /// Obtiene la configuracion de columnas para la consulta de el plan de produccion
        /// </summary>
        /// <param name="usuario"></param>
        /// <returns></returns>
        public JsonResult GetConfigxUsuarioPP(string usuario, string configuracion)
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
                string CPP = Logic.GlobalProcedure(AD.GCGetConfiguracionPP, AD.RequestParameters);
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
        public JsonResult GetConfigxUsuarioPPI(string usuario, string configuracion)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("usuario", usuario);


                string CPP = Logic.GlobalProcedure(AD.GCGetConfiguracionPPI, AD.RequestParameters);
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
        public JsonResult GetConfigxUsuarioPPVP(string usuario, string configuracion)
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
                string CPP = Logic.GlobalProcedure(AD.GCGetConfiguracionPPVP, AD.RequestParameters);
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
        /// <summary>
        /// Inserta o Actualiza la configuracion de columnas para la consulta de el plan de produccion
        /// ademas de insertar la configuracion si no existe y si existe la actualiza
        /// </summary>
        /// <param name="usuario"></param>
        /// <returns></returns>
        public JsonResult InsertaConfigxUsuarioPP(string usuario, string configuracion)
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
                string CPP = Logic.GlobalProcedure(AD.GCInsertaConfiguracionPP, AD.RequestParameters);
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
                string msg = "No es posible obtener la configuración del plan de producción " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }
        public JsonResult InsertaConfigxUsuarioPPI(string usuario, string configuracion)
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
                }
                string CPP = Logic.GlobalProcedure(AD.GCInsertaConfiguracionPPI, AD.RequestParameters);
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
                string msg = "No es posible obtener la configuración del plan de producción " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }
        public JsonResult InsertaConfigxUsuarioPPVP(string usuario, string configuracion)
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
                }
                string CPP = Logic.GlobalProcedure(AD.GCInsertaConfiguracionPPVP, AD.RequestParameters);
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
                string msg = "No es posible obtener la configuración del plan de producción " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }
        public JsonResult GetBitacoraDetailsPP(string folio, string revision)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("folio", folio);
                AD.RequestParameters.Add("revision", revision);
                string BPP = Logic.GlobalProcedure(AD.GCetBitacoraPlanProduccionDetails, AD.RequestParameters);
                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (BPP.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = BPP });
                }
                //No existe información
                else if (BPP.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente al plan: " + folio + "." });
                }
                //OK
                var result = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de plan obtenidos correctamente.", Data = BPP });
                result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return result;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener los detalles de la revisión de el plan de producción " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }
        /// <summary>
        /// 
        /// </summary>
        /// <param name="PlanProduccion"></param>
        /// <param name="folioPP"></param>
        /// <param name="HistorialEdiciones"></param>
        /// <param name="usuario"></param>
        /// <param name="Tabla"></param>
        /// <param name="FilasM"></param>
        /// <returns></returns>
        public JsonResult ActualizarOF(
            string PlanProduccion, string folioPP, string HistorialEdiciones,
            string usuario, string Tabla, string FilasM)
        {
            try
            {
                log.Info($"[ActualizarOF] Inicio del proceso de actualizar plan de producción: {folioPP} en tabla {Tabla} con - Usuario: {usuario} recibiendo: {PlanProduccion} con historial de ediciones: {HistorialEdiciones} y muestras: {FilasM} ");
                if (FilasM == null) FilasM = "[]";

                AD.RequestParameters = new Dictionary<string, string>();
                JArray LineasPPM = JArray.Parse(FilasM);


                //Registrar movimiento en bitacora
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("folio", folioPP);
                // AD.RequestParameters.Add("descripcion", "Se ha actualizado el plan de producción: " + HistorialEdiciones);
                AD.RequestParameters.Add("usuario", usuario);
                AD.RequestParameters.Add("tabla", Tabla);

                if (LineasPPM.Count > 0)
                {
                    AD.RequestParameters.Add("descripcion", "Se ha actualizado el plan de producción, se agregaron ordenes de muestra.");
                }
                else
                {
                    AD.RequestParameters.Add("descripcion", "Se ha actualizado el plan de producción: " + HistorialEdiciones);
                }

                log.Info($"[ActualizarOF] Registrando movimiento en bitácora");

                string revision = Logic.GlobalProcedureSigleR(AD.GCInsertaBitacora, AD.RequestParameters);

                //Guardar los datos de el plan de produccion anterior como revision
                AD.RequestParameters.Clear();
                AD.RequestParameters = new Dictionary<string, string>
                {
                    { "folio", folioPP },
                    { "usuario", usuario },
                    { "Linea", null }
                };
                //string PPA = Logic.GlobalProcedure(AD.GCGetPlanesProduccionDetails, AD.RequestParameters);
                string PPAH = Logic.GlobalProcedure(AD.GCGetPlanesProduccionDetailsHistorial, AD.RequestParameters);


                //GUARDAR EL PLAN DE PRODUCCION ANTERIOR
                log.Info($"[ActualizarOF] Registrando historial de versiónes");
                AD.RequestParameters.Clear();
                JArray LineasPPA = JArray.Parse(PPAH);

                foreach (JObject item in LineasPPA)
                {
                    //Agregar el numero de revisión  a los parametros
                    AD.RequestParameters.Remove("Revision");
                    AD.RequestParameters.Add("revision", revision);
                    AD.RequestParameters.Add("Prioridad", "");
                    //Agregar resto de parametros de consulta
                    foreach (var linea in item.Properties())
                    {
                        AD.RequestParameters.Add(linea.Name, linea.Value.ToString().Trim());
                    }

                    //Insertar la linea
                    string lineaPPA = Logic.GlobalProcedure(AD.GCInsertarPlanProduccionHistorial, AD.RequestParameters);
                    //Limpiar los parametros
                    AD.RequestParameters.Clear();
                }

                //Insertar el plan de produccion

                log.Info($"[ActualizarOF] Actualizando plan de producción");
                AD.RequestParameters.Clear();
                JArray LineasPP = JArray.Parse(PlanProduccion);

                foreach (JObject item in LineasPP)
                {
                    var estatusVacio = false;
                    //Agregar resto de parametros de consulta
                    foreach (var linea in item.Properties())
                    {
                        if (linea.Name == "EstatusProduccion" && linea.Value.ToString() == "")
                        {
                            linea.Value = "en cola";
                            estatusVacio = true;
                        }

                        AD.RequestParameters.Add(linea.Name, linea.Value.ToString());
                    }

                    if (estatusVacio)
                    {
                        log.Warn($"[ActualizarOF - Previo a insertar data] El estatus de produccion de: {item.ToString()} esta vacio. Se cambio a 'en cola' por validacion de campo vacio.");

                    }

                    AD.RequestParameters.Add("Usuario", usuario);

                    //Insertar la linea
                    string lineaPP = Logic.GlobalProcedure(AD.GCModifiPlanProduccionDetails, AD.RequestParameters);


                    if (lineaPP.Contains("Error"))
                    {
                        log.Error($"[ActualizarOF] Error al actualizar plan: {lineaPP}");
                        return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = lineaPP, Data = "[]" });
                    }
                    log.Info($"[ActualizarOF] Actualizacion correcta pedidos actualizados : {lineaPP.ToString()}");

                    //Limpiar los parametros
                    AD.RequestParameters.Clear();
                }


                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("PlanProduccion", (folioPP == string.Empty ? null : folioPP));

                //Insertar of de muestras
                log.Info($"[ActualizarOF] Insertando muestras");
                AD.RequestParameters.Clear();
                //JArray LineasPPM = JArray.Parse(FilasM);

                if (LineasPPM.Count > 0)
                {
                    foreach (JObject item in LineasPPM)
                    {
                        //Agregar resto de parametros de consulta
                        foreach (var linea in item.Properties())
                        {
                            AD.RequestParameters.Add(linea.Name, linea.Value.ToString());
                        }

                        //Insertar la linea
                        string lineaPP = Logic.GlobalProcedure(AD.GCInsertarPlanProduccionDetailsM, AD.RequestParameters);

                        if (lineaPP.Contains("Error"))
                        {
                            return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = lineaPP, Data = "[]" });
                        }
                        //Limpiar los parametros
                        AD.RequestParameters.Clear();
                    }
                }

                // Obtén el contexto del Hub
                var context = GlobalHost.ConnectionManager.GetHubContext<DashTendPesosHub>();
                context.Clients.All.changePlanPro(folioPP);



                //OK
                log.Info($"[ActualizarOF] Proceso completado.");
                var Result = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de folio obtenidos correctamente.", Data = "[]", ExtraData = folioPP });
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

        public JsonResult GetConfigSN(string email)
        {
            try
            {
                List<AccesoDatos.ConfigPP> ConfigPP = new List<AccesoDatos.ConfigPP>();
                string connectionString = string.Empty;
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("usuario", email);
                string reporte = Logic.GlobalProcedure(AD.GCGetConfigSN, AD.RequestParameters);
                ConfigPP = JsonConvert.DeserializeObject<List<AccesoDatos.ConfigPP>>(reporte);


                // Validación del los datos
                if (reporte.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    { Status = "ERROR", Message = reporte, Data = ConfigPP });
                }

                //OK
                return Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "", Data = reporte });

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de configPP " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }
        public JsonResult UpdateConfigSN(string email, string configSN)
        {
            try
            {

                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("nombres", configSN);
                AD.RequestParameters.Add("Usuario", email);
                string reporte = Logic.GlobalProcedure(AD.GCUpdateConfigPPSN, AD.RequestParameters);

                // Validación del los datos
                if (reporte.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    { Status = "ERROR", Message = reporte });
                }

                //OK
                return Json(new AccesoDatos.JsonResponse { Status = "OK", Message = reporte });

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible actualizar la lista de configPP " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetConfigAPC(string email)
        {
            try
            {
                List<AccesoDatos.ConfigPP> ConfigPP = new List<AccesoDatos.ConfigPP>();
                string connectionString = string.Empty;
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("usuario", email);
                string reporte = Logic.GlobalProcedure(AD.GCGetConfigAPC, AD.RequestParameters);
                ConfigPP = JsonConvert.DeserializeObject<List<AccesoDatos.ConfigPP>>(reporte);


                // Validación del los datos
                if (reporte.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    { Status = "ERROR", Message = reporte, Data = ConfigPP });
                }

                //OK
                return Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "", Data = reporte });

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de configPP " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult UpdateConfigAPC(string email, string nombreColumna, string valor)
        {
            try
            {

                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("USUARIO", email);
                AD.RequestParameters.Add("Nombre", nombreColumna);
                AD.RequestParameters.Add("Valor", valor);
                string reporte = Logic.GlobalProcedure(AD.GCUpdateConfigAPC, AD.RequestParameters);

                // Validación del los datos
                if (reporte.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    { Status = "ERROR", Message = reporte });
                }

                //OK
                return Json(new AccesoDatos.JsonResponse { Status = "OK", Message = reporte });

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible actualizar la lista de configAPC " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetConfigOCAPC(string email)
        {
            try
            {
                List<AccesoDatos.ConfigPP> ConfigPP = new List<AccesoDatos.ConfigPP>();
                string connectionString = string.Empty;
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("usuario", email);
                string reporte = Logic.GlobalProcedure(AD.GCGetConfigOCAPC, AD.RequestParameters);
                ConfigPP = JsonConvert.DeserializeObject<List<AccesoDatos.ConfigPP>>(reporte);


                // Validación del los datos
                if (reporte.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    { Status = "ERROR", Message = reporte, Data = ConfigPP });
                }

                //OK
                return Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "", Data = reporte });

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de configPP " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult UpdateConfigOCAPC(string email, string configSN)
        {
            try
            {
                // Crear un diccionario para los parámetros
                var requestParameters = new Dictionary<string, string>
                {
                    { "Usuario", email },
                    { "JsonData", configSN } // El JSON se pasa directamente
                };

                // Ejecutar el procedimiento almacenado
                var reporte = Logic.GlobalProcedure(AD.GCUpdateConfigOCAPC, requestParameters);

                // Validación de los datos
                if (reporte.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    {
                        Status = "ERROR",
                        Message = reporte
                    });
                }

                // Respuesta exitosa
                return Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Operación realizada correctamente"
                });
            }
            catch (Exception ex)
            {
                // Manejo de excepciones
                string methodName = MethodBase.GetCurrentMethod().Name;
                string controllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = $"No es posible actualizar la lista de configuración en {methodName} en {controllerName}. Por favor contacte al administrador del sistema.";
                string finalMessage = AD.Excepcion(ex, msg).ToString();

                log.Error($"{finalMessage} - {ex.Message}", ex);


                return Json(new AccesoDatos.JsonResponse
                {
                    Status = "ERROR",
                    Message = finalMessage,
                    Data = "[]"
                });
            }
        }

        public JsonResult GetConfigxUsuarioROV(string usuario, string configuracion)
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
                string CPP = Logic.GlobalProcedure(AD.GCGetConfigROV, AD.RequestParameters);
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

        public JsonResult InsertaConfigxUsuarioROV(string usuario, string configuracion)
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

                }
                string CPP = Logic.GlobalProcedure(AD.GCInsertaConfiguracionROV, AD.RequestParameters);
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
                string msg = "No es posible obtener la configuración del plan de producción " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult DeletePlanDetail(string idppd, string Folio, string Usuario, string Tabla, string OF)
        {
            try
            {
                log.Info($"[DeletePlanDetail] inicio del proceso de borrado de orden de fabricación con id de registro: {idppd}, folio: {Folio}, usuario: {Usuario}, tabla: {Tabla}, of: {OF}");
                string id = string.Empty;
                // Crear un diccionario para los parámetros
                AD.RequestParameters = new Dictionary<string, string>();

                //Intentar eliminar el registro
                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("id", idppd);
                // Ejecutar el procedimiento almacenado
                log.Info($"[DeletePlanDetail] Eliminando registro.");
                var deleted = Logic.GlobalProcedure(AD.GCDeleteItemPlanDetails, AD.RequestParameters);

                JArray IdDeleted = JArray.Parse(deleted);

                // Validación de los datos
                if (id.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    {
                        Status = "ERROR",
                        Message = id
                    });
                }
                else if (deleted.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    {
                        Status = "N/A",
                        Message = "Ningun registro eliminado"
                    });
                }
                else
                {
                    log.Info($"[DeletePlanDetail] Registrando movimiento en bitácora.");
                    id = IdDeleted[0]["id"].ToString();
                    //Registrar movimiento en bitacora
                    AD.RequestParameters.Clear();
                    AD.RequestParameters.Add("folio", Folio);
                    AD.RequestParameters.Add(
                            "descripcion",
                            "Se ha modificado el plan de producción: " + Folio + " se elimino la OF : " + OF + ".");
                    AD.RequestParameters.Add("usuario", Usuario);
                    AD.RequestParameters.Add("tabla", Tabla);


                    string Revision = Logic.GlobalProcedureSigleR(AD.GCInsertaBitacora, AD.RequestParameters);
                    //Fin Insertar en Bitacora


                    //Guardar los datos de el plan de produccion anterior como revision
                    AD.RequestParameters.Clear();
                    AD.RequestParameters = new Dictionary<string, string>
                {
                    { "folio", Folio },
                    { "usuario", Usuario },
                    { "Linea", null }
                };
                    //string PPA = Logic.GlobalProcedure(AD.GCGetPlanesProduccionDetails, AD.RequestParameters);
                    string PPAH = Logic.GlobalProcedure(AD.GCGetPlanesProduccionDetailsHistorial, AD.RequestParameters);


                    //GUARDAR EL PLAN DE PRODUCCION ANTERIOR
                    log.Info($"[DeletePlanDetail] Guardando versión anterior del plan.");
                    AD.RequestParameters.Clear();
                    JArray LineasPPA = JArray.Parse(PPAH);

                    foreach (JObject item in LineasPPA)
                    {
                        //Agregar el numero de revisión  a los parametros
                        AD.RequestParameters.Remove("Revision");
                        AD.RequestParameters.Add("revision", Revision);
                        //Agregar resto de parametros de consulta
                        foreach (var linea in item.Properties())
                        {
                            AD.RequestParameters.Add(linea.Name, linea.Value.ToString());
                        }

                        AD.RequestParameters.Add("Prioridad", "");

                        //Insertar la linea
                        string lineaPPA = Logic.GlobalProcedure(AD.GCInsertarPlanProduccionHistorial, AD.RequestParameters);
                        //Limpiar los parametros
                        AD.RequestParameters.Clear();
                    }

                    // Respuesta exitosa
                    log.Info($"[DeletePlanDetail] Proceso terminado.");
                    return Json(new AccesoDatos.JsonResponse
                    {
                        Status = "OK",
                        Message = "Operación realizada correctamente"
                    });
                }
            }
            catch (Exception ex)
            {
                // Manejo de excepciones
                string methodName = MethodBase.GetCurrentMethod().Name;
                string controllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = $"No es posible eliminar el registro {methodName} en {controllerName}. Por favor contacte al administrador del sistema.";
                string finalMessage = AD.Excepcion(ex, msg).ToString();
                log.Error($"[DeletePlanDetail] No fue posible completar el proceso de borrado de orden del plan: {finalMessage.ToString()}");
                return Json(new AccesoDatos.JsonResponse
                {
                    Status = "ERROR",
                    Message = finalMessage,
                    Data = "[]"
                });
            }
        }

        public JsonResult UpdateOrderRowsDetails(string orderRows, string Folio)
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
                var reporte = Logic.GlobalProcedure(AD.GCUpdateOrderRowsDetails, requestParameters);

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
                //Actualiza Tiempo de Produccion
                string TP = Logic.GlobalProcedure(AD.GCUpdateTiempoProduccion, AD.RequestParameters);
                //Actualiza la Hora Propuesta
                string HP = Logic.GlobalProcedure(AD.GCUpdateHoraPropuesta, AD.RequestParameters);
                //Actualiza la Suma de Capacidades
                string SC = Logic.GlobalProcedure(AD.GCUpdateSumCap, AD.RequestParameters);

                string infoAct = Logic.GlobalProcedure(AD.GCGetSumCapOrder, AD.RequestParameters);

                // Respuesta exitosa
                log.Info($"[UpdateOrderRowsDetails] proceso completado.");
                return Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Data = infoAct,
                    Message = "Operación realizada correctamente"
                });
            }
            catch (Exception ex)
            {
                // Manejo de excepciones
                string methodName = MethodBase.GetCurrentMethod().Name;
                string controllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = $"No es posible actualizar la lista de plan details en {methodName} en {controllerName}. Por favor contacte al administrador del sistema.";
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

        public JsonResult InsertaParoMannto(string Linea, string FechaParo, string MotivoReparacion, string Solicitante, string Pedido)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("Linea", Linea);
                AD.RequestParameters.Add("Fecha", FechaParo);
                AD.RequestParameters.Add("MotivoReparacion", MotivoReparacion);
                AD.RequestParameters.Add("Solicitante", Solicitante);
                AD.RequestParameters.Add("Pedido", Pedido);
                string PML = Logic.GlobalProcedure(AD.GCInsertarParoMantenimiento, AD.RequestParameters);
                //retornamos en JSON la data obtenida

                // Validación del los datos
                ; if (PML.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = PML });
                }

                //Has un store que obtenga el turno, numfam y linea del paro....
                //OK
                //ENVIAR NOTIFICACION MANTENIMIENTO
                bool notificacion = false;
                try
                {
                    Dictionary<string, string> parameters = new Dictionary<string, string>();
                    parameters.Add("Code", "Mantenimiento");
                    string EmailsMantenimiento = AD.ExecuteProcedure(AD.GCGetEmailAuth, parameters);
                    notificacion = Logic.NotificacionMantenimiento("Notificación de paros", "Nuevo Paro Asignado", "NUEVO PARO DE LÍNEA", "Se ha registrado un nuevo para para la línea: " + Linea + " por la siguiente razon: " + Environment.NewLine + Environment.NewLine + MotivoReparacion, EmailsMantenimiento);
                }

                catch (Exception E)
                {
                    //Devolver el error en formato JSON
                    string MethodName = MethodBase.GetCurrentMethod().Name;
                    string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                    string msg = "No es posible enviar la notificacion de nuevo paro de línea al usuario de mantenimiento " + MethodName + " en: " + ControllerName;
                    string finalmessage = AD.Excepcion(E, msg).ToString();
                    log.Error($"{finalmessage} - {E.Message}", E);
                }

                string msjUpdateP = string.Empty;

                try
                {
                    JArray IdInsert = JArray.Parse(PML);
                    var id = IdInsert[0]["ID"].ToString();


                    AD.RequestParameters.Clear();
                    AD.RequestParameters.Add("Id", id);
                    string Paro = Logic.GlobalProcedure(AD.GCGetDetParo, AD.RequestParameters);


                    var context = GlobalHost.ConnectionManager.GetHubContext<ParosHub>();
                    context.Clients.All.updateParos(Paro);
                    context.Clients.All.newParo(Paro);

                    msjUpdateP = "Update actualizado en dashboard...";
                }
                catch (Exception E)
                {
                    msjUpdateP = "Error al mandar signal a dashboard..";
                    string MethodName = MethodBase.GetCurrentMethod().Name;
                    string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                    string msg = "No es posible enviar la notificacion (signal) al dashboard " + MethodName + " en: " + ControllerName;
                    string finalmessage = AD.Excepcion(E, msg).ToString();
                    log.Error($"{finalmessage} - {E.Message}", E);
                }


                string CustomMessage = (notificacion == true ? "Nuevo Registro de paro generado correctamente" : "Se ha registrado el paro de línea pero la notificación no pudo ser enviada");
                var result = Json(new AccesoDatos.JsonResponse
                { Status = "OK", Message = CustomMessage, Data = PML, Data2 = msjUpdateP });



                result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return result;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible registrar nuevo paro de línea " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetInfoLineasRP() {
            try {

                AD.RequestParameters = new Dictionary<string, string>();
                
                string ObtenLineasRP = Logic.GlobalProcedure(AD.RPObtenerLineasReservaPolietileno, AD.RequestParameters);
                //retornamos en JSON la data obtenida
                // Validación del los datos
                if (ObtenLineasRP.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = ObtenLineasRP }, JsonRequestBehavior.AllowGet);
                }
                //No existe información
                else if (ObtenLineasRP.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "EMPTY", Message = "No se encontró información referente a las reservas de polietileno." }, JsonRequestBehavior.AllowGet);
                }
                //OK
                var result = Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Información de reservas de polietileno obtenidas correctamente.", Data = ObtenLineasRP }, JsonRequestBehavior.AllowGet);
                result.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return result;

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la información de reservas de polietileno " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                log.Error($"{finalmessage} - {E.Message}", E);

                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" }, JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult GetTipoProducto(string tipoProducto)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("IdTipoProducto", tipoProducto);

                string connectionString = string.Empty;
                string opciones = Logic.GlobalProcedure(AD.GCGetTipoProducto, AD.RequestParameters);
                //retornamos en JSON la data obtenida
                var resultado = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Lista de tipos de producto obtenida correctamente".ToString(),
                    Data = opciones
                });
                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de tipos de producto " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        [HttpPost]
        public JsonResult GetClasificacionTipoProducto(int idTipoProducto)
        {
            string tiposGyF = ConfigurationManager.AppSettings["TiposGuataFiltro"];
            string tiposMaq = ConfigurationManager.AppSettings["TiposMaquila"];
            var listaGyF = tiposGyF.Split(',').Select(int.Parse).ToList();
            var listaMaq = tiposMaq.Split(',').Select(int.Parse).ToList();
            string clasificacion = "";
            if (listaGyF.Contains(idTipoProducto))
                clasificacion = "GuataFiltro";
            else if (listaMaq.Contains(idTipoProducto))
                clasificacion = "Maquila";
            else
                clasificacion = "Desconocido";
            return Json(new { Status = "OK", Clasificacion = clasificacion });
        }


        //Obtencion de turnos y horarios
        public JsonResult GetTurnosHorarios()
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                string opciones = Logic.GlobalProcedure(AD.GetTurnosYHorarios, AD.RequestParameters);
                //retornamos en JSON la data obtenida
                var resultado = Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "Lista de turnos y horarios obtenida correctamente".ToString(),
                    Data = opciones
                });
                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la lista de turnos y horarios del rubro " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        #endregion
    }
}
