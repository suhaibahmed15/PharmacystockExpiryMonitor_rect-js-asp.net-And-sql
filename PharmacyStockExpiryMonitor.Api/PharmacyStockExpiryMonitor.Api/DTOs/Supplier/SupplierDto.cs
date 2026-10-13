namespace PharmacyStockExpiryMonitor.Api.DTOs.Supplier
{
    public class SupplierDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? ContactPerson { get; set; }

        public string? Phone { get; set; }

        public string? Email { get; set; }

        public string? Address { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }

        public string? CreatedBy { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public string? UpdatedBy { get; set; }
    }
}