using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Fisfiber.Models
{
    public class UpdateDataRequest
    {
        public string pedido { get; set; }
        public int rollos { get; set; }
    }

    public class  EntregaM
    {
        public string DocEntryEntrega { get; set; }
    }


    public class UpdateTendRequest
    {
        public string absentry { get; set; }
        public string articulo { get; set; }
    }
}