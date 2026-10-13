    namespace PharmacyStockExpiryMonitor.Api.DTOs.Purchase
    {
        public class PurchaseDto
        {
            public int Id { get; set; }

            public string PurchaseNumber { get; set; } = string.Empty;

            public int SupplierId { get; set; }

            public string? SupplierName { get; set; }

            public DateTime PurchaseDate { get; set; }

            public decimal TotalAmount { get; set; }

            public string? Notes { get; set; }

            public List<PurchaseItemDto> PurchaseItems { get; set; }
                = new();

            public DateTime CreatedAt { get; set; }

            public string? CreatedBy { get; set; }

            public DateTime? UpdatedAt { get; set; }

            public string? UpdatedBy { get; set; }
        }
    }