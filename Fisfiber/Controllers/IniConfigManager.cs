using IniParser;
using IniParser.Model;
using System;
using System.Collections.Generic;
using System.IO;
using System.Web.Hosting;

namespace Fisfiber.Controllers
{
    /// <summary>
    /// Lectura/escritura tolerante del INI de encabezados ISO.
    /// Si el archivo, la seccion o la clave no existen, devuelve un valor por
    /// defecto en lugar de lanzar una excepcion: una vista nunca debe caerse
    /// por un INI ausente o corrupto.
    /// </summary>
    public static class IniConfigManager
    {
        private static readonly string iniPath = HostingEnvironment.MapPath("~/App_Data/confighead.ini");

        private static readonly FileIniDataParser parser = new FileIniDataParser();

        // El parser no es thread-safe y el archivo se lee/escribe desde varias peticiones.
        private static readonly object sync = new object();

        public static string LeerValor(string seccion, string clave, string valorPorDefecto = null)
        {
            string porDefecto = valorPorDefecto ?? ValorPorDefecto(seccion, clave);

            try
            {
                lock (sync)
                {
                    if (!File.Exists(iniPath))
                        return porDefecto;

                    IniData data = parser.ReadFile(iniPath);

                    if (!data.Sections.ContainsSection(seccion))
                        return porDefecto;

                    KeyDataCollection claves = data.Sections[seccion];
                    if (!claves.ContainsKey(clave))
                        return porDefecto;

                    string valor = claves[clave];
                    return string.IsNullOrWhiteSpace(valor) ? porDefecto : valor;
                }
            }
            catch
            {
                // Archivo bloqueado, INI mal formado, etc. La vista sigue funcionando.
                return porDefecto;
            }
        }

        public static void GuardarValor(string seccion, string clave, string valor)
        {
            if (string.IsNullOrWhiteSpace(seccion) || string.IsNullOrWhiteSpace(clave))
                return;

            lock (sync)
            {
                IniData data;

                if (File.Exists(iniPath))
                {
                    data = parser.ReadFile(iniPath);
                }
                else
                {
                    string carpeta = Path.GetDirectoryName(iniPath);
                    if (!string.IsNullOrEmpty(carpeta) && !Directory.Exists(carpeta))
                        Directory.CreateDirectory(carpeta);

                    data = new IniData();
                }

                if (!data.Sections.ContainsSection(seccion))
                    data.Sections.AddSection(seccion);

                data[seccion][clave] = valor ?? string.Empty;

                parser.WriteFile(iniPath, data);
            }
        }

        public static Dictionary<string, string> ObtenerSeccion(string seccion)
        {
            Dictionary<string, string> resultado = new Dictionary<string, string>();

            try
            {
                lock (sync)
                {
                    if (!File.Exists(iniPath))
                        return resultado;

                    IniData data = parser.ReadFile(iniPath);

                    if (!data.Sections.ContainsSection(seccion))
                        return resultado;

                    foreach (KeyData clave in data.Sections[seccion])
                        resultado[clave.KeyName] = clave.Value;
                }
            }
            catch
            {
                // Se devuelve lo que se haya alcanzado a leer.
            }

            return resultado;
        }

        /// <summary>
        /// Valores por defecto cuando el INI no existe. Las claves de fecha
        /// deben devolver una fecha valida porque las vistas hacen Convert.ToDateTime().
        /// Ojo: el nombre de la seccion es el que contiene "Fecha" (p. ej. Monitor_FechaLiberacion),
        /// la clave siempre es "Valor".
        /// </summary>
        private static string ValorPorDefecto(string seccion, string clave)
        {
            bool esFecha =
                (!string.IsNullOrEmpty(clave) && clave.IndexOf("Fecha", StringComparison.OrdinalIgnoreCase) >= 0) ||
                (!string.IsNullOrEmpty(seccion) && seccion.IndexOf("Fecha", StringComparison.OrdinalIgnoreCase) >= 0);

            if (esFecha)
                return DateTime.Today.ToString("yyyy-MM-dd");

            return string.Empty;
        }
    }
}
