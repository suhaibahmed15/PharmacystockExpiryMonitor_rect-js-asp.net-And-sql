using System.ComponentModel.DataAnnotations;

namespace PharmacyStockExpiryMonitor.Api.Entities;

public class Supplier : IAuditableEntity
{
    public int Id { get; set; }

    [Required]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;

    [StringLength(150)]
    public string? ContactPerson { get; set; }

    [Phone]
    [StringLength(30)]
    public string? Phone { get; set; }

    [EmailAddress]
    [StringLength(150)]
    public string? Email { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [StringLength(250)]
    public string? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    [StringLength(250)]
    public string? UpdatedBy { get; set; }

    public bool IsDeleted { get; set; } = false;

    public ICollection<Purchase> Purchases { get; set; }
        = new List<Purchase>();
}