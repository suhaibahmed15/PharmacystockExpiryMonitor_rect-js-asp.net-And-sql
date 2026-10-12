namespace PharmacyStockExpiryMonitor.Api.DTOs.Batch
{
    public class BatchDto
    {
        public int Id { get; set; }

        public int MedicineId { get; set; }

        public string? MedicineName { get; set; }

        public string BatchNumber { get; set; } = string.Empty;

        public DateTime ManufacturingDate { get; set; }

        public DateTime ExpiryDate { get; set; }

        public int InitialQuantity { get; set; }

        public int RemainingQuantity { get; set; }

        public decimal UnitCost { get; set; }
    }
}