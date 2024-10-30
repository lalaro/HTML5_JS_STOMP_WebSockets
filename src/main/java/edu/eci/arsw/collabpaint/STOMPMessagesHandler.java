package edu.eci.arsw.collabpaint;

import edu.eci.arsw.collabpaint.model.Point;
import edu.eci.arsw.collabpaint.model.Polygon;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class STOMPMessagesHandler {

    private static final Logger logger = LoggerFactory.getLogger(STOMPMessagesHandler.class);

    @Autowired
    SimpMessagingTemplate msgt;
    private final Map<String, List<Point>> pointsByDrawing = new ConcurrentHashMap<>();

    @MessageMapping("/newpoint.{numdibujo}")
    public synchronized void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        logger.info("handlePointEvent llamado con punto: " + pt + " y numdibujo: " + numdibujo);
        pointsByDrawing.putIfAbsent(numdibujo, new ArrayList<>());
        List<Point> points = pointsByDrawing.get(numdibujo);

        synchronized (points) {
            points.add(pt);
            msgt.convertAndSend("/topic/newpoint." + numdibujo, pt);
            if (points.size() >= 4) {
                Polygon polygon = new Polygon(new ArrayList<>(points));  // Crear el polígono
                points.clear();
                msgt.convertAndSend("/topic/newpolygon." + numdibujo, polygon);
                logger.info("Publicado polígono para el dibujo " + numdibujo);
            }
        }
    }
}
