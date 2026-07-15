using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Fisfiber.Models
{
    public class ReservaPolietilenoDto
    {
        public string PlanProduccion { get; set; }
        public string OrdenFabricacion { get; set; }
        public string Pedido { get; set; }
        public string Linea { get; set; }
        public decimal BasculaPeso { get; set; }
        public string Empleado { get; set; }
    }
}