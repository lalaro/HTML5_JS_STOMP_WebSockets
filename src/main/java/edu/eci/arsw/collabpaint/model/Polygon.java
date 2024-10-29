package edu.eci.arsw.collabpaint.model;

import java.util.ArrayList;
import java.util.List;

public class Polygon {
    private List<Point> points;

    public Polygon() {
        this.points = new ArrayList<>();
    }

    public Polygon(List<Point> points) {
        this.points = new ArrayList<>(points);
    }

    public void addPoint(Point point) {
        points.add(point);
    }

    public List<Point> getPoints() {
        return points;
    }

    public int getPointCount() {
        return points.size();
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder("Polygon: ");
        for (Point p : points) {
            sb.append("(").append(p.getX()).append(", ").append(p.getY()).append(") ");
        }
        return sb.toString();
    }

}
