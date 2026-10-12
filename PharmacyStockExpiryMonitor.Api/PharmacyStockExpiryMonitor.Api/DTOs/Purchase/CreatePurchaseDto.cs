using System.ComponentModel.DataAnnotations;

namespace PharmacyStockExpiryMonitor.Api.DTOs.Purchase
{
    public class CreatePurchaseDto
    {
        [Required]
        [StringLength(50)]
        public string PurchaseNumber { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int SupplierId { get; set; }

        [Required]
        public DateTime PurchaseDate { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }

        [Required]
        [MinLength(1)]
        public List<PurchaseItemDto> PurchaseItems { get; set; } = new();
    }
}