package expense_tracker_backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private Double amount;

    private String description;

    private LocalDate date;

    private LocalTime time;

    // ✅ Proper relationship with Category
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    // ✅ User still separate
    @Column(name = "user_id")
    private Long userId;
}