package expense_tracker_backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ExpenseRequestDTO {

    private String title;
    private Double amount;
    private String description;
    private LocalDate date;
    private LocalTime time;

    private Long categoryId;  // 👈 IMPORTANT
    private Long userId;
}