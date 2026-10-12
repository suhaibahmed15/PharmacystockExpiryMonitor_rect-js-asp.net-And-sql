using PharmacyStockExpiryMonitor.Api.DTOs.Auth;

namespace PharmacyStockExpiryMonitor.Api.Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> LoginAsync(
            LoginRequestDto request);
    }
}