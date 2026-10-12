using PharmacyStockExpiryMonitor.Api.DTOs.Intelligence;
using PharmacyStockExpiryMonitor.Api.DTOs.Prediction;
using PharmacyStockExpiryMonitor.Api.Entities;
using PharmacyStockExpiryMonitor.Api.Enums;
using PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;
using PharmacyStockExpiryMonitor.Api.Services.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Services
{
    public class IntelligenceService : IIntelligenceService
    {
        private readonly IIntelligenceRepository _repository;

        public IntelligenceService(
            IIntelligenceRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<PredictionResultDto>> GetAllAsync()
        {
            var predictions =
                await _repository.GetAllAsync();

            return predictions.Select(
                prediction => MapToDto(prediction)
            ).ToList();
        }

        public async Task<PredictionResultDto?> GetByIdAsync(
            int id)
        {
            var prediction =
                await _repository.GetByIdAsync(id);

            if (prediction == null)
                return null;

            return MapToDto(prediction);
        }

        public async Task<PredictionResultDto> CreateAsync(
            PredictionResultDto dto)
        {
            var prediction = new PredictionResult
            {
                MedicineId = dto.MedicineId,
                BatchId = dto.BatchId,
                AverageDailyConsumption =
                    dto.AverageDailyConsumption,
                EstimatedDaysRemaining =
                    dto.EstimatedDaysRemaining,
                PredictionScore =
                    dto.PredictionScore,
                PredictionType =
                    dto.PredictionType,
                Explanation =
                    dto.Explanation,
                PredictedAt = DateTime.UtcNow
            };

            var createdPrediction =
                await _repository.AddAsync(prediction);

            return MapToDto(createdPrediction);
        }

        public async Task<PredictionResultDto> EvaluateAsync(
            IntelligenceEvaluateDto dto)
        {
            var medicine =
                await _repository.GetMedicineAsync(
                    dto.MedicineId);

            if (medicine == null)
            {
                throw new Exception(
                    "Medicine not found.");
            }

            Batch? batch = null;

            if (dto.BatchId.HasValue)
            {
                batch =
                    await _repository.GetBatchAsync(
                        dto.BatchId.Value);

                if (batch == null)
                {
                    throw new Exception(
                        "Batch not found.");
                }

                if (batch.MedicineId != dto.MedicineId)
                {
                    throw new Exception(
                        "Batch does not belong to this medicine.");
                }
            }

            var transactions =
                await _repository
                    .GetStockTransactionsAsync(
                        dto.MedicineId);

            var stockOutTransactions =
                transactions
                    .Where(x =>
                        x.TransactionType ==
                        StockTransactionType.StockOut)
                    .ToList();

            decimal averageDailyConsumption = 0;

            if (stockOutTransactions.Count > 0)
            {
                var firstDate =
                    stockOutTransactions
                        .Min(x => x.CreatedAt);

                var lastDate =
                    stockOutTransactions
                        .Max(x => x.CreatedAt);

                var days =
                    (lastDate - firstDate).TotalDays;

                if (days < 1)
                {
                    days = 1;
                }

                var totalConsumed =
                    stockOutTransactions.Sum(
                        x => x.Quantity);

                averageDailyConsumption =
                    totalConsumed / (decimal)days;
            }

            int currentStock;

            if (batch != null)
            {
                currentStock =
                    batch.RemainingQuantity;
            }
            else
            {
                currentStock =
                    medicine.CurrentStock;
            }

            decimal estimatedDaysRemaining = 0;

            if (averageDailyConsumption > 0)
            {
                estimatedDaysRemaining =
                    currentStock /
                    averageDailyConsumption;
            }

            decimal predictionScore;
            string predictionType;
            string explanation;

            if (currentStock <= 0)
            {
                predictionScore = 1.00m;
                predictionType = "Stock-Out";
                explanation =
                    "The medicine currently has no remaining stock.";
            }
            else if (averageDailyConsumption <= 0)
            {
                predictionScore = 0.10m;
                predictionType = "Insufficient Data";
                explanation =
                    "There is not enough stock-out transaction history to calculate a reliable consumption prediction.";
            }
            else if (estimatedDaysRemaining <= 3)
            {
                predictionScore = 0.90m;
                predictionType = "High Stock-Out Risk";
                explanation =
                    $"Based on recent consumption, the medicine may run out within approximately {Math.Round(estimatedDaysRemaining, 1)} days.";
            }
            else if (estimatedDaysRemaining <= 7)
            {
                predictionScore = 0.70m;
                predictionType = "Medium Stock-Out Risk";
                explanation =
                    $"Based on recent consumption, the medicine may run out within approximately {Math.Round(estimatedDaysRemaining, 1)} days.";
            }
            else
            {
                predictionScore = 0.30m;
                predictionType = "Low Stock-Out Risk";
                explanation =
                    $"Based on recent consumption, approximately {Math.Round(estimatedDaysRemaining, 1)} days of stock remain.";
            }

            var prediction = new PredictionResult
            {
                MedicineId = dto.MedicineId,
                BatchId = dto.BatchId,
                AverageDailyConsumption =
                    Math.Round(
                        averageDailyConsumption,
                        2),
                EstimatedDaysRemaining =
                    Math.Round(
                        estimatedDaysRemaining,
                        2),
                PredictionScore =
                    predictionScore,
                PredictionType =
                    predictionType,
                Explanation =
                    explanation,
                PredictedAt =
                    DateTime.UtcNow
            };

            var savedPrediction =
                await _repository.AddAsync(
                    prediction);

            return MapToDto(savedPrediction);
        }

        private static PredictionResultDto MapToDto(
            PredictionResult prediction)
        {
            return new PredictionResultDto
            {
                Id = prediction.Id,
                MedicineId = prediction.MedicineId,
                BatchId = prediction.BatchId,
                AverageDailyConsumption =
                    prediction.AverageDailyConsumption,
                EstimatedDaysRemaining =
                    prediction.EstimatedDaysRemaining,
                PredictionScore =
                    prediction.PredictionScore,
                PredictionType =
                    prediction.PredictionType,
                Explanation =
                    prediction.Explanation,
                PredictedAt =
                    prediction.PredictedAt
            };
        }
    }
}