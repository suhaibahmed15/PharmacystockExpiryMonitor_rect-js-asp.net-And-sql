using PharmacyStockExpiryMonitor.Api.Enums;

namespace PharmacyStockExpiryMonitor.Api.DTOs.StockTransaction
{
    public class StockTransactionDto
    {
        public int Id { get; set; }

        public int MedicineId { get; set; }

        public int? BatchId { get; set; }

        public StockTransactionType TransactionType { get; set; }

        public int Quantity { get; set; }

        public int PreviousQuantity { get; set; }

        public int NewQuantity { get; set; }

        public string? Reason { get; set; }

        public bool IsAdminOverride { get; set; }

        public DateTime CreatedAt { get; set; }

        public string? CreatedBy { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public string? UpdatedBy { get; set; }
    }
}