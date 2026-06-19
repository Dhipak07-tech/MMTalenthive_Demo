package com.managemyopz.recognition.service;

import com.managemyopz.recognition.entity.*;
import com.managemyopz.recognition.repository.*;
import com.managemyopz.shared.entity.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecognitionService {

    private final RecognitionRepository recognitionRepository;
    private final RecognitionValueRepository recognitionValueRepository;
    private final RecognitionTypeRepository recognitionTypeRepository;
    private final RecognitionCommentRepository recognitionCommentRepository;
    private final RecognitionReactionRepository recognitionReactionRepository;
    private final RecognitionPointsWalletRepository recognitionPointsWalletRepository;
    private final RecognitionPointsTransactionRepository recognitionPointsTransactionRepository;
    private final RewardCatalogRepository rewardCatalogRepository;
    private final RewardRedemptionRepository rewardRedemptionRepository;
    private final AwardProgramRepository awardProgramRepository;
    private final AwardNominationRepository awardNominationRepository;

    // --- Core Values Engine ---
    public List<RecognitionValue> getValues() {
        return recognitionValueRepository.findByStatus("ACTIVE");
    }

    public RecognitionValue createValue(RecognitionValue value) {
        if (value.getTenantId() == null) {
            value.setTenantId("default");
        }
        return recognitionValueRepository.save(value);
    }

    // --- Recognition Types ---
    public List<RecognitionType> getTypes() {
        return recognitionTypeRepository.findByStatus("ACTIVE");
    }

    public RecognitionType createType(RecognitionType type) {
        if (type.getTenantId() == null) {
            type.setTenantId("default");
        }
        return recognitionTypeRepository.save(type);
    }

    // --- Points Economy Wallet ---
    public RecognitionPointsWallet getOrCreateWallet(UUID employeeId) {
        return recognitionPointsWalletRepository.findByEmployeeId(employeeId)
                .orElseGet(() -> {
                    RecognitionPointsWallet wallet = RecognitionPointsWallet.builder()
                            .employeeId(employeeId)
                            .currentBalance(500) // Default starting gift points
                            .monthlyAllocation(100)
                            .used(0)
                            .remaining(100)
                            .expired(0)
                            .build();
                    wallet.setTenantId("default");
                    return recognitionPointsWalletRepository.save(wallet);
                });
    }

    @Transactional
    public void resetMonthlyBudgets() {
        List<RecognitionPointsWallet> wallets = recognitionPointsWalletRepository.findAll();
        for (RecognitionPointsWallet wallet : wallets) {
            wallet.setExpired(wallet.getExpired() + wallet.getRemaining());
            wallet.setRemaining(wallet.getMonthlyAllocation());
            wallet.setUsed(0);
            recognitionPointsWalletRepository.save(wallet);
        }
    }

    // --- Give Recognition ---
    @Transactional
    public Recognition giveRecognition(UUID giverId, UUID receiverId, UUID valueId, UUID typeId,
                                      String title, String message, int points, String visibility,
                                      String tags, String projectRef, String businessImpact, String actor) {
        if (giverId.equals(receiverId)) {
            throw new IllegalArgumentException("You cannot recognize yourself.");
        }
        if (points <= 0) {
            throw new IllegalArgumentException("Recognition points must be greater than zero.");
        }

        RecognitionPointsWallet giverWallet = getOrCreateWallet(giverId);
        RecognitionPointsWallet receiverWallet = getOrCreateWallet(receiverId);

        if (giverWallet.getRemaining() < points) {
            throw new IllegalArgumentException("Insufficient budget. Remaining budget is " + giverWallet.getRemaining() + " points.");
        }

        // Deduct points from giver
        giverWallet.setRemaining(giverWallet.getRemaining() - points);
        giverWallet.setUsed(giverWallet.getUsed() + points);
        recognitionPointsWalletRepository.save(giverWallet);

        // Add points to receiver
        receiverWallet.setCurrentBalance(receiverWallet.getCurrentBalance() + points);
        recognitionPointsWalletRepository.save(receiverWallet);

        // Build Recognition
        Recognition recognition = Recognition.builder()
                .giverEmployeeId(giverId)
                .receiverEmployeeId(receiverId)
                .recognitionType(Recognition.RecognitionType.PEER)
                .recognitionValueId(valueId)
                .title(title)
                .message(message)
                .points(points)
                .visibility(Recognition.Visibility.valueOf(visibility.toUpperCase()))
                .approved(true)
                .tags(tags)
                .projectRef(projectRef)
                .businessImpact(businessImpact)
                .build();
        recognition.setTenantId("default");
        recognition.setCreatedBy(actor);
        Recognition saved = recognitionRepository.save(recognition);

        // Create transaction logs
        RecognitionPointsTransaction giverTx = RecognitionPointsTransaction.builder()
                .walletId(giverWallet.getId())
                .employeeId(giverId)
                .transactionType(RecognitionPointsTransaction.TransactionType.RECOGNITION_GIVEN)
                .points(-points)
                .reason("Recognized " + receiverId + ": " + title)
                .referenceId(saved.getId())
                .build();
        giverTx.setTenantId("default");
        recognitionPointsTransactionRepository.save(giverTx);

        RecognitionPointsTransaction receiverTx = RecognitionPointsTransaction.builder()
                .walletId(receiverWallet.getId())
                .employeeId(receiverId)
                .transactionType(RecognitionPointsTransaction.TransactionType.RECOGNITION_RECEIVED)
                .points(points)
                .reason("Recognized by " + giverId + ": " + title)
                .referenceId(saved.getId())
                .build();
        receiverTx.setTenantId("default");
        recognitionPointsTransactionRepository.save(receiverTx);

        return saved;
    }

    // --- Feed & Social features ---
    public List<Recognition> getFeed() {
        return recognitionRepository.findByApprovedTrueOrderByCreatedAtDesc();
    }

    public List<RecognitionComment> getComments(UUID recognitionId) {
        return recognitionCommentRepository.findByRecognitionIdOrderByCreatedAtAsc(recognitionId);
    }

    public RecognitionComment addComment(UUID recognitionId, UUID employeeId, String text, String actor) {
        RecognitionComment comment = RecognitionComment.builder()
                .recognitionId(recognitionId)
                .employeeId(employeeId)
                .commentText(text)
                .build();
        comment.setTenantId("default");
        comment.setCreatedBy(actor);
        return recognitionCommentRepository.save(comment);
    }

    public List<RecognitionReaction> getReactions(UUID recognitionId) {
        return recognitionReactionRepository.findByRecognitionId(recognitionId);
    }

    @Transactional
    public void toggleReaction(UUID recognitionId, UUID employeeId, String reactionType, String actor) {
        RecognitionReaction.ReactionType type = RecognitionReaction.ReactionType.valueOf(reactionType.toUpperCase());
        Optional<RecognitionReaction> existing = recognitionReactionRepository
                .findByRecognitionIdAndEmployeeIdAndReactionType(recognitionId, employeeId, type);

        if (existing.isPresent()) {
            recognitionReactionRepository.delete(existing.get());
        } else {
            RecognitionReaction reaction = RecognitionReaction.builder()
                    .recognitionId(recognitionId)
                    .employeeId(employeeId)
                    .reactionType(type)
                    .build();
            reaction.setTenantId("default");
            reaction.setCreatedBy(actor);
            recognitionReactionRepository.save(reaction);
        }
    }

    // --- Reward Marketplace ---
    public List<RewardCatalog> getCatalog() {
        return rewardCatalogRepository.findByStatus("ACTIVE");
    }

    public RewardCatalog createCatalogItem(RewardCatalog item) {
        if (item.getTenantId() == null) {
            item.setTenantId("default");
        }
        return rewardCatalogRepository.save(item);
    }

    @Transactional
    public RewardRedemption redeemPoints(UUID employeeId, UUID rewardId, String deliveryDetails, String actor) {
        RewardCatalog reward = rewardCatalogRepository.findById(rewardId)
                .orElseThrow(() -> new IllegalArgumentException("Reward not found."));

        if (reward.getInventory() <= 0) {
            throw new IllegalArgumentException("Reward is out of stock.");
        }

        RecognitionPointsWallet wallet = getOrCreateWallet(employeeId);
        if (wallet.getCurrentBalance() < reward.getCost()) {
            throw new IllegalArgumentException("Insufficient points to redeem this reward.");
        }

        // Deduct points
        wallet.setCurrentBalance(wallet.getCurrentBalance() - reward.getCost());
        recognitionPointsWalletRepository.save(wallet);

        // Decrement inventory
        reward.setInventory(reward.getInventory() - 1);
        rewardCatalogRepository.save(reward);

        // Save redemption
        RewardRedemption redemption = RewardRedemption.builder()
                .employeeId(employeeId)
                .rewardId(rewardId)
                .pointsUsed(reward.getCost())
                .status(RewardRedemption.RedemptionStatus.PENDING)
                .deliveryDetails(deliveryDetails)
                .build();
        redemption.setTenantId("default");
        redemption.setCreatedBy(actor);
        RewardRedemption saved = rewardRedemptionRepository.save(redemption);

        // Points transaction log
        RecognitionPointsTransaction tx = RecognitionPointsTransaction.builder()
                .walletId(wallet.getId())
                .employeeId(employeeId)
                .transactionType(RecognitionPointsTransaction.TransactionType.REWARD_REDEMPTION)
                .points(-reward.getCost())
                .reason("Redeemed reward: " + reward.getName())
                .referenceId(saved.getId())
                .build();
        tx.setTenantId("default");
        recognitionPointsTransactionRepository.save(tx);

        return saved;
    }

    public List<RewardRedemption> getRedemptions(UUID employeeId) {
        if (employeeId != null) {
            return rewardRedemptionRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
        }
        return rewardRedemptionRepository.findAll();
    }

    @Transactional
    public RewardRedemption updateRedemptionStatus(UUID redemptionId, String status, String trackingNumber) {
        RewardRedemption redemption = rewardRedemptionRepository.findById(redemptionId)
                .orElseThrow(() -> new IllegalArgumentException("Redemption not found."));
        redemption.setStatus(RewardRedemption.RedemptionStatus.valueOf(status.toUpperCase()));
        if (trackingNumber != null) {
            redemption.setTrackingNumber(trackingNumber);
        }
        return rewardRedemptionRepository.save(redemption);
    }

    // --- Award Programs & Nominations ---
    public List<AwardProgram> getAwardPrograms() {
        return awardProgramRepository.findByActive(true);
    }

    public AwardProgram createAwardProgram(AwardProgram program) {
        if (program.getTenantId() == null) {
            program.setTenantId("default");
        }
        return awardProgramRepository.save(program);
    }

    public AwardNomination nominateEmployee(UUID programId, UUID nomineeId, UUID nominatorId, String reason, String evidenceUrl, String actor) {
        AwardNomination nomination = AwardNomination.builder()
                .programId(programId)
                .nomineeEmployeeId(nomineeId)
                .nominatorEmployeeId(nominatorId)
                .reason(reason)
                .evidenceUrl(evidenceUrl)
                .status(AwardNomination.NominationStatus.PENDING)
                .build();
        nomination.setTenantId("default");
        nomination.setCreatedBy(actor);
        return awardNominationRepository.save(nomination);
    }

    public List<AwardNomination> getNominationsByProgram(UUID programId) {
        return awardNominationRepository.findByProgramId(programId);
    }

    public List<AwardNomination> getMyNominations(UUID employeeId) {
        return awardNominationRepository.findByNomineeEmployeeId(employeeId);
    }

    @Transactional
    public AwardNomination voteNomination(UUID nominationId) {
        AwardNomination nomination = awardNominationRepository.findById(nominationId)
                .orElseThrow(() -> new IllegalArgumentException("Nomination not found."));
        nomination.setVoteCount(nomination.getVoteCount() + 1);
        return awardNominationRepository.save(nomination);
    }

    @Transactional
    public AwardNomination approveNomination(UUID nominationId) {
        AwardNomination nomination = awardNominationRepository.findById(nominationId)
                .orElseThrow(() -> new IllegalArgumentException("Nomination not found."));
        nomination.setStatus(AwardNomination.NominationStatus.APPROVED);
        return awardNominationRepository.save(nomination);
    }

    // --- Leaderboards ---
    public List<Map<String, Object>> getLeaderboard() {
        List<Recognition> recognitions = recognitionRepository.findAll();
        Map<UUID, Integer> employeePoints = new HashMap<>();

        for (Recognition rec : recognitions) {
            if (rec.isApproved()) {
                employeePoints.put(rec.getReceiverEmployeeId(),
                        employeePoints.getOrDefault(rec.getReceiverEmployeeId(), 0) + rec.getPoints());
            }
        }

        List<Map<String, Object>> leaderboard = new ArrayList<>();
        employeePoints.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .forEach(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("employeeId", entry.getKey());
                    map.put("points", entry.getValue());
                    leaderboard.add(map);
                });

        return leaderboard;
    }

    // --- Analytics ---
    public Map<String, Object> getAnalytics() {
        List<Recognition> recognitions = recognitionRepository.findAll();
        List<RewardRedemption> redemptions = rewardRedemptionRepository.findAll();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRecognitions", recognitions.size());
        stats.put("totalPointsGranted", recognitions.stream().mapToInt(Recognition::getPoints).sum());
        stats.put("totalRedemptions", redemptions.size());
        stats.put("totalPointsRedeemed", redemptions.stream().mapToInt(RewardRedemption::getPointsUsed).sum());

        return stats;
    }
}
