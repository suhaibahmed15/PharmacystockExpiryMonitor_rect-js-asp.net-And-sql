using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmacyStockExpiryMonitor.Api.Services.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(
            IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        // GET: api/Dashboard/summary
        // Gets the main dashboard statistics such as medicines,
        // suppliers, low stock, near expiry, expired medicines and alerts.
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var summary =
                await _dashboardService.GetSummaryAsync();

            return Ok(summary);
        }
    }
}