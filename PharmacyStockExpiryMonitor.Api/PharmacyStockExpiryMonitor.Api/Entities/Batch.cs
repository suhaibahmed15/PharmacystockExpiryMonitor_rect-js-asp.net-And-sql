using System.ComponentModel.DataAnnotations;

namespace PharmacyStockExpiryMonitor.Api.Entities;

public class Batch : IAuditableEntity
{
    public int Id { get; set; }

    [Range(1, int.MaxValue)]
    public int MedicineId { get; set; }

    [Required]
    [StringLength(100)]
    public string BatchNumber { get; set; } = string.Empty;

    public DateTime ManufacturingDate { get; set; }

    public DateTime ExpiryDate { get; set; }

    [Range(1, int.MaxValue)]
    public int InitialQuantity { get; set; }

    [Range(0, int.MaxValue)]
    public int RemainingQuantity { get; set; }

    [Range(0, double.MaxValue)]
    public decimal UnitCost { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [StringLength(250)]
    public string? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    [StringLength(250)]
    public string? UpdatedBy { get; set; }

    public bool IsDeleted { get; set; } = false;

    public Medicine? Medicine { get; set; }

    public ICollection<StockTransaction> StockTransactions { get; set; }
        = new List<StockTransaction>();

    public ICollection<Alert> Alerts { get; set; }
        = new List<Alert>();
}