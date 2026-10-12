using PharmacyStockExpiryMonitor.Api.DTOs.Intelligence;
using PharmacyStockExpiryMonitor.Api.DTOs.Prediction;

namespace PharmacyStockExpiryMonitor.Api.Services.Interfaces
{
    public interface IIntelligenceService
    {
        Task<List<PredictionResultDto>> GetAllAsync();

        Task<PredictionResultDto?> GetByIdAsync(int id);

        Task<PredictionResultDto> CreateAsync(
            PredictionResultDto dto);

        Task<PredictionResultDto> EvaluateAsync(
            IntelligenceEvaluateDto dto);
    }
}