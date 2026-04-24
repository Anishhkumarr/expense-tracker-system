package expense_tracker_backend.dto;

public class TopExpenseDTO {

    private String title;
    private String category;
    private String date;
    private Double amount;

    public TopExpenseDTO(String title, String category, String date, Double amount) {
        this.title = title;
        this.category = category;
        this.date = date;
        this.amount = amount;
    }

    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public String getDate() { return date; }
    public Double getAmount() { return amount; }
}