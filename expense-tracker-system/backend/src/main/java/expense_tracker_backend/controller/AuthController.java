package expense_tracker_backend.controller;

import expense_tracker_backend.dto.RegisterRequestDTO;
import expense_tracker_backend.dto.UserResponseDTO;
import expense_tracker_backend.model.User;
import expense_tracker_backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @PostMapping("/register")
    public UserResponseDTO register(@Valid @RequestBody RegisterRequestDTO request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));

        user.setPhone(request.getPhone());

        User savedUser = userRepository.save(user);

        return new UserResponseDTO(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getPhone()
        );
    }

    @PostMapping("/login")
    public UserResponseDTO login(@RequestBody RegisterRequestDTO request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone()
        );
    }
}