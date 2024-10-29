package edu.eci.arsw.collabpaint;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import edu.eci.arsw.collabpaint.model.Point; // Ajusta esta ruta según la ubicación real de Point
import edu.eci.arsw.collabpaint.model.Polygon;

@Controller
public class STOMPMessagesHandler {

    private static final Logger logger = LoggerFactory.getLogger(STOMPMessagesHandler.class);

    @Autowired
    SimpMessagingTemplate msgt;

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        // Log para confirmar que el método se está ejecutando
        logger.info("handlePointEvent llamado con punto: " + pt + " y numdibujo: " + numdibujo);

        // Imprimir el punto recibido
        System.out.println("Nuevo punto recibido en el servidor!: " + pt);

        // Reenviar el punto al tópico al que están suscritos los clientes
        msgt.convertAndSend("/topic/newpoint." + numdibujo, pt);
    }

    private void checkAndPublishPolygon(String numdibujo) {
        lock.lock();
        try {
            List<Point> points = pointsMap.get(numdibujo);
            if (points != null && points.size() >= 3) {
                // Crear un polígono y publicarlo
                Polygon polygon = new Polygon(new ArrayList<>(points));
                msgt.convertAndSend("/topic/newpolygon." + numdibujo, polygon);
                // Limpiar los puntos después de publicar el polígono
                points.clear();
            }
        } finally {
            lock.unlock();
        }
    }

    @MessageMapping("/newpolygon.{numdibujo}")
    @SendTo("/topic/newpolygon.{numdibujo}")
    public Polygon handlePolygon(Polygon polygon) {
        return polygon;  // Enviará el objeto Polygon a todos los clientes suscritos
    }

}
