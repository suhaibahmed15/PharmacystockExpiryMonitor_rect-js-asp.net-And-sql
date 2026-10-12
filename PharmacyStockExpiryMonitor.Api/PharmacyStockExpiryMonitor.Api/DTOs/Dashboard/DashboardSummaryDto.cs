namespace PharmacyStockExpiryMonitor.Api.DTOs.Dashboard
{
    public class DashboardSummaryDto
    {
        public int TotalMedicines { get; set; }

        public int TotalCategories { get; set; }

        public int TotalSuppliers { get; set; }

        public int TotalBatches { get; set; }

        public int LowStockCount { get; set; }

        public int NearExpiryCount { get; set; }

        public int ExpiredCount { get; set; }

        public int UnreadAlertsCount { get; set; }

        public decimal TotalPurchaseAmount { get; set; }
    }
}