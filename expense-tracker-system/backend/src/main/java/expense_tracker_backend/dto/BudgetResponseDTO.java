package expense_tracker_backend.dto;

public class BudgetResponseDTO {

    private Long id;
    private Long categoryId;
    private String month;
    private String category;
    private Double monthlyLimit;
    private Double spent;
    private Double remaining;
    private Boolean exceeded;

    public BudgetResponseDTO() {}

    public BudgetResponseDTO(
            Long id,
            Long categoryId,
            String month,
            String category,
            Double monthlyLimit,
            Double spent,
            Double remaining,
            Boolean exceeded
    ) {
        this.id = id;
        this.categoryId = categoryId;
        this.month = month;
        this.category = category;
        this.monthlyLimit = monthlyLimit;
        this.spent = spent;
        this.remaining = remaining;
        this.exceeded = exceeded;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getMonthlyLimit() {
        return monthlyLimit;
    }

    public void setMonthlyLimit(Double monthlyLimit) {
        this.monthlyLimit = monthlyLimit;
    }

    public Double getSpent() {
        return spent;
    }

    public void setSpent(Double spent) {
        this.spent = spent;
    }

    public Double getRemaining() {
        return remaining;
    }

    public void setRemaining(Double remaining) {
        this.remaining = remaining;
    }

    public Boolean getExceeded() {
        return exceeded;
    }

    public void setExceeded(Boolean exceeded) {
        this.exceeded = exceeded;
    }
}
