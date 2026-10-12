using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PharmacyStockExpiryMonitor.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixEntityRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Alerts_Medicines_MedicineId1",
                table: "Alerts");

            migrationBuilder.DropForeignKey(
                name: "FK_AuditLogs_AspNetUsers_ApplicationUserId",
                table: "AuditLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_PredictionResults_Medicines_MedicineId1",
                table: "PredictionResults");

            migrationBuilder.DropIndex(
                name: "IX_PredictionResults_MedicineId1",
                table: "PredictionResults");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_ApplicationUserId",
                table: "AuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_Alerts_MedicineId1",
                table: "Alerts");

            migrationBuilder.DropColumn(
                name: "MedicineId1",
                table: "PredictionResults");

            migrationBuilder.DropColumn(
                name: "Alerts",
                table: "Batches");

            migrationBuilder.DropColumn(
                name: "ApplicationUserId",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "MedicineId1",
                table: "Alerts");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MedicineId1",
                table: "PredictionResults",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Alerts",
                table: "Batches",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ApplicationUserId",
                table: "AuditLogs",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MedicineId1",
                table: "Alerts",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PredictionResults_MedicineId1",
                table: "PredictionResults",
                column: "MedicineId1");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_ApplicationUserId",
                table: "AuditLogs",
                column: "ApplicationUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_MedicineId1",
                table: "Alerts",
                column: "MedicineId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Alerts_Medicines_MedicineId1",
                table: "Alerts",
                column: "MedicineId1",
                principalTable: "Medicines",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AuditLogs_AspNetUsers_ApplicationUserId",
                table: "AuditLogs",
                column: "ApplicationUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PredictionResults_Medicines_MedicineId1",
                table: "PredictionResults",
                column: "MedicineId1",
                principalTable: "Medicines",
                principalColumn: "Id");
        }
    }
}
