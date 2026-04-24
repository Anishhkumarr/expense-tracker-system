package expense_tracker_backend.dto;

public class MonthlyTrendDTO {

    private String month;
    private Double total;

    public MonthlyTrendDTO(String month, Double total) {
        this.month = month;
        this.total = total;
    }

    public String getMonth() { return month; }
    public Double getTotal() { return total; }
}