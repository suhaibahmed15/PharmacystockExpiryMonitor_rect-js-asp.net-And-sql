    using PharmacyStockExpiryMonitor.Api.Enums;

    namespace PharmacyStockExpiryMonitor.Api.Entities;

    public class Alert
    {
        public int Id { get; set; }

        public int MedicineId { get; set; }

        public int? BatchId { get; set; }

        public AlertType AlertType { get; set; }

        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;

        public bool IsResolved { get; set; } = false;

        public DateTime? ResolvedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Medicine? Medicine { get; set; }

        public Batch? Batch { get; set; }
    }