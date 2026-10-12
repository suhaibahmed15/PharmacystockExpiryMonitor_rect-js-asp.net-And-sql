using Microsoft.AspNetCore.Identity;
using PharmacyStockExpiryMonitor.Api.DTOs.Role;
using PharmacyStockExpiryMonitor.Api.Services.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Services
{
    public class RoleService : IRoleService
    {
        private readonly RoleManager<IdentityRole> _roleManager;

        public RoleService(
            RoleManager<IdentityRole> roleManager)
        {
            _roleManager = roleManager;
        }

        public async Task<List<RoleDto>> GetAllAsync()
        {
            var roles = _roleManager.Roles
                .OrderBy(x => x.Name)
                .ToList();

            return roles.Select(role => new RoleDto
            {
                Id = role.Id,
                Name = role.Name ?? string.Empty
            }).ToList();
        }

        public async Task<RoleDto> CreateAsync(
            CreateRoleDto dto)
        {
            var roleName = dto.Name.Trim();

            if (await _roleManager.RoleExistsAsync(roleName))
            {
                throw new InvalidOperationException(
                    "Role already exists.");
            }

            var role = new IdentityRole(roleName);

            var result =
                await _roleManager.CreateAsync(role);

            if (!result.Succeeded)
            {
                var errors = string.Join(
                    ", ",
                    result.Errors.Select(x => x.Description));

                throw new InvalidOperationException(errors);
            }

            return new RoleDto
            {
                Id = role.Id,
                Name = role.Name ?? string.Empty
            };
        }

        public async Task<bool> DeleteAsync(string roleId)
        {
            var role =
                await _roleManager.FindByIdAsync(roleId);

            if (role == null)
                return false;

            var result =
                await _roleManager.DeleteAsync(role);

            if (!result.Succeeded)
            {
                var errors = string.Join(
                    ", ",
                    result.Errors.Select(x => x.Description));

                throw new InvalidOperationException(errors);
            }

            return true;
        }
    }
}