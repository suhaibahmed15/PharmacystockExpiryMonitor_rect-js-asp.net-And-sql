using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmacyStockExpiryMonitor.Api.DTOs.Intelligence;
using PharmacyStockExpiryMonitor.Api.DTOs.Prediction;
using PharmacyStockExpiryMonitor.Api.Services.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class IntelligenceController : ControllerBase
    {
        private readonly IIntelligenceService _service;

        public IntelligenceController(
            IIntelligenceService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var predictions =
                await _service.GetAllAsync();

            return Ok(predictions);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(
            int id)
        {
            var prediction =
                await _service.GetByIdAsync(id);

            if (prediction == null)
            {
                return NotFound(new
                {
                    message = "Prediction not found."
                });
            }

            return Ok(prediction);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            PredictionResultDto dto)
        {
            var prediction =
                await _service.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = prediction.Id },
                prediction);
        }

        [HttpPost("evaluate")]
        public async Task<IActionResult> Evaluate(
            IntelligenceEvaluateDto dto)
        {
            var prediction =
                await _service.EvaluateAsync(dto);

            return Ok(prediction);
        }
    }
}