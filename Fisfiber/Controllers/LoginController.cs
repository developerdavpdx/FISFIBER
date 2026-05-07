using DocumentFormat.OpenXml.Math;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Text;
using System.Web.Mvc;
using System.Web.Security;

namespace Fisfiber.Controllers
{
    public class LoginController : Controller
    {
        /// <summary>
        ///Instancia de clase que permite el acceso a los datos del negocio
        /// </summary>
        AccesoDatos AccesoDatos = new AccesoDatos();


        /// <summary>
        /// Vista Login
        /// </summary>
        /// <returns>View("Login")</returns>
        public ActionResult Index()
        {
            return View();
        }


        /// <summary>
        /// Método utilizado para validar las credenciales de usuario, con los parámetros que engloblan este método.
        /// </summary>
        /// <param name="email"></param>
        /// <param name="password"></param>
        /// <returns>return Json(new { status = "OK", message = "Inicio de sesión exitoso", data = AccessResult });</returns>
        public JsonResult validarUsuario(string email, string password)
        {
            try
            {
                // 1. Validación de entrada
                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "Email y contraseña son requeridos." });
                }

                // 2. Preparar el diccionario de parámetros de usuario
                Dictionary<string, string> UserData = new Dictionary<string, string>
                {
                    { "email", email },
                    { "password", password }
                };

                // 3. Ejecutar la consulta
                string acceso = AccesoDatos.ExecuteProcedure(AccesoDatos.GCValidaUsuarios, UserData);

                // string user = JsonConvert.SerializeObject(acceso);


                // 4. Validación del acceso
                if (acceso.Contains("Error"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = acceso });
                }
                //No existe acceso
                else if (acceso.Contains("[]"))
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "No pudimos completar el inicio de sesión, valida tus credenciales." });
                }


                dynamic user = JsonConvert.DeserializeObject<dynamic>(acceso);

                int ano = int.Parse(ConfigurationManager.AppSettings["FVAno"].ToString());
                int mes = int.Parse(ConfigurationManager.AppSettings["FVMes"].ToString());
                int dia = int.Parse(ConfigurationManager.AppSettings["FVDia"].ToString());
                // 5. Definir la fecha de vencimiento FIJA en el código
                DateTime fechaVencimiento = new DateTime(ano, mes, dia); // Fecha límite establecida
                //30 Abril 2025

                if (DateTime.Now > fechaVencimiento)
                {
                    return Json(new AccesoDatos.JsonResponse { Status = "ERROR", Message = "Su acceso ha vencido. Contacte al administrador." });
                }

                Session["email"] = user[0].email;
                Session["empleado"] = user[0].empleado;
                Session["u_perfil"] = user[0].u_perfil; // Ejemplo: "Admin", "Usuario"

                // Si la validación del acceso es correcta, puedes continuar con el flujo lógico
                return Json(new AccesoDatos.JsonResponse { Status = "OK", Message = "Inicio de sesión exitoso", Data = acceso });

            }

            catch (Exception E)
            {
                // 6. Obtener el número de línea del error
                var lineNumber = (new System.Diagnostics.StackTrace(E, true)).GetFrame(0).GetFileLineNumber();

                // 7. Crear un mensaje de error detallado
                StringBuilder sb = new StringBuilder();
                sb.Append("No es posible iniciar sesión, por favor contacte al administrador del sistema con el siguiente código de error: ");
                sb.Append(E.Message);
                sb.Append($" (Línea: {lineNumber})");

                // 8. Devolver el error en formato JSON
                return Json(new { Status = "ERROR", Message = sb.ToString(), Data = string.Empty });
            }
        }

        /// <summary>
        /// Método utilizado para cerrar la sesión de usuario, con los parámetros que engloblan este método.
        /// </summary>
        /// <returns>return Json(new { status = "OK", message = "Inicio de sesión cerrado correctamente"});</returns>
        public ActionResult CerrarSesion()
        {
            try
            {
                // Cerrar la sesión del usuario
                FormsAuthentication.SignOut();
                // Limpiar la sesión
                Session.Clear();
                Session.Abandon();
                // Si la validación del acceso es correcta, puedes continuar con el flujo lógico
                return RedirectToAction("Index", "Login");
            }

            catch (Exception E)
            {
                // 6. Obtener el número de línea del error
                var lineNumber = (new System.Diagnostics.StackTrace(E, true)).GetFrame(0).GetFileLineNumber();
                // 7. Crear un mensaje de error detallado
                StringBuilder sb = new StringBuilder();
                sb.Append("No es posible cerrar la sesión, por favor contacte al administrador del sistema con el siguiente código de error: ");
                sb.Append(E.Message);
                sb.Append($" (Línea: {lineNumber})");
                // 8. Devolver el error en formato JSON
                return Json(new { status = "ERROR", message = sb.ToString() });
            }
        }


       
    }
}
