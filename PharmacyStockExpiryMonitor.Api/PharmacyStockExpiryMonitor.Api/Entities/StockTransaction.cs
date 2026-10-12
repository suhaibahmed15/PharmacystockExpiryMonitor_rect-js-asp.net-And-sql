using System.ComponentModel.DataAnnotations;
using PharmacyStockExpiryMonitor.Api.Enums;

namespace PharmacyStockExpiryMonitor.Api.Entities;

public class StockTransaction
{
    public int Id { get; set; }

    [Range(1, int.MaxValue)]
    public int MedicineId { get; set; }

    [Range(1, int.MaxValue)]
    public int? BatchId { get; set; }

    [EnumDataType(typeof(StockTransactionType))]
    public StockTransactionType TransactionType { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Range(0, int.MaxValue)]
    public int PreviousQuantity { get; set; }

    [Range(0, int.MaxValue)]
    public int NewQuantity { get; set; }

    [StringLength(500)]
    public string? Reason { get; set; }

    public bool IsAdminOverride { get; set; }

    [StringLength(450)]
    public string? CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Medicine? Medicine { get; set; }

    public Batch? Batch { get; set; }
}