namespace PharmacyStockExpiryMonitor.Api.DTOs.Prediction
{
    public class PredictionResultDto
    {
        public int Id { get; set; }

        public int MedicineId { get; set; }

        public int? BatchId { get; set; }

        public decimal AverageDailyConsumption { get; set; }

        public decimal EstimatedDaysRemaining { get; set; }

        public decimal PredictionScore { get; set; }

        public string? PredictionType { get; set; }

        public string? Explanation { get; set; }

        public DateTime PredictedAt { get; set; }
    }
}