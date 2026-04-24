package expense_tracker_backend.service;

import expense_tracker_backend.dto.BudgetResponseDTO;
import expense_tracker_backend.model.Budget;
import expense_tracker_backend.model.Expense;
import expense_tracker_backend.model.User;
import expense_tracker_backend.repository.BudgetRepository;
import expense_tracker_backend.repository.ExpenseRepository;
import expense_tracker_backend.repository.CategoryRepository;

import expense_tracker_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    public List<BudgetResponseDTO> getBudgetsByEmail(String email, String month) {

        if (email == null) {
            throw new RuntimeException("Unauthorized: No user email found");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long userId = user.getId();

        return getBudgets(userId, month); // reuse existing logic
    }

    public List<BudgetResponseDTO> getBudgets(Long userId, String month) {

        List<Budget> budgets = budgetRepository.findByUserIdAndMonth(userId, month);
        List<Expense> expenses = expenseRepository.findByUserId(userId);

        return budgets.stream().map(budget -> {

            double spent = expenses.stream()
                    .filter(e -> e.getCategory() != null &&
                            e.getCategory().getId().equals(budget.getCategoryId()))
                    .filter(e -> e.getDate().toString().startsWith(month))
                    .mapToDouble(Expense::getAmount)
                    .sum();

            String categoryName = categoryRepository.findById(budget.getCategoryId())
                    .map(c -> c.getName())
                    .orElse("Unknown");

            BudgetResponseDTO dto = new BudgetResponseDTO();
            dto.setId(budget.getId());
            dto.setCategoryId(budget.getCategoryId());
            dto.setMonth(budget.getMonth());
            dto.setCategory(categoryName);
            dto.setMonthlyLimit(budget.getMonthlyLimit());
            dto.setSpent(spent);
            dto.setExceeded(spent > budget.getMonthlyLimit());
            double remaining = budget.getMonthlyLimit() - spent;
            dto.setRemaining(Math.max(remaining, 0));

            return dto;

        }).toList();
    }

    public Budget save(Budget budget) {

        boolean exists = budgetRepository.existsByUserIdAndCategoryIdAndMonth(
                budget.getUserId(),
                budget.getCategoryId(),
                budget.getMonth()
        );

        if (exists) {
            throw new RuntimeException("Budget already exists for this category and month");
        }

        return budgetRepository.save(budget);
    }

    public Budget update(Long id, Budget updated) {

        Budget existing = budgetRepository.findById(id).orElseThrow();

        // 🔥 DUPLICATE CHECK
        boolean exists = budgetRepository.existsByUserIdAndCategoryIdAndMonth(
                existing.getUserId(),
                existing.getCategoryId(),
                existing.getMonth()
        );

        if (exists && !existing.getId().equals(id)) {
            throw new RuntimeException("Duplicate budget exists");
        }

        // update fields
        existing.setMonthlyLimit(updated.getMonthlyLimit());

        return budgetRepository.save(existing);
    }


    public void delete(Long id) {
        budgetRepository.deleteById(id);
    }
}
