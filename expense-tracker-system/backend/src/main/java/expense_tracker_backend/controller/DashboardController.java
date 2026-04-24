package expense_tracker_backend.controller;

import expense_tracker_backend.dto.MonthlyExpenseDTO;
import expense_tracker_backend.model.Expense;
import expense_tracker_backend.repository.CategoryRepository;
import expense_tracker_backend.repository.ExpenseRepository;
import expense_tracker_backend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import expense_tracker_backend.dto.CategoryExpenseDTO;
import expense_tracker_backend.dto.TopExpenseDTO;

import java.util.*;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin
public class DashboardController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private DashboardService dashboardService;

    // ✅ Dashboard summary (basic)
    @GetMapping("/{userId}")
    public Map<String, Object> getDashboard(@PathVariable Long userId) {

        List<Expense> expenses = expenseRepository.findByUserId(userId);

        double totalAmount = 0;
        int totalCount = expenses.size();

        Map<String, Double> categoryTotals = new HashMap<>();

        for (Expense e : expenses) {
            totalAmount += e.getAmount();

            // ✅ DIRECT access (NO DB call)
            String categoryName = (e.getCategory() != null)
                    ? e.getCategory().getName()
                    : "Unknown";

            categoryTotals.put(
                    categoryName,
                    categoryTotals.getOrDefault(categoryName, 0.0) + e.getAmount()
            );
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalAmount", totalAmount);
        response.put("totalCount", totalCount);
        response.put("categoryBreakdown", categoryTotals);

        return response;
    }

    // ✅ Monthly summary (CORRECT way - DB aggregation)
    @GetMapping("/monthly-summary/{userId}")
    public List<MonthlyExpenseDTO> getMonthlySummary(@PathVariable Long userId) {
        return dashboardService.getMonthlySummary(userId);
    }

    // ✅ Category summary (CORRECT way - DB aggregation)
    @GetMapping("/category-summary/{userId}")
    public List<CategoryExpenseDTO> getCategorySummary(@PathVariable Long userId) {
        return dashboardService.getCategorySummary(userId);
    }

    @GetMapping("/top-expenses/{userId}")
    public List<TopExpenseDTO> getTopExpenses(@PathVariable Long userId) {
        return dashboardService.getTopExpenses(userId);
    }
}