package expense_tracker_backend.dto;

public class ReportSummaryDTO {

    private Double totalSpending;
    private Double average;
    private Double highest;
    private Long transactionCount;
    private Long categoryCount;

    public ReportSummaryDTO(Double totalSpending, Double average,
                            Double highest, Long transactionCount,
                            Long categoryCount) {
        this.totalSpending = totalSpending;
        this.average = average;
        this.highest = highest;
        this.transactionCount = transactionCount;
        this.categoryCount = categoryCount;
    }

    public Double getTotalSpending() { return totalSpending; }
    public Double getAverage() { return average; }
    public Double getHighest() { return highest; }
    public Long getTransactionCount() { return transactionCount; }
    public Long getCategoryCount() { return categoryCount; }
}