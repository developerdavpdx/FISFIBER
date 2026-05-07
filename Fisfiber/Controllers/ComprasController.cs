using Fisfiber.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web.Mvc;

namespace Fisfiber.Controllers
{
    public class ComprasController : Controller
    {
        Logica Logic = new Logica();
        AccesoDatos AD = new AccesoDatos();
        public ActionResult ChecklistDoc()
        {
            return View();
        }

        public JsonResult GetOrdenesCompra(string Busqueda, string FI, string FF, string Series)
        {
            try
            {
                //Parametros de fecha
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("Busqueda", Busqueda);
                AD.RequestParameters.Add("FI", (FI == string.Empty ? null : FI));
                AD.RequestParameters.Add("FF", (FF == string.Empty ? null : FF));
                AD.RequestParameters.Add("Series", (Series == string.Empty ? null : Series));

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

                List<AccesoDatos.Documentos> OC = new List<AccesoDatos.Documentos>();
                string connectionString = string.Empty;

                string reporte = Logic.GlobalProcedure(AD.GCOrdenesCompra, AD.RequestParameters);
                OC = JsonConvert.DeserializeObject<List<AccesoDatos.Documentos>>(reporte);
                TotalRegistros = OC.Count();

                if (FiltroBusqueda != string.Empty)
                    OC = OC.Where(e => string.Concat(e.DocEntry, e.Pedido, e.Cliente, e.CodigoCliente, e.FechaContabilizacion, e.U_OrdenFisica, e.U_Pedimento, e.U_PackingList, e.U_CertificadoCalidad).Contains(FiltroBusqueda)).ToList();
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
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetOrdenesCompraDetails(string DocEntry)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("DocEntry", DocEntry);
                string details = Logic.GlobalProcedure(AD.GCOrdenesCompraDetails, AD.RequestParameters);
                // Validación del los datos
                if (details.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = details });
                }
                //No existe información
                else if (details.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No se encontró información referente la OC: " + DocEntry + "." });
                }
                //OK
                return Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Detalles de orden obtenidos correctamente.", Data = details });

            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener los detalles de la OC " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }
    }
}
