package expense_tracker_backend.controller;

import expense_tracker_backend.dto.ExpenseRequestDTO;
import expense_tracker_backend.model.Category;
import expense_tracker_backend.model.Expense;
import expense_tracker_backend.repository.CategoryRepository;
import expense_tracker_backend.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/expenses")
@CrossOrigin
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // ✅ Get all expenses by user
    @GetMapping("/user/{userId}")
    public List<Expense> getAllExpenses(@PathVariable Long userId) {
        return expenseRepository.findByUserId(userId);
    }

    // ✅ Get single expense by ID
    @GetMapping("/{id}")
    public Expense getExpenseById(@PathVariable Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));
    }

    // ✅ Search expenses
    @GetMapping("/user/{userId}/search")
    public List<Expense> searchExpenses(@PathVariable Long userId,
                                        @RequestParam String keyword) {
        return expenseRepository.searchExpenses(userId, keyword);
    }

    // ✅ Filter by category (UPDATED)
    @GetMapping("/user/{userId}/category/{categoryId}")
    public List<Expense> getByCategory(@PathVariable Long userId,
                                       @PathVariable Long categoryId) {
        return expenseRepository.findByUserIdAndCategory_Id(userId, categoryId);
    }

    // ✅ Add expense (FIXED)
    @PostMapping
    public Expense addExpense(@RequestBody ExpenseRequestDTO dto) {

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Expense expense = new Expense();
        expense.setTitle(dto.getTitle());
        expense.setAmount(dto.getAmount());
        expense.setDescription(dto.getDescription());
        expense.setDate(dto.getDate());
        expense.setTime(dto.getTime());
        expense.setCategory(category);   // ✅ relationship
        expense.setUserId(dto.getUserId());

        return expenseRepository.save(expense);
    }

    @PutMapping("/{id}")
    public Expense updateExpense(@PathVariable Long id,
                                 @RequestBody ExpenseRequestDTO dto) {

        Expense existing = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        existing.setTitle(dto.getTitle());
        existing.setAmount(dto.getAmount());
        existing.setDescription(dto.getDescription());
        existing.setDate(dto.getDate());
        existing.setTime(dto.getTime());
        existing.setCategory(category);  // ✅ relationship
        existing.setUserId(dto.getUserId());

        return expenseRepository.save(existing);
    }

    // ✅ Delete expense
    @DeleteMapping("/{id}")
    public String deleteExpense(@PathVariable Long id) {

        if (!expenseRepository.existsById(id)) {
            throw new RuntimeException("Expense not found with id: " + id);
        }

        expenseRepository.deleteById(id);
        return "Expense deleted successfully";
    }
}