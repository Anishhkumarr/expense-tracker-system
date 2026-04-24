package expense_tracker_backend.repository;

import expense_tracker_backend.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserIdAndMonth(Long userId, String month);

    Optional<Budget> findByUserIdAndCategoryIdAndMonth(Long userId, Long categoryId, String month);

    boolean existsByUserIdAndCategoryIdAndMonth(
            Long userId,
            Long categoryId,
            String month
    );
}