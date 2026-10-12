using PharmacyStockExpiryMonitor.Api.DTOs.Dashboard;

namespace PharmacyStockExpiryMonitor.Api.Services.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardSummaryDto> GetSummaryAsync();
    }
}