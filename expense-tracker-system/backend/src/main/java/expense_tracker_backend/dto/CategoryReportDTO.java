package expense_tracker_backend.dto;

public class CategoryReportDTO {

    private String category;
    private Double total;
    private Double percentage;

    public CategoryReportDTO(String category, Double total, Double percentage) {
        this.category = category;
        this.total = total;
        this.percentage = percentage;
    }

    public String getCategory() { return category; }
    public Double getTotal() { return total; }
    public Double getPercentage() { return percentage; }
}