import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import useUpload from "@/utils/useUpload";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  ArrowLeft,
  Plus,
  Settings,
  Database,
  Loader,
  Menu,
  X,
  LogOut,
  Home,
  Megaphone,
  BarChart3,
  Target,
  Activity,
} from "lucide-react";

export default function DataEnrichment() {
  const { data: user, loading } = useUser();
  const [upload, { loading: uploading }] = useUpload();
  const [jobs, setJobs] = useState([]);
  const [activeStep, setActiveStep] = useState(1); // 1: Upload, 2: Map, 3: Process
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [columnMapping, setColumnMapping] = useState({});
  const [processingJob, setProcessingJob] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Campaigns", href: "/campaigns", icon: Megaphone },
    { name: "Marketplace", href: "/marketplace", icon: BarChart3 },
    { name: "Enrichment", href: "/enrichment", icon: Database, current: true },
    { name: "ICP Builder", href: "/icp", icon: Target },
    { name: "Analytics", href: "/analytics", icon: Activity },
  ];

  // Available enrichment fields
  const enrichmentFields = {
    email: "Email Address",
    company_name: "Company Name",
    first_name: "First Name",
    last_name: "Last Name",
    job_title: "Job Title",
    phone: "Phone Number",
    linkedin_url: "LinkedIn URL",
    industry: "Industry",
    company_size: "Company Size",
    location: "Location",
  };

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  // Poll for job updates when processing
  useEffect(() => {
    let interval;
    if (processingJob) {
      interval = setInterval(async () => {
        await fetchJobStatus(processingJob.id);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [processingJob]);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/enrichment/jobs");
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchJobStatus = async (jobId) => {
    try {
      const response = await fetch(`/api/enrichment/jobs/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        const job = data.job;

        setProcessingJob(job);

        if (job.status === "completed" || job.status === "failed") {
          setProcessingJob(null);
          await fetchJobs();
          if (job.status === "completed") {
            setActiveStep(1); // Reset to upload step
            resetForm();
          }
        }
      }
    } catch (error) {
      console.error("Error fetching job status:", error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(csv|xlsx)$/)) {
      alert("Please upload a CSV or Excel file");
      return;
    }

    setSelectedFile(file);

    try {
      // Upload file using the upload utility
      const { url, error } = await upload({ file });

      if (error) {
        alert("Failed to upload file: " + error);
        return;
      }

      // Parse the uploaded file to get sample data and suggest mappings
      const parseResponse = await fetch("/api/enrichment/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: url }),
      });

      if (parseResponse.ok) {
        const parseData = await parseResponse.json();
        setFileData({ ...parseData, fileUrl: url });
        setColumnMapping(parseData.suggestedMapping || {});
        setActiveStep(2);
      } else {
        alert("Failed to parse file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    }
  };

  const handleStartEnrichment = async () => {
    if (!fileData || Object.keys(columnMapping).length === 0) {
      alert("Please complete the column mapping first");
      return;
    }

    try {
      const response = await fetch("/api/enrichment/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Enrichment - ${selectedFile.name}`,
          input_file_url: fileData.fileUrl,
          column_mapping: columnMapping,
          total_records: fileData.totalRows || 0,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProcessingJob(data.job);
        setActiveStep(3);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to start enrichment job");
      }
    } catch (error) {
      console.error("Error starting enrichment:", error);
      alert("Failed to start enrichment job");
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFileData(null);
    setColumnMapping({});
    setActiveStep(1);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-500" size={20} />;
      case "failed":
        return <AlertCircle className="text-red-500" size={20} />;
      case "processing":
        return <Loader className="text-blue-500 animate-spin" size={20} />;
      default:
        return <Clock className="text-yellow-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "failed":
        return "text-red-600 bg-red-50";
      case "processing":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-yellow-600 bg-yellow-50";
    }
  };

  if (loading || loadingJobs) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    window.location.href = "/account/signin";
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Lake B2B Reseller Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.name || user.email}
              </span>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-4 top-16 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                    item.current ? "text-blue-600 bg-blue-50" : "text-gray-700"
                  }`}
                >
                  <item.icon size={18} />
                  {item.name}
                </a>
              ))}
              <div className="border-t border-gray-200 my-2"></div>
              <a
                href="/account/logout"
                className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                Sign Out
              </a>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Data Enrichment
              </h2>
              <p className="text-gray-600">
                Upload and enrich your contact data with comprehensive business
                information.
              </p>
            </div>
            <button
              onClick={resetForm}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>New Enrichment</span>
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, title: "Upload File", icon: Upload },
              { step: 2, title: "Map Columns", icon: Settings },
              { step: 3, title: "Process Data", icon: Database },
            ].map(({ step, title, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    activeStep >= step
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 text-gray-300"
                  }`}
                >
                  {activeStep > step ? (
                    <CheckCircle size={20} />
                  ) : (
                    <Icon size={20} />
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    activeStep >= step ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {title}
                </span>
                {step < 3 && (
                  <div
                    className={`ml-8 w-16 h-0.5 ${
                      activeStep > step ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          {activeStep === 1 && (
            <div className="text-center py-12">
              <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Upload Your Data File
              </h3>
              <p className="text-gray-600 mb-6">
                Upload a CSV or Excel file containing your contact data for
                enrichment
              </p>
              <label className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors">
                <Upload className="mr-2" size={20} />
                {uploading ? "Uploading..." : "Choose File"}
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: CSV, Excel
              </p>
            </div>
          )}

          {activeStep === 2 && fileData && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Map Your Columns
              </h3>
              <p className="text-gray-600 mb-6">
                Match your file columns to our enrichment fields. We've
                suggested mappings based on your column names.
              </p>

              <div className="space-y-4 mb-6">
                {fileData.headers &&
                  fileData.headers.map((header, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Column:{" "}
                          <span className="font-semibold">{header}</span>
                        </label>
                        {fileData.sampleData && fileData.sampleData[0] && (
                          <p className="text-sm text-gray-500 mt-1">
                            Sample: {fileData.sampleData[0][header]}
                          </p>
                        )}
                      </div>
                      <div className="flex-1">
                        <select
                          value={
                            Object.keys(columnMapping).find(
                              (key) => columnMapping[key] === header,
                            ) || ""
                          }
                          onChange={(e) => {
                            const newMapping = { ...columnMapping };
                            // Remove old mapping for this header
                            Object.keys(newMapping).forEach((key) => {
                              if (newMapping[key] === header) {
                                delete newMapping[key];
                              }
                            });
                            // Add new mapping if selected
                            if (e.target.value) {
                              newMapping[e.target.value] = header;
                            }
                            setColumnMapping(newMapping);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select enrichment field...</option>
                          {Object.entries(enrichmentFields).map(
                            ([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setActiveStep(1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleStartEnrichment}
                  disabled={Object.keys(columnMapping).length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Enrichment
                </button>
              </div>
            </div>
          )}

          {activeStep === 3 && processingJob && (
            <div className="text-center py-12">
              <Loader className="mx-auto h-16 w-16 text-blue-600 animate-spin mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Processing Your Data
              </h3>
              <p className="text-gray-600 mb-6">
                We're enriching your {processingJob.total_records} contacts.
                This may take a few minutes.
              </p>

              <div className="max-w-md mx-auto mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{processingJob.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${processingJob.progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {processingJob.processed_records} of{" "}
                  {processingJob.total_records} records processed
                </p>
              </div>

              {processingJob.status === "completed" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                  <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                  <p className="text-green-800 font-medium">
                    Enrichment Complete!
                  </p>
                  <p className="text-green-600 text-sm">
                    Your enriched data is ready for download.
                  </p>
                </div>
              )}

              {processingJob.status === "failed" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                  <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
                  <p className="text-red-800 font-medium">Enrichment Failed</p>
                  <p className="text-red-600 text-sm">
                    {processingJob.error_message}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Previous Jobs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Recent Enrichment Jobs
          </h3>

          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No enrichment jobs yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(job.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">{job.name}</h4>
                      <p className="text-sm text-gray-600">
                        {job.total_records} records •{" "}
                        {new Date(job.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}
                    >
                      {job.status}
                    </span>
                    {job.status === "completed" && job.output_file_url && (
                      <a
                        href={job.output_file_url}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                      >
                        <Download size={16} />
                        <span>Download</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
