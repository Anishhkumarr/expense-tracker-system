package expense_tracker_backend.model;
import jakarta.persistence.Entity;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
@Entity
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long categoryId;
    private Double monthlyLimit;
    private String month;

    // ✅ ADD THESE

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getCategoryId() { return categoryId; }
    public Double getMonthlyLimit() { return monthlyLimit; }
    public String getMonth() { return month; }

    public void setId(Long id) { this.id = id; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public void setMonthlyLimit(Double monthlyLimit) { this.monthlyLimit = monthlyLimit; }
    public void setMonth(String month) { this.month = month; }
}