using PharmacyStockExpiryMonitor.Api.Enums;

namespace PharmacyStockExpiryMonitor.Api.DTOs.Alert
{
    public class AlertDto
    {
        public int Id { get; set; }

        public int MedicineId { get; set; }

        public int? BatchId { get; set; }

        public AlertType AlertType { get; set; }

        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; }

        public bool IsResolved { get; set; }

        public DateTime? ResolvedAt { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}