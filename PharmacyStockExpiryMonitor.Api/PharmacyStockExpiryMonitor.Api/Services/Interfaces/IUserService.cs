using PharmacyStockExpiryMonitor.Api.DTOs.User;

namespace PharmacyStockExpiryMonitor.Api.Services.Interfaces
{
    public interface IUserService
    {
        Task<List<UserDto>> GetAllAsync();

        Task<UserDto?> GetByIdAsync(string id);

        Task<UserDto> CreateAsync(
            CreateUserDto dto);

        Task<bool> AssignRoleAsync(
            string userId,
            AssignRoleDto dto);

        Task<bool> DeleteAsync(string id);
    }
}