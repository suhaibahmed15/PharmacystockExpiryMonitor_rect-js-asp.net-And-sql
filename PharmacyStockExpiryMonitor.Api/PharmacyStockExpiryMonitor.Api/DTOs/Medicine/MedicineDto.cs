namespace PharmacyStockExpiryMonitor.Api.DTOs.Medicine
{
    public class MedicineDto
    {
        public int Id { get; set; }

        public string MedicineCode { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string? GenericName { get; set; }

        public string? Description { get; set; }

        public int CategoryId { get; set; }

        public string? CategoryName { get; set; }

        public int ReorderLevel { get; set; }

        public int CurrentStock { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }

        public string? CreatedBy { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public string? UpdatedBy { get; set; }
    }
}