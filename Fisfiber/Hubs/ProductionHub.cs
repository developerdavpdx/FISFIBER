using Microsoft.AspNet.SignalR;

public class ProductionHub : Hub
{
    public void NotifyUpdate()
    {
        // Envía la señal a todos los clientes conectados
        Clients.All.updateProduction();
    }
}
