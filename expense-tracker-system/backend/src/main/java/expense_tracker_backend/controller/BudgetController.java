package expense_tracker_backend.controller;

import expense_tracker_backend.dto.BudgetResponseDTO;
import expense_tracker_backend.model.Budget;
import expense_tracker_backend.service.BudgetService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/budgets")
@CrossOrigin
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    // ✅ GET by userId
    @GetMapping("/user/{userId}")
    public List<BudgetResponseDTO> getBudgetsByUser(
            @PathVariable Long userId,
            @RequestParam String month) {

        return budgetService.getBudgets(userId, month);
    }

    // ✅ GET via JWT
    @GetMapping
    public List<BudgetResponseDTO> getBudgetsFromToken(
            @RequestParam(required = false) String month,
            HttpServletRequest request) {

        if (month == null) {
            month = LocalDate.now().toString().substring(0, 7);
        }

        String email = (String) request.getAttribute("userEmail");

        return budgetService.getBudgetsByEmail(email, month);
    }

    // CREATE
    @PostMapping
    public Budget createBudget(@RequestBody Budget budget) {
        return budgetService.save(budget);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Budget updateBudget(@PathVariable Long id,
                               @RequestBody Budget updated) {
        return budgetService.update(id, updated);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteBudget(@PathVariable Long id) {
        budgetService.delete(id);
    }
}