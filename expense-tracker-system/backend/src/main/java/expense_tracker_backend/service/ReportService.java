package expense_tracker_backend.service;

import expense_tracker_backend.dto.*;
import expense_tracker_backend.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReportService {

    @Autowired
    private ExpenseRepository expenseRepository;

    public ReportSummaryDTO getSummary(Long userId, String month) {

        Double total = expenseRepository.getTotalForMonth(userId, month);
        Double max = expenseRepository.getMaxForMonth(userId, month);
        Long count = expenseRepository.getCountForMonth(userId, month);
        Long categoryCount = expenseRepository.getCategoryCount(userId, month);

        if (total == null) total = 0.0;
        if (max == null) max = 0.0;
        if (count == null) count = 0L;

        Double avg = count > 0 ? total / count : 0;

        return new ReportSummaryDTO(total, avg, max, count, categoryCount);
    }

    public List<CategoryReportDTO> getCategoryReport(Long userId, String month) {

        List<Object[]> data = expenseRepository.getCategoryTotals(userId, month);
        Double total = expenseRepository.getTotalForMonth(userId, month);

        List<CategoryReportDTO> result = new ArrayList<>();

        for (Object[] row : data) {
            String name = row[1] != null ? row[1].toString() : "Unknown";
            Double amount = row[2] instanceof Number
                    ? ((Number) row[2]).doubleValue()
                    : 0.0;

            double percentage = (total != null && total > 0)
                    ? (amount / total) * 100
                    : 0;

            result.add(new CategoryReportDTO(name, amount, percentage));
        }

        return result;
    }

    public List<MonthlyTrendDTO> getTrend(Long userId) {

        List<Object[]> data = expenseRepository.getMonthlyTrend(userId);

        List<MonthlyTrendDTO> result = new ArrayList<>();

        for (Object[] row : data) {
            result.add(new MonthlyTrendDTO((String) row[0], (Double) row[1]));
        }

        return result;
    }
}
