using System.ComponentModel.DataAnnotations;
using PharmacyStockExpiryMonitor.Api.Enums;

namespace PharmacyStockExpiryMonitor.Api.DTOs.StockTransaction
{
    public class CreateStockTransactionDto
    {
        [Range(1, int.MaxValue)]
        public int BatchId { get; set; }

        [Required]
        [EnumDataType(typeof(StockTransactionType))]
        public StockTransactionType TransactionType { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        [StringLength(500)]
        public string? Reason { get; set; }

        public bool IsAdminOverride { get; set; }
    }
}