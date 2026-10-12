using System.ComponentModel.DataAnnotations;

namespace PharmacyStockExpiryMonitor.Api.DTOs.Batch
{
    public class UpdateBatchDto
    {
        [Required]
        [StringLength(100)]
        public string BatchNumber { get; set; } = string.Empty;

        [Required]
        public DateTime ManufacturingDate { get; set; }

        [Required]
        public DateTime ExpiryDate { get; set; }

        [Range(0, double.MaxValue)]
        public decimal UnitCost { get; set; }
    }
}