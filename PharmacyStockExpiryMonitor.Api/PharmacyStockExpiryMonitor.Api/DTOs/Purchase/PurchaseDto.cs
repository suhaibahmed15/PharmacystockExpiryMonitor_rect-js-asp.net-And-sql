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
        }
    }