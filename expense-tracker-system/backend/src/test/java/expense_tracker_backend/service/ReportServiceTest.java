package expense_tracker_backend.service;

import expense_tracker_backend.dto.CategoryReportDTO;
import expense_tracker_backend.repository.ExpenseRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @InjectMocks
    private ReportService reportService;

    @Test
    void getCategoryReportBuildsDtosFromCategoryQueryRows() {
        when(expenseRepository.getCategoryTotals(4L, "2026-04")).thenReturn(
                List.of(
                        new Object[]{1L, "Food", 300.0},
                        new Object[]{2L, "Travel", 150.0}
                )
        );
        when(expenseRepository.getTotalForMonth(4L, "2026-04")).thenReturn(450.0);

        List<CategoryReportDTO> result = reportService.getCategoryReport(4L, "2026-04");

        assertEquals(2, result.size());
        assertEquals("Food", result.get(0).getCategory());
        assertEquals(300.0, result.get(0).getTotal());
        assertEquals(66.66666666666666, result.get(0).getPercentage());
        assertEquals("Travel", result.get(1).getCategory());
        assertEquals(150.0, result.get(1).getTotal());
        assertEquals(33.33333333333333, result.get(1).getPercentage());
    }
}
