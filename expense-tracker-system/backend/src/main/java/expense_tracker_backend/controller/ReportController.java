package expense_tracker_backend.controller;

import expense_tracker_backend.dto.*;
import expense_tracker_backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reports")
@CrossOrigin
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/summary/{userId}")
    public ReportSummaryDTO getSummary(@PathVariable Long userId,
                                       @RequestParam String month) {
        return reportService.getSummary(userId, month);
    }

    @GetMapping("/category/{userId}")
    public List<CategoryReportDTO> getCategory(@PathVariable Long userId,
                                               @RequestParam String month) {
        return reportService.getCategoryReport(userId, month);
    }

    @GetMapping("/trend/{userId}")
    public List<MonthlyTrendDTO> getTrend(@PathVariable Long userId) {
        return reportService.getTrend(userId);
    }
}