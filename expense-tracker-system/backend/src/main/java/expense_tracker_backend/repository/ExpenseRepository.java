package expense_tracker_backend.repository;

import expense_tracker_backend.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserId(Long userId);

    List<Expense> findByUserIdAndCategory_Id(Long userId, Long categoryId);

    // ✅ Monthly analytics query (USER BASED)
    @Query(value = """
        SELECT TO_CHAR(date, 'Mon') AS month, SUM(amount) AS total
        FROM expenses
        WHERE user_id = :userId
        GROUP BY month
        ORDER BY MIN(date)
    """, nativeQuery = true)
    List<Object[]> getMonthlyExpensesByUser(@Param("userId") Long userId);

    @Query(value = """
    SELECT c.name AS category, SUM(e.amount) AS total
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.user_id = :userId
    GROUP BY c.name
""", nativeQuery = true)
    List<Object[]> getCategorySummary(@Param("userId") Long userId);

    @Query(value = """
    SELECT e.amount, e.date, e.title, c.name
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.user_id = :userId
    ORDER BY e.amount DESC
    LIMIT 5
""", nativeQuery = true)
    List<Object[]> getTopExpenses(@Param("userId") Long userId);

    @Query("SELECT e FROM Expense e WHERE e.userId = :userId AND LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Expense> searchExpenses(@Param("userId") Long userId,
                                 @Param("keyword") String keyword);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.userId = :userId AND FUNCTION('TO_CHAR', e.date, 'YYYY-MM') = :month")
    Double getTotalForMonth(Long userId, String month);

    @Query("SELECT MAX(e.amount) FROM Expense e WHERE e.userId = :userId AND FUNCTION('TO_CHAR', e.date, 'YYYY-MM') = :month")
    Double getMaxForMonth(Long userId, String month);

    @Query("SELECT COUNT(e) FROM Expense e WHERE e.userId = :userId AND FUNCTION('TO_CHAR', e.date, 'YYYY-MM') = :month")
    Long getCountForMonth(Long userId, String month);

    @Query("SELECT COUNT(DISTINCT e.category.id) FROM Expense e WHERE e.userId = :userId AND FUNCTION('TO_CHAR', e.date, 'YYYY-MM') = :month")
    Long getCategoryCount(Long userId, String month);

    @Query("SELECT e.category.id, e.category.name, SUM(e.amount) FROM Expense e WHERE e.userId = :userId AND FUNCTION('TO_CHAR', e.date, 'YYYY-MM') = :month GROUP BY e.category.id, e.category.name ORDER BY SUM(e.amount) DESC")
    List<Object[]> getCategoryTotals(Long userId, String month);

    @Query("SELECT FUNCTION('TO_CHAR', e.date, 'Mon'), SUM(e.amount) FROM Expense e WHERE e.userId = :userId GROUP BY FUNCTION('TO_CHAR', e.date, 'Mon')")
    List<Object[]> getMonthlyTrend(Long userId);
}
