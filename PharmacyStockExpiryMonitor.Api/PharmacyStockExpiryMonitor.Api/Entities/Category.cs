using System.ComponentModel.DataAnnotations;

namespace PharmacyStockExpiryMonitor.Api.Entities;

public class Category : IAuditableEntity
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [StringLength(250)]
    public string? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    [StringLength(250)]
    public string? UpdatedBy { get; set; }

    public bool IsDeleted { get; set; } = false;

    public ICollection<Medicine> Medicines { get; set; }
        = new List<Medicine>();
}