using System.ComponentModel.DataAnnotations;

namespace PharmacyStockExpiryMonitor.Api.DTOs.User
{
    public class AssignRoleDto
    {
        [Required]
        public string Role { get; set; } = string.Empty;
    }
}