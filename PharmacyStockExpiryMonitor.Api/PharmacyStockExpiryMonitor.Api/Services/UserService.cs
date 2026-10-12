using Microsoft.AspNetCore.Identity;
using PharmacyStockExpiryMonitor.Api.DTOs.User;
using PharmacyStockExpiryMonitor.Api.Entities;
using PharmacyStockExpiryMonitor.Api.Services.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public UserService(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<List<UserDto>> GetAllAsync()
        {
            var users = _userManager.Users
                .Where(x => !x.IsDeleted)
                .OrderBy(x => x.FullName)
                .ToList();

            var result = new List<UserDto>();

            foreach (var user in users)
            {
                var roles =
                    await _userManager.GetRolesAsync(user);

                result.Add(new UserDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email ?? string.Empty,
                    PhoneNumber = user.PhoneNumber,
                    IsActive = user.IsActive,
                    Role = roles.FirstOrDefault() ?? string.Empty,
                    CreatedAt = user.CreatedAt
                });
            }

            return result;
        }

        public async Task<UserDto?> GetByIdAsync(string id)
        {
            var user =
                await _userManager.FindByIdAsync(id);

            if (user == null || user.IsDeleted)
                return null;

            var roles =
                await _userManager.GetRolesAsync(user);

            return new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber,
                IsActive = user.IsActive,
                Role = roles.FirstOrDefault() ?? string.Empty,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<UserDto> CreateAsync(
            CreateUserDto dto)
        {
            var email = dto.Email.Trim();
            var roleName = dto.Role.Trim();

            var existingUser =
                await _userManager.FindByEmailAsync(email);

            if (existingUser != null)
            {
                throw new InvalidOperationException(
                    "A user with this email already exists.");
            }

            var role =
                await _roleManager.FindByNameAsync(roleName);

            if (role == null)
            {
                throw new InvalidOperationException(
                    "The specified role does not exist.");
            }

            var user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FullName = dto.FullName.Trim(),
                PhoneNumber = dto.PhoneNumber?.Trim(),
                IsActive = true,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow
            };

            var createResult =
                await _userManager.CreateAsync(
                    user,
                    dto.Password);

            if (!createResult.Succeeded)
            {
                var errors = string.Join(
                    ", ",
                    createResult.Errors.Select(
                        x => x.Description));

                throw new InvalidOperationException(errors);
            }

            var roleResult =
                await _userManager.AddToRoleAsync(
                    user,
                    roleName);

            if (!roleResult.Succeeded)
            {
                await _userManager.DeleteAsync(user);

                var errors = string.Join(
                    ", ",
                    roleResult.Errors.Select(
                        x => x.Description));

                throw new InvalidOperationException(errors);
            }

            return new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber,
                IsActive = user.IsActive,
                Role = roleName,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<bool> AssignRoleAsync(
            string userId,
            AssignRoleDto dto)
        {
            var user =
                await _userManager.FindByIdAsync(userId);

            if (user == null || user.IsDeleted)
                return false;

            var roleName = dto.Role.Trim();

            var role =
                await _roleManager.FindByNameAsync(roleName);

            if (role == null)
            {
                throw new InvalidOperationException(
                    "The specified role does not exist.");
            }

            var existingRoles =
                await _userManager.GetRolesAsync(user);

            if (existingRoles.Any())
            {
                var removeResult =
                    await _userManager.RemoveFromRolesAsync(
                        user,
                        existingRoles);

                if (!removeResult.Succeeded)
                {
                    var errors = string.Join(
                        ", ",
                        removeResult.Errors.Select(
                            x => x.Description));

                    throw new InvalidOperationException(errors);
                }
            }

            var result =
                await _userManager.AddToRoleAsync(
                    user,
                    roleName);

            if (!result.Succeeded)
            {
                var errors = string.Join(
                    ", ",
                    result.Errors.Select(
                        x => x.Description));

                throw new InvalidOperationException(errors);
            }

            user.UpdatedAt = DateTime.UtcNow;

            await _userManager.UpdateAsync(user);

            return true;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var user =
                await _userManager.FindByIdAsync(id);

            if (user == null || user.IsDeleted)
                return false;

            user.IsDeleted = true;
            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;

            var result =
                await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                var errors = string.Join(
                    ", ",
                    result.Errors.Select(
                        x => x.Description));

                throw new InvalidOperationException(errors);
            }

            return true;
        }
    }
}