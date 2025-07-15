import React, { useState } from "react";
import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Target,
  Info,
  ExternalLink,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import type { UnitPreferences, GeneratedPlan } from "../types";

interface Props {
  unitPreferences: UnitPreferences;
  generatedPlan: GeneratedPlan;
  onBack: () => void;
  onComplete: () => void;
}

type ExportStatus = "idle" | "generating" | "success" | "error";

/**
 * Export & Download Screen - Phase 1.6 Implementation
 * Allows users to download their training plan as PDF with unit preferences
 */
export const ExportDownloadScreen: React.FC<Props> = ({
  unitPreferences,
  generatedPlan,
  onBack,
  onComplete,
}) => {
  const [includeConversionTables, setIncludeConversionTables] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportStatus>("idle");
  const [exportProgress, setExportProgress] = useState(0);
  const getTrainingDaysCount = (availableTrainingDays: boolean[]): number => {
    return availableTrainingDays.filter((day) => day).length;
  };

  /**
   * Generate and download PDF with plan data
   */
  const handleGeneratePDF = async () => {
    setExportStatus("generating");
    setExportProgress(0);

    try {
      // Simulate PDF generation progress
      const progressSteps = [
        { progress: 20, message: "Preparing plan data..." },
        { progress: 40, message: "Formatting pace tables..." },
        { progress: 60, message: "Generating workout schedules..." },
        { progress: 80, message: "Adding reference materials..." },
        { progress: 100, message: "Finalizing PDF..." },
      ];

      for (const step of progressSteps) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setExportProgress(step.progress);
      }

      // Generate and download PDF
      generatePDFDownload();

      setExportStatus("success");
    } catch (error) {
      console.error("PDF generation failed:", error);
      setExportStatus("error");
    }
  };

  /**
   * Simulate PDF download (in real implementation, would use PDF library)
   */
  const generatePDFDownload = () => {
    const pdfContent = generatePDFData();
    const blob = new Blob([pdfContent], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `training-plan-${generatedPlan.planLevel}-${generatedPlan.constraints.goalRace}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /**
   * Generate PDF content data (placeholder for actual PDF generation)
   */
  const generatePDFData = (): string => {
    const unitSystem =
      unitPreferences.system.charAt(0).toUpperCase() +
      unitPreferences.system.slice(1);

    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 16 Tf
50 750 Td
(${getPlanLevelName(generatedPlan.planLevel)} Training Plan) Tj
0 -25 Td
/F1 12 Tf
(Goal: ${getGoalRaceName(generatedPlan.constraints.goalRace)}) Tj
0 -20 Td
(Duration: ${generatedPlan.metadata.totalWeeks} weeks) Tj
0 -20 Td
(Unit System: ${unitSystem}) Tj
0 -20 Td
(Training Days: ${getTrainingDaysCount(
      generatedPlan.constraints.availableTrainingDays
    )}/week) Tj
0 -30 Td
/F1 14 Tf
(Training Paces:) Tj
0 -20 Td
/F1 10 Tf
(Easy: ${generatedPlan.trainingPaces.easy.value} ${
      generatedPlan.trainingPaces.easy.unit
    }) Tj
0 -15 Td
(Marathon: ${generatedPlan.trainingPaces.marathon.value} ${
      generatedPlan.trainingPaces.marathon.unit
    }) Tj
0 -15 Td
(Threshold: ${generatedPlan.trainingPaces.threshold.value} ${
      generatedPlan.trainingPaces.threshold.unit
    }) Tj
0 -15 Td
(Interval: ${generatedPlan.trainingPaces.interval.value} ${
      generatedPlan.trainingPaces.interval.unit
    }) Tj
0 -15 Td
(Repetition: ${generatedPlan.trainingPaces.repetition.value} ${
      generatedPlan.trainingPaces.repetition.unit
    }) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
650
%%EOF`;
  };

  /**
   * Reset export status to try again
   */
  const handleRetryExport = () => {
    setExportStatus("idle");
    setExportProgress(0);
  };

  /**
   * Format distance with appropriate unit
   */
  const formatDistance = (distance: number): string => {
    const unit = unitPreferences.distanceUnit;
    return `${distance.toFixed(1)} ${unit}`;
  };

  /**
   * Get plan level display name
   */
  const getPlanLevelName = (level: string): string => {
    const levelMap: Record<string, string> = {
      foundation: "Foundation",
      intermediate: "Intermediate",
      advanced: "Advanced",
      elite: "Elite",
    };
    return levelMap[level] || level;
  };

  /**
   * Get goal race display name
   */
  const getGoalRaceName = (race: string): string => {
    const raceMap: Record<string, string> = {
      "5k": "5K",
      "10k": "10K",
      "half-marathon": "Half Marathon",
      marathon: "Marathon",
    };
    return raceMap[race] || race;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Plan Review
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Export & Download
            </h1>
            <p className="text-gray-600 mt-1">
              Download your personalized training plan
            </p>
          </div>

          <div className="w-24"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Plan Summary */}
          <div className="space-y-6">
            {/* Plan Overview Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Plan Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plan Level:</span>
                  <span className="font-medium text-gray-900">
                    {getPlanLevelName(generatedPlan.planLevel)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Goal Race:</span>
                  <span className="font-medium text-gray-900">
                    {getGoalRaceName(generatedPlan.constraints.goalRace)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-900">
                    {generatedPlan.metadata.totalWeeks} weeks
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Training Days:</span>
                  <span className="font-medium text-gray-900">
                    {getTrainingDaysCount(
                      generatedPlan.constraints.availableTrainingDays
                    )}{" "}
                    days/week
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Weekly Mileage:</span>
                  <span className="font-medium text-gray-900">
                    {generatedPlan.metadata.weeklyMileageRange.min}-
                    {generatedPlan.metadata.weeklyMileageRange.max}{" "}
                    {generatedPlan.metadata.weeklyMileageRange.unit}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Unit System:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {unitPreferences.system}
                  </span>
                </div>

                {generatedPlan.altitudeAdjustments?.applied && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Altitude Adjusted:
                    </span>
                    <span className="font-medium text-orange-600">
                      {generatedPlan.altitudeAdjustments.altitude.value}{" "}
                      {generatedPlan.altitudeAdjustments.altitude.unit}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Training Paces Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Training Paces
              </h3>

              <div className="space-y-3">
                {Object.entries(generatedPlan.trainingPaces).map(
                  ([type, pace]) => (
                    <div
                      key={type}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-600 capitalize">{type}:</span>
                      <span className="font-mono font-medium text-gray-900">
                        {pace.value} {pace.unit}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Phase Structure Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Plan Structure
              </h3>

              <div className="space-y-3">
                {generatedPlan.planStructure.map((phase) => (
                  <div
                    key={phase.id}
                    className="flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">
                        {phase.name}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {phase.focus}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-700 ml-4">
                      {phase.duration} weeks
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Export Options */}
          <div className="space-y-6">
            {/* Export Configuration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Export Configuration
              </h3>

              <div className="space-y-6">
                {/* Unit System Confirmation */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Unit System</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Your plan will be exported using the{" "}
                        <span className="font-medium capitalize">
                          {unitPreferences.system}
                        </span>{" "}
                        system ({unitPreferences.paceUnit},{" "}
                        {unitPreferences.distanceUnit}).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Conversion Tables Option */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeConversionTables}
                      onChange={(e) =>
                        setIncludeConversionTables(e.target.checked)
                      }
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="font-medium text-gray-900">
                        Include Unit Conversion Tables
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        Add reference tables showing paces and distances in both
                        metric and imperial units.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Export Button and Status */}
                <div className="space-y-4">
                  {exportStatus === "idle" && (
                    <button
                      onClick={handleGeneratePDF}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Generate PDF Download
                    </button>
                  )}

                  {exportStatus === "generating" && (
                    <div className="space-y-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${exportProgress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-center gap-2 text-blue-600">
                        <Clock className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">
                          Generating your training plan...
                        </span>
                      </div>
                    </div>
                  )}

                  {exportStatus === "success" && (
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-medium">Download Complete!</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Your training plan has been downloaded to your device.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={handleGeneratePDF}
                          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Again
                        </button>
                        <button
                          onClick={onComplete}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  )}

                  {exportStatus === "error" && (
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-2 text-red-600">
                        <AlertCircle className="w-6 h-6" />
                        <span className="font-medium">Export Failed</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        There was an error generating your PDF. Please try
                        again.
                      </p>
                      <button
                        onClick={handleRetryExport}
                        className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-5 h-5" />
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Next Steps Guidance */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
              <h3 className="text-xl font-semibold text-green-900 mb-4">
                Next Steps
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">
                      Review Your Plan
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      Read through your complete training plan and familiarize
                      yourself with the pace zones and workout types.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Start Week 1</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Begin with Phase I base building. Focus on running at your
                      prescribed easy pace (
                      {generatedPlan.trainingPaces.easy.value}{" "}
                      {generatedPlan.trainingPaces.easy.unit}).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">
                      Track Progress
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      Monitor your training and adjust if needed. Listen to your
                      body and don't hesitate to take extra rest days.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">
                      Additional Resources
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      Consider using a GPS watch or running app to track your
                      paces and monitor your weekly mileage progression.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
