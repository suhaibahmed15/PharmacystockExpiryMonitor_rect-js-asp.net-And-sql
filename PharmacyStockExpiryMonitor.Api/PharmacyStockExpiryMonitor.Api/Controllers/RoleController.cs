using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmacyStockExpiryMonitor.Api.DTOs.Role;
using PharmacyStockExpiryMonitor.Api.Services.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RoleController(
            IRoleService roleService)
        {
            _roleService = roleService;
        }

        // GET: api/Role
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var roles =
                await _roleService.GetAllAsync();

            return Ok(roles);
        }

        // POST: api/Role
        [HttpPost]
        public async Task<IActionResult> Create(
            CreateRoleDto dto)
        {
            try
            {
                var role =
                    await _roleService.CreateAsync(dto);

                return Ok(role);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        // DELETE: api/Role/{roleId}
        [HttpDelete("{roleId}")]
        public async Task<IActionResult> Delete(
            string roleId)
        {
            try
            {
                var result =
                    await _roleService.DeleteAsync(roleId);

                if (!result)
                {
                    return NotFound(new
                    {
                        message = "Role not found."
                    });
                }

                return Ok(new
                {
                    message = "Role deleted successfully."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }
    }
}