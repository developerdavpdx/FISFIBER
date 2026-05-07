using IniParser;
using IniParser.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Hosting;

namespace Fisfiber.Controllers
{
    public static class IniConfigManager
    {
        private static readonly string iniPath = HostingEnvironment.MapPath("~/App_Data/confighead.ini");

        private static readonly FileIniDataParser parser = new FileIniDataParser();

        public static string LeerValor(string seccion, string clave)
        {
            IniData data = parser.ReadFile(iniPath);
            return data[seccion][clave];
        }

        public static void GuardarValor(string seccion, string clave, string valor)
        {
            IniData data = parser.ReadFile(iniPath);
            data[seccion][clave] = valor;
            parser.WriteFile(iniPath, data);
        }

        public static Dictionary<string, string> ObtenerSeccion(string seccion)
        {
            IniData data = parser.ReadFile(iniPath);
            return data[seccion]
                .Select(kvp => new KeyValuePair<string, string>(kvp.KeyName, kvp.Value))
                .ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
        }
    }
}