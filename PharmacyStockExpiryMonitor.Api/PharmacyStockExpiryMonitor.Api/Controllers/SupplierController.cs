using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmacyStockExpiryMonitor.Api.DTOs.Supplier;
using PharmacyStockExpiryMonitor.Api.Services.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SupplierController : ControllerBase
    {
        private readonly ISupplierService _supplierService;

        public SupplierController(
            ISupplierService supplierService)
        {
            _supplierService = supplierService;
        }

        // GET: api/Supplier?page=1&pageSize=10&search=&isActive=&sortBy=name&sortDirection=asc
        [HttpGet]
        public async Task<IActionResult> GetAll(
            int page = 1,
            int pageSize = 10,
            string? search = null,
            bool? isActive = null,
            string? sortBy = "name",
            string? sortDirection = "asc")
        {
            if (page < 1)
                page = 1;

            if (pageSize < 1)
                pageSize = 10;

            if (pageSize > 100)
                pageSize = 100;

            var result = await _supplierService.GetAllAsync(
                page,
                pageSize,
                search,
                isActive,
                sortBy,
                sortDirection);

            return Ok(new
            {
                items = result.Items,
                totalCount = result.TotalCount,
                page = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling(
                    (double)result.TotalCount / pageSize),
                search = search,
                isActive = isActive,
                sortBy = sortBy,
                sortDirection = sortDirection
            });
        }

        // GET: api/Supplier/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var supplier =
                await _supplierService.GetByIdAsync(id);

            if (supplier == null)
            {
                return NotFound(new
                {
                    message = "Supplier not found."
                });
            }

            return Ok(supplier);
        }

        // POST: api/Supplier
        [HttpPost]
        public async Task<IActionResult> Create(
            CreateSupplierDto dto)
        {
            try
            {
                var supplier =
                    await _supplierService.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = supplier.Id },
                    supplier);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        // PUT: api/Supplier/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateSupplierDto dto)
        {
            try
            {
                var supplier =
                    await _supplierService.UpdateAsync(
                        id,
                        dto);

                if (supplier == null)
                {
                    return NotFound(new
                    {
                        message = "Supplier not found."
                    });
                }

                return Ok(supplier);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        // DELETE: api/Supplier/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result =
                await _supplierService.DeleteAsync(id);

            if (!result)
            {
                return NotFound(new
                {
                    message = "Supplier not found."
                });
            }

            return Ok(new
            {
                message = "Supplier deleted successfully."
            });
        }
    }
}