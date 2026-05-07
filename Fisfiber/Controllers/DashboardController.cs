using DocumentFormat.OpenXml.EMMA;
using Fisfiber.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Reflection;
using System.Web.Mvc;

namespace Fisfiber.Controllers
{
    public class DashboardController : Controller
    {
        GlobalController Global = new GlobalController();
        Logica Logic = new Logica();
        AccesoDatos AD = new AccesoDatos();

        // GET: Dashboard
        public ActionResult Index()
        {
            string MAX_EFI = ConfigurationManager.AppSettings["MaxEficiencia"];
            string MAX_PRO = ConfigurationManager.AppSettings["MaxProduc"];

            ViewBag.MAX_EFI = MAX_EFI;
            ViewBag.MAX_PRO = MAX_PRO;

            return View();
        }

        public ActionResult Dashboard()
        {
            return View();
        }

        //Grafica 1 EN PROCESO
        public JsonResult GetInfoProLine(string Linea)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("Linea", Linea);
                string info = Logic.GlobalProcedure(AD.GCGetInfoProduct, AD.RequestParameters);

                if (info.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    { Status = "ERROR", Message = info });
                }
                //No existe información
                else if (info.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    {
                        Status = "OK",
                        Message = "No se encontraron pedido en producción para Linea: " + Linea,
                        Data = info
                    });
                }


                dynamic PedidoPro = JsonConvert.DeserializeObject<dynamic>(info);

                string OF = PedidoPro[0].DocNumOF;
                string Pedido = PedidoPro[0].Pedido;

                AD.RequestParameters.Clear();
                AD.RequestParameters.Add("Pedido", Pedido);
                //AD.RequestParameters.Add("Pedido", "193182");

                //Rollos con forme a recibos de produccion
                string infoGrafica = Logic.GlobalProcedure(AD.GCGetInfoProGraf, AD.RequestParameters);
                string infoTotalPro = Logic.GlobalProcedure(AD.GCGetInfoTotalProL, AD.RequestParameters);
                //INFORMACION DE MEZCLA DE FIBRAS QUE VIENE DE LA RECETA
                //BUSQUEDA BASADA EN CAMPO OWOR.U_STATUS = PEDIDO 
                string infoMateriales = Logic.GlobalProcedure(AD.GCGetMaterialesPorOF, AD.RequestParameters);


                //AD.RequestParameters.Clear();
                //AD.RequestParameters.Add("OF", OF);
                //CONSUMIDO DE POLIETILENO Y TUBO 
                string infoConsumido = Logic.GlobalProcedure(AD.GCGetInfoConsumido, AD.RequestParameters);

                if (infoGrafica.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    { Status = "ERROR", Message = info });
                }
                //No existe información
                else if (infoGrafica.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    {
                        Status = "OK",
                        Message = "No se encontraron recibos de producción para la OF: " + OF,
                        Data = info,
                        Data2 = infoMateriales,
                        Data3 = infoConsumido,
                        ExtraData = infoGrafica,
                        Other = infoTotalPro
                    });
                }


                //retornamos en JSON la data obtenida
                var resultado =
                    Json(new AccesoDatos.JsonResponse
                    {
                        Status = "OK",
                        Message = "Información de pedido obtenida correctamente".ToString(),
                        Data = info,
                        Data2 = infoMateriales,
                        Data3 = infoConsumido,
                        ExtraData = infoGrafica,
                        Other = infoTotalPro
                    });

                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la informacion del pedido " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        //OBTIENE EL COSUMIDO Y MATERIALES 
        public JsonResult GetInfoConsumido(
            string Pedido, string Linea,
            string GrupoArticulos, string Turno)
        {

            AD.RequestParameters = new Dictionary<string, string>();
            AD.RequestParameters.Add("Pedido", Pedido);
            string info = Logic.GlobalProcedure(AD.GCGetInfoConsumido, AD.RequestParameters);

            //INFORMACION DE MEZCLA DE FIBRAS QUE VIENE DE LA RECETA
            //BUSQUEDA BASADA EN CAMPO OWOR.U_STATUS = PEDIDO 
            string infoMateriales = Logic.GlobalProcedure(AD.GCGetMaterialesPorOF, AD.RequestParameters);

            AD.RequestParameters.Clear();
            AD.RequestParameters = new Dictionary<string, string>
                {
                    {"Linea",(Linea == string.Empty ? null : Linea)},
                    {"Turno",(Turno == string.Empty ? null : Turno) },
                    {"GrupoArticulos",(GrupoArticulos == string.Empty ? null : GrupoArticulos) }
                };

            string inspecciones = Logic.GlobalProcedure(AD.GCGetInfoInspec, AD.RequestParameters);


            if (info.Contains("Error"))
            {
                return Json(new AccesoDatos.JsonResponse
                { Status = "ERROR", Message = info });
            }
            //No existe información
            else if (info.Contains("[]"))
            {
                return Json(new AccesoDatos.JsonResponse
                {
                    Status = "OK",
                    Message = "No se encontro info de consumido para Pedido: " + Pedido,
                    Data = info,
                    Data2 = infoMateriales,
                    Data3 = inspecciones
                });
            }



            var resultado =
                    Json(new AccesoDatos.JsonResponse
                    {
                        Status = "OK",
                        Message = "Información de pedido obtenida correctamente".ToString(),
                        Data = info,
                        Data2 = infoMateriales,
                        Data3 = inspecciones
                    });

            resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
            return resultado;
        }

        //Grafica 3 Linea Dia Turno (Eficiencia)
        public JsonResult GetInfoLDT(
            string Linea, string FI, string FF,
            string Alm, string NumFam)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("Linea", Linea == "" ? null : Linea);
                AD.RequestParameters.Add("FI", FI);
                AD.RequestParameters.Add("FF", FF);
                AD.RequestParameters.Add("NumF", NumFam);
                AD.RequestParameters.Add("Alm", Alm == "" ? null : Alm);

                string info = Logic.GlobalProcedure(AD.GCGetInfoLDT, AD.RequestParameters);

                //INFO PARA GRAFICA DE EFICIENCIA
                string infoEficiencia = Logic.GlobalProcedure(AD.GCGetInfoEficienciaL, AD.RequestParameters);
                //INFO POR TURNO PRODUCCION
                string infoTurnos = Logic.GlobalProcedure(AD.GCGetInfoTurnosLDT, AD.RequestParameters);
                //INFO POR TURNO DE NO CONFORME
                string infoTNC = Logic.GlobalProcedure(AD.GCGetNCTurnosLinea, AD.RequestParameters);

                if (info.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    { Status = "ERROR", Message = info });
                }
                //No existe información
                else if (info.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    {
                        Status = "OK",
                        Message = "No se encontro informacion de linea: " + Linea,
                        Data = info,
                        Data2 = infoEficiencia,
                        ExtraData = infoTurnos,
                        Other = infoTNC

                    });
                }

                //retornamos en JSON la data obtenida
                var resultado =
                    Json(new AccesoDatos.JsonResponse
                    {
                        Status = "OK",
                        Message = "Información de LDT obtenida correctamente".ToString(),
                        Data = info,
                        Data2 = infoEficiencia,
                        ExtraData = infoTurnos,
                        Other = infoTNC
                    });

                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la informacion de la linea " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        //Grafica 4 Linea Total
        public JsonResult GetInfoLT(string Linea, string FI, string FF, string numFam)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("Linea", Linea == "" ? null : Linea);
                AD.RequestParameters.Add("FI", FI);
                AD.RequestParameters.Add("FF", FF);
                AD.RequestParameters.Add("NumF", numFam);

                //Informacion de turnos por mes
                string info = Logic.GlobalProcedure(AD.GCGetInfoTurnosMesLDT, AD.RequestParameters);
                string diasLab = Logic.GlobalProcedure(AD.GCGetDiasLab, AD.RequestParameters);

                //El almacen 49 es donde siempre estan los no conformes
                AD.RequestParameters.Add("Alm", "49"); //El parametro no se usa en ningun store
                //Por ahora se dejo para no romper el codigo, pero no se usa el parametro
                //Info grafica
                string infoMes = Logic.GlobalProcedure(AD.GCGetInfoLineaMesLT, AD.RequestParameters);
                //NO CONFORME POR TURNO
                string infoNCMesTurno = Logic.GlobalProcedure(AD.GCGetNCTurnosLinea, AD.RequestParameters);
                //string infoNCMesTurno = Logic.GlobalProcedure(AD.GCGetInfoTurnosNCLDT, AD.RequestParameters);

                if (info.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    { Status = "ERROR", Message = info });
                }
                //No existe información
                else if (info.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    {
                        Status = "OK",
                        Message = "No se encontro informacion de linea: " + Linea,
                        Data = info,
                        Data2 = infoNCMesTurno,
                        ExtraData = infoMes
                    });
                }

                //retornamos en JSON la data obtenida
                var resultado =
                    Json(new AccesoDatos.JsonResponse
                    {
                        Status = "OK",
                        Message = "Información de LT obtenida correctamente".ToString(),
                        Data = info,
                        Data2 = infoNCMesTurno,
                        ExtraData = infoMes,
                        Other = diasLab
                    });

                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la informacion de la linea " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        //OBTIENE INFORMACION DE MOLIDOS, RECORTE. CONSUMIDO Y GENERADO
        public JsonResult GetInfoMolido(string Linea, string FI, string FF)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("Linea", Linea);
                AD.RequestParameters.Add("FI", FI);
                AD.RequestParameters.Add("FF", FF);

                //El store por ahora no considera el almacen 
                //AD.RequestParameters.Add("Almacen", "26");

                //MOLIDO FB , MODACRYL CONSUMIDO. Consumido se saca de las recetas
                string info = Logic.GlobalProcedure(AD.GCGetMolidoConsumidoLT, AD.RequestParameters);

                //MOLIDO FB , MODACRYL, RECORTE GENERADO. Generado segun query compartido
                //por FFIBER
                string infoGenerado = Logic.GlobalProcedure(AD.GCGetMolidoProducidoLT, AD.RequestParameters);


                if (info.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    {
                        Status = "ERROR",
                        Message = info
                    });
                }
                //No existe información
                else if (info.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    {
                        Status = "OK",
                        Message = "No se encontro información de molidos",
                        Data = info,
                        Data2 = infoGenerado
                    });
                }

                //retornamos en JSON la data obtenida
                var resultado =
                    Json(new AccesoDatos.JsonResponse
                    {
                        Status = "OK",
                        Message = "Información de molidos obtenida correctamente".ToString(),
                        Data = info,
                        Data2 = infoGenerado
                    });

                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la informacion del pedido " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        //Grafica 2 Paros Producción
        public JsonResult GetInfoParos(string FI, string FF, string Linea, string Turno, string GrupoArticulos)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>
                {
                    { "FI", FI },
                    { "FF", FF },
                    {"Linea",(Linea == string.Empty ? null : Linea)},
                    {"Turno",(Turno == string.Empty ? null : Turno) },
                    {"GrupoArticulos",(GrupoArticulos == string.Empty ? null : GrupoArticulos) }
                };

                string info = Logic.GlobalProcedure(AD.GCGetInfoParos, AD.RequestParameters);
                string parosByDay = Logic.GlobalProcedure(AD.GCGetByDayParos, AD.RequestParameters);
                //string inspecciones = Logic.GlobalProcedure(AD.GCGetInfoInspec, AD.RequestParameters);


                //No existe información
                if (info.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    {
                        Status = "OK",
                        Message = "No se encontro informacion ",
                        Data = info,
                       // Data2 = inspecciones

                    });
                }

                //retornamos en JSON la data obtenida
                var resultado =
                    Json(new AccesoDatos.JsonResponse
                    {
                        Status = "OK",
                        Message = "Información de paros obtenida correctamente".ToString(),
                        Data = info,
                        //Data2 = inspecciones,
                        ExtraData = parosByDay
                    });

                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la informacion de paros " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetInfoInspecc(string Linea, string Turno, string GrupoArticulos)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>
                {
                    {"Linea",(Linea == string.Empty ? null : Linea)},
                    {"Turno",(Turno == string.Empty ? null : Turno) },
                    {"GrupoArticulos",(GrupoArticulos == string.Empty ? null : GrupoArticulos) }
                };

                string inspecciones = Logic.GlobalProcedure(AD.GCGetInfoInspec, AD.RequestParameters);


                //No existe información
                if (inspecciones.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    {
                        Status = "OK",
                        Message = "No se encontro informacion ",
                        Data = inspecciones

                    });
                }

                //retornamos en JSON la data obtenida
                var resultado =
                    Json(new AccesoDatos.JsonResponse
                    {
                        Status = "OK",
                        Message = "Información de paros obtenida correctamente".ToString(),
                        Data = inspecciones
                    });

                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la informacion de paros " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        public JsonResult GetAlmacenes()
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                string info = Logic.GlobalProcedure(AD.GCGetAlmacenes, AD.RequestParameters);

                if (info.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    { Status = "ERROR", Message = info });
                }
                //No existe información
                else if (info.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    {
                        Status = "OK",
                        Message = "No se encontraron almacenes productivos",
                        Data = info
                    });
                }

                //retornamos en JSON la data obtenida
                var resultado =
                    Json(new AccesoDatos.JsonResponse
                    {
                        Status = "OK",
                        Message = "Información de almacenes obtenida correctamente".ToString(),
                        Data = info
                    });

                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la informacion del pedido " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }
        //SE USA PARA OBTENER EL NO CONFORME EN GRAFICA "EN PROCESO"
        public JsonResult GetStockByArt(string Alm, string Pedido)
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                AD.RequestParameters.Add("Alm", Alm);
                AD.RequestParameters.Add("Pedido", Pedido);

                string info = Logic.GlobalProcedure(AD.GCGetStockByArt, AD.RequestParameters);
                //string infoTurnos = Logic.GlobalProcedure(AD.GCGetInfoTurnosLDT, AD.RequestParameters);

                if (info.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    { Status = "ERROR", Message = info });
                }
                //No existe información
                else if (info.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    {
                        Status = "OK",
                        Message = "No se encontro informacion ",
                        Data = info
                    });
                }

                //retornamos en JSON la data obtenida
                var resultado =
                    Json(new AccesoDatos.JsonResponse
                    {
                        Status = "OK",
                        Message = "Información de paros obtenida correctamente".ToString(),
                        Data = info,
                    });

                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la informacion de paros " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }

        //OPCIONES DE FAMILIAS DE ARTICULOS EN FILTRO DE DASHBOARD
        public JsonResult GetFamiliaArt()
        {
            try
            {
                AD.RequestParameters = new Dictionary<string, string>();
                string info = Logic.GlobalProcedure(AD.GCGetInfoFamiliasDashboard, AD.RequestParameters);

                if (info.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    { Status = "ERROR", Message = info });
                }
                //No existe información
                else if (info.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse
                    {
                        Status = "OK",
                        Message = "No se encontraron las familias de articulos",
                        Data = info
                    });
                }

                //retornamos en JSON la data obtenida
                var resultado =
                    Json(new AccesoDatos.JsonResponse
                    {
                        Status = "OK",
                        Message = "Información de familias obtenida correctamente".ToString(),
                        Data = info
                    });

                resultado.MaxJsonLength = 2147483644; //Modificamos directamente el tamaño de la cadena JSON
                return resultado;
            }
            catch (Exception E)
            {
                //Devolver el error en formato JSON
                string MethodName = MethodBase.GetCurrentMethod().Name;
                string ControllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
                string msg = "No es posible obtener la informacion las familias " + MethodName + " en: " + ControllerName + ", por favor contacte al administrador del sistema con el siguiente código de error: ";
                string finalmessage = AD.Excepcion(E, msg).ToString();
                return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = finalmessage.ToString(), Data = "[]" });
            }
        }




    }
}
