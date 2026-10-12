using Microsoft.AspNetCore.Identity;
using PharmacyStockExpiryMonitor.Api.Entities;

namespace PharmacyStockExpiryMonitor.Api.Authorization
{
    public static class IdentitySeeder
    {
        public static async Task SeedAsync(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            // Create Admin role
            if (!await roleManager.RoleExistsAsync("Admin"))
            {
                var adminRoleResult =
                    await roleManager.CreateAsync(
                        new IdentityRole("Admin"));

                if (!adminRoleResult.Succeeded)
                {
                    var errors = string.Join(
                        ", ",
                        adminRoleResult.Errors.Select(
                            x => x.Description));

                    throw new InvalidOperationException(
                        $"Admin role creation failed: {errors}");
                }
            }

            // Create StoreManager role
            if (!await roleManager.RoleExistsAsync("StoreManager"))
            {
                var storeManagerResult =
                    await roleManager.CreateAsync(
                        new IdentityRole("StoreManager"));

                if (!storeManagerResult.Succeeded)
                {
                    var errors = string.Join(
                        ", ",
                        storeManagerResult.Errors.Select(
                            x => x.Description));

                    throw new InvalidOperationException(
                        $"StoreManager role creation failed: {errors}");
                }
            }

            // Create Pharmacist role
            if (!await roleManager.RoleExistsAsync("Pharmacist"))
            {
                var pharmacistResult =
                    await roleManager.CreateAsync(
                        new IdentityRole("Pharmacist"));

                if (!pharmacistResult.Succeeded)
                {
                    var errors = string.Join(
                        ", ",
                        pharmacistResult.Errors.Select(
                            x => x.Description));

                    throw new InvalidOperationException(
                        $"Pharmacist role creation failed: {errors}");
                }
            }

            // Helper local function to seed users
            async Task EnsureUserAsync(string email, string password, string fullName, string role)
            {
                var user = await userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    user = new ApplicationUser
                    {
                        UserName = email,
                        Email = email,
                        FullName = fullName,
                        EmailConfirmed = true,
                        IsActive = true,
                        IsDeleted = false,
                        CreatedAt = DateTime.UtcNow
                    };

                    var userResult = await userManager.CreateAsync(user, password);
                    if (!userResult.Succeeded)
                    {
                        var errors = string.Join(", ", userResult.Errors.Select(x => x.Description));
                        throw new InvalidOperationException($"{role} user creation failed: {errors}");
                    }
                }

                if (!await userManager.IsInRoleAsync(user, role))
                {
                    var roleResult = await userManager.AddToRoleAsync(user, role);
                    if (!roleResult.Succeeded)
                    {
                        var errors = string.Join(", ", roleResult.Errors.Select(x => x.Description));
                        throw new InvalidOperationException($"{role} role assignment failed: {errors}");
                    }
                }
            }

            // Seed default users for all 3 roles
            await EnsureUserAsync("admin@pharmacy.com", "Admin@123", "System Administrator", "Admin");
            await EnsureUserAsync("manager@pharmacy.com", "Manager@123", "Store Manager", "StoreManager");
            await EnsureUserAsync("pharmacist@pharmacy.com", "Pharmacist@123", "Lead Pharmacist", "Pharmacist");
        }
    }
}