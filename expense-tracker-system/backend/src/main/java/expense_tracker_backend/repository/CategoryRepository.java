package expense_tracker_backend.repository;

import expense_tracker_backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Prevent duplicate category names
    boolean existsByNameIgnoreCase(String name);

    // Get all categories sorted
    List<Category> findAllByOrderByNameAsc();
}