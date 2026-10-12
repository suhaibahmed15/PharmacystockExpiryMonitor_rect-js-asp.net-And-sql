using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharmacyStockExpiryMonitor.Api.Entities;

public class Medicine
{
    public int Id { get; set; }

    [Required]
    [StringLength(50)]
    public string MedicineCode { get; set; } = string.Empty;

    [Required]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;

    [StringLength(150)]
    public string? GenericName { get; set; }

    [Range(1, int.MaxValue)]
    public int CategoryId { get; set; }

    [StringLength(150)]
    public string? Manufacturer { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [Range(0, int.MaxValue)]
    public int ReorderLevel { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public bool IsDeleted { get; set; } = false;

    public Category? Category { get; set; }

    public ICollection<PurchaseItem> PurchaseItems { get; set; }
        = new List<PurchaseItem>();

    public ICollection<Batch> Batches { get; set; }
        = new List<Batch>();

    public ICollection<StockTransaction> StockTransactions { get; set; }
        = new List<StockTransaction>();

    public ICollection<Alert> Alerts { get; set; }
        = new List<Alert>();

    public ICollection<PredictionResult> PredictionResults { get; set; }
        = new List<PredictionResult>();

    [NotMapped]
    public int CurrentStock
    {
        get
        {
            return Batches.Sum(x => x.RemainingQuantity);
        }
    }
}