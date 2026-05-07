using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(Fisfiber.App_Start.Startup))]

namespace Fisfiber.App_Start
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapSignalR();
        }
    }
}
