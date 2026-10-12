using System.ComponentModel.DataAnnotations;

namespace PharmacyStockExpiryMonitor.Api.Entities;

public class PredictionResult
{
    public int Id { get; set; }

    [Range(1, int.MaxValue)]
    public int MedicineId { get; set; }

    [Range(1, int.MaxValue)]
    public int? BatchId { get; set; }

    [Range(0, double.MaxValue)]
    public decimal AverageDailyConsumption { get; set; }

    [Range(0, double.MaxValue)]
    public decimal EstimatedDaysRemaining { get; set; }

    [Range(0, 1)]
    public decimal PredictionScore { get; set; }

    [StringLength(50)]
    public string? PredictionType { get; set; }

    [StringLength(1000)]
    public string? Explanation { get; set; }

    public DateTime PredictedAt { get; set; } = DateTime.UtcNow;

    public Medicine? Medicine { get; set; }

    public Batch? Batch { get; set; }
}