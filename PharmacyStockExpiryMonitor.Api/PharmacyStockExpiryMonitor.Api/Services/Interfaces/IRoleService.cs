using PharmacyStockExpiryMonitor.Api.DTOs.Role;

namespace PharmacyStockExpiryMonitor.Api.Services.Interfaces
{
    public interface IRoleService
    {
        Task<List<RoleDto>> GetAllAsync();

        Task<RoleDto> CreateAsync(
            CreateRoleDto dto);

        Task<bool> DeleteAsync(string roleId);
    }
}