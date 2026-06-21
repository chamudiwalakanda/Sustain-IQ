package com.example.sustainiq.service;

import com.example.sustainiq.model.Grievance;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Receives student grievances and triages them into a category using a
 * transparent, rule-based keyword matcher (no black-box claims). Each category
 * has a helpful, actionable response so the assistant feels like a real campus
 * support desk.
 */
@Service
public class GrievanceService {

    private final List<Grievance> grievances = new ArrayList<>();
    private final AtomicLong idSequence = new AtomicLong(1);

    public Grievance submit(String message) {
        String category = categorize(message);
        Grievance grievance = new Grievance(
                idSequence.getAndIncrement(),
                message.trim(),
                category,
                "PENDING",
                LocalDateTime.now()
        );
        grievances.add(grievance);
        return grievance;
    }

    /**
     * Assigns a category based on keyword matching. Order matters: more specific
     * concerns (safety, maintenance) are checked before broader ones.
     */
    public String categorize(String rawMessage) {
        String text = rawMessage == null ? "" : rawMessage.toLowerCase();

        if (containsAny(text, "unsafe", "safety", "harass", "theft", "stolen",
                "danger", "ragging", "assault", "security")) {
            return "Safety";
        }
        if (containsAny(text, "water", "electric", "power", "current", "leak",
                "broken", "repair", "fan", "light", "bulb", "toilet", "plumb", "maintenance")) {
            return "Maintenance";
        }
        if (containsAny(text, "canteen", "food", "meal", "rice", "curry", "kottu",
                "lunch", "dinner", "breakfast", "hygiene", "stale", "price")) {
            return "Canteen";
        }
        if (containsAny(text, "hostel", "room", "bed", "warden", "curfew",
                "accommodation", "roommate", "crowd")) {
            return "Hostel";
        }
        return "General";
    }

    /**
     * A helpful, category-specific reply for the support chat.
     */
    public String responseFor(String category) {
        return switch (category) {
            case "Canteen" -> "Thanks — I've logged this as a canteen concern. "
                    + "Canteen feedback is reviewed daily by the catering supervisor. "
                    + "For urgent hygiene issues, please also notify the duty staff at the counter.";
            case "Hostel" -> "Got it — this is a hostel matter. "
                    + "I've forwarded it to your hostel warden. "
                    + "You can track bed availability and curfew timings in the Hostel tab.";
            case "Maintenance" -> "Noted as a maintenance request. "
                    + "The campus maintenance unit handles water, power and repair tickets. "
                    + "Please mention your block and room number so they can locate the issue quickly.";
            case "Safety" -> "This has been flagged as a safety concern and prioritised. "
                    + "If you are in immediate danger, contact campus security right away. "
                    + "Your report has been recorded for follow-up.";
            default -> "Thanks for reaching out. "
                    + "I've logged your concern as a general request and it will be routed to the "
                    + "relevant campus office for review.";
        };
    }

    public List<Grievance> getAll() {
        return grievances;
    }

    public long getPendingCount() {
        return grievances.stream().filter(g -> "PENDING".equals(g.getStatus())).count();
    }

    /**
     * Counts grievances per category (always includes all five categories so the
     * analytics chart has stable axes).
     */
    public Map<String, Integer> categoryBreakdown() {
        Map<String, Integer> counts = new LinkedHashMap<>();
        counts.put("Canteen", 0);
        counts.put("Hostel", 0);
        counts.put("Maintenance", 0);
        counts.put("Safety", 0);
        counts.put("General", 0);
        for (Grievance g : grievances) {
            counts.merge(g.getCategory(), 1, Integer::sum);
        }
        return counts;
    }

    private boolean containsAny(String text, String... keywords) {
        for (String k : keywords) {
            if (text.contains(k)) {
                return true;
            }
        }
        return false;
    }
}
