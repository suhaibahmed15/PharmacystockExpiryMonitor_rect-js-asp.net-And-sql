using System.ComponentModel.DataAnnotations;

namespace PharmacyStockExpiryMonitor.Api.Entities;

public class Purchase
{
    public int Id { get; set; }

    [Required]
    [StringLength(50)]
    public string PurchaseNumber { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int SupplierId { get; set; }

    public DateTime PurchaseDate { get; set; }

    [Range(0, double.MaxValue)]
    public decimal TotalAmount { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public bool IsDeleted { get; set; } = false;

    public Supplier? Supplier { get; set; }

    public ICollection<PurchaseItem> PurchaseItems { get; set; }
        = new List<PurchaseItem>();
}