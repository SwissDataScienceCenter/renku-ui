# WebSocket

WebSocket allows bi-directional communication between the UI server and the UI client.
In our infrastructure, the client sends messages with a specific structure that the
server interprets as instructions. Most of the time, the instructions start a loop
that performs actions on behalf of the user at specific intervals (5 seconds or 3
minutes).

You can find more details on the [server side section](../../../server/src/websocket/) about WebSockets.

## Disconnections

The WebSocket channels are now reasonably stable, staying alive for hours.
Still, it's good practice to consider the connection unstable when developing new code
involving WebSockets. This means the code should handle connections being temporarily
interrupted and re-created.

## Issues

We had issues with WebSockets channels being dropped after a few minutes. Intervals were irregular, with an average duration between 5 and 10 minutes.

In RenkuLab, we have a complex network topology; an incoming connection goes through:
* [HAproxy](https://www.haproxy.com): load balancing the incoming connections.
* Namespace-wide [Nginx](https://www.nginx.com): routing the requests from the outer
  network to local pods.
* UI [Nginx](https://www.nginx.com): serving the UI responses

It turned out we had to modify a setting on the namespace Nginx to keep connections
alive for longer, precisely the `worker_shutdown_timeout` setting
([reference](https://github.com/kubernetes/ingress-nginx/issues/2461)).
We decided to raise it, aiming to keep connections alive for ~12 hours.
