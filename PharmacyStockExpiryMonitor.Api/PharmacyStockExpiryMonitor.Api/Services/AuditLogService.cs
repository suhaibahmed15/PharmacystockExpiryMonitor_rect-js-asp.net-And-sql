using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using PharmacyStockExpiryMonitor.Api.Data;
using PharmacyStockExpiryMonitor.Api.Entities;
using PharmacyStockExpiryMonitor.Api.Services.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditLogService(
        ApplicationDbContext context,
        IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task LogAsync(
            string action,
            string entityName,
            string? entityId = null,
            string? oldValues = null,
            string? newValues = null)
        {
            var httpContext = _httpContextAccessor.HttpContext;

            var auditLog = new AuditLog
            {
                UserId = httpContext?.User?
                    .FindFirstValue(ClaimTypes.NameIdentifier),

                Action = action,
                EntityName = entityName,
                EntityId = entityId,
                OldValues = oldValues,
                NewValues = newValues,

                IpAddress = httpContext?.Connection
                    .RemoteIpAddress?.ToString(),

                CreatedAt = DateTime.UtcNow
            };

            _context.AuditLogs.Add(auditLog);

            await _context.SaveChangesAsync();
        }

        public Task LogJsonAsync(
            string action,
            string entityName,
            string? entityId,
            object? oldValues,
            object? newValues)
        {
            return LogAsync(
                action,
                entityName,
                entityId,
                oldValues == null
                    ? null
                    : JsonSerializer.Serialize(oldValues),
                newValues == null
                    ? null
                    : JsonSerializer.Serialize(newValues));
        }
    }


}
