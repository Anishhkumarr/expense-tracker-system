package expense_tracker_backend.dto;

public class CategoryExpenseDTO {

    private String category;
    private Double total;

    public CategoryExpenseDTO(String category, Double total) {
        this.category = category;
        this.total = total;
    }

    public String getCategory() {
        return category;
    }

    public Double getTotal() {
        return total;
    }
}