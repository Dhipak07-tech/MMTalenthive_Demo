package com.managemyopz.recognition.repository;

import com.managemyopz.recognition.entity.RecognitionPointsWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecognitionPointsWalletRepository extends JpaRepository<RecognitionPointsWallet, UUID> {
    Optional<RecognitionPointsWallet> findByEmployeeId(UUID employeeId);
}
