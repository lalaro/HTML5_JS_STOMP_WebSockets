var app = (function () {

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    class Polygon {
        constructor(points) {
            this.points = points; // Array de objetos Point
        }
    }

    var stompClient = null;
    var currentPointSubscription = null; // Para la suscripción activa de puntos
    var currentPolygonSubscription = null; // Para la suscripción activa de polígonos
    var pointsMap = New Map();

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.stroke();
    };

    var addPolygonToCanvas = function (polygon) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();

        ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
        polygon.points.forEach((point, index) => {
            if (index > 0) {
                ctx.lineTo(point.x, point.y);
            }
        });

        // Cerrar el polígono
        ctx.closePath();
        ctx.fillStyle = "blue";
        ctx.fill();
        ctx.stroke();
    };

    return {
        connect: function (id) {
            console.info('Connecting to WS...');
            var socket = new SockJS('/stompendpoint');
            stompClient = Stomp.over(socket);
            stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);

                if (currentPointSubscription !== null) {
                    currentPointSubscription.unsubscribe();
                    console.info("Unsubscribed from previous point topic.");
                }

                currentPointSubscription = stompClient.subscribe('/topic/newpoint.' + id, function (eventbody) {
                    var pointData = JSON.parse(eventbody.body);
                    var receivedPoint = new Point(pointData.x, pointData.y);
                    addPointToCanvas(receivedPoint);
                    // Agregar el punto al mapa
                    if (!pointsMap.has(id)) {
                        pointsMap.set(id, []);
                    }
                    pointsMap.get(id).push(receivedPoint);

                    // Verificar si se pueden formar suficientes puntos para un polígono
                    if (pointsMap.get(id).length >= 3) {
                        const polygonPoints = pointsMap.get(id).slice(); // Copia de los puntos
                        const polygon = new Polygon(polygonPoints);
                        addPolygonToCanvas(polygon);
                        // Publicar el polígono
                        stompClient.send("/app/newpolygon." + id, {}, JSON.stringify(polygon));
                        // Limpiar puntos después de publicar
                        pointsMap.set(id, []);
                    }
                });
                console.info("Subscribed to /topic/newpoint." + id);

                if (currentPolygonSubscription !== null) {
                    currentPolygonSubscription.unsubscribe();
                    console.info("Unsubscribed from previous polygon topic.");
                }

                currentPolygonSubscription = stompClient.subscribe('/topic/newpolygon.' + id, function (eventbody) {
                    var polygonData = JSON.parse(eventbody.body);
                    var points = polygonData.points.map(p => new Point(p.x, p.y));
                    var receivedPolygon = new Polygon(points);
                    addPolygonToCanvas(receivedPolygon);
                });
                console.info("Subscribed to /topic/newpolygon." + id);
            });
        },

        publishPoint: function (px, py, id) {
            if (stompClient === null) {
                console.warn("STOMP client is not connected. Unable to publish point.");
                return;
            }
            var pt = new Point(px, py);
            console.info("Publishing point at " + pt.x + ", " + pt.y);
            addPointToCanvas(pt);
            stompClient.send("/app/newpoint." + id, {}, JSON.stringify(pt));
        },

        publishPolygon: function (points, id) {
            if (stompClient === null) {
                console.warn("STOMP client is not connected. Unable to publish polygon.");
                return;
            }
            var polygon = { points: points };
            console.info("Publishing polygon with " + points.length + " points.");
            stompClient.send("/app/newpolygon." + id, {}, JSON.stringify(polygon));
        },

        disconnect: function () {
            if (stompClient !== null) {
                if (currentPointSubscription !== null) {
                    currentPointSubscription.unsubscribe();
                    currentPointSubscription = null;
                }
                if (currentPolygonSubscription !== null) {
                    currentPolygonSubscription.unsubscribe();
                    currentPolygonSubscription = null;
                }
                stompClient.disconnect();
                stompClient = null;
            }
            console.log("Disconnected");
        }
    };
})();
