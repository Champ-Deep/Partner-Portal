import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Building,
  Users,
  MapPin,
  Cpu,
} from "lucide-react";
import {
  industryOptions,
  companySizeOptions,
  regionOptions,
  technologyOptions,
} from "@/config/icpConstants";
import ChipInput from "./ChipInput";
import EstimatedResults from "./EstimatedResults";

export default function ICPBuilderForm({
  editingFilter,
  onClose,
  onSave,
  saving,
}) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      industries: [],
      company_size: "",
      regions: [],
      technologies: [],
    },
  });

  const [estimatedCount, setEstimatedCount] = useState(0);
  const watchedFields = watch();

  useEffect(() => {
    if (editingFilter) {
      const filterData =
        typeof editingFilter.filters === "string"
          ? JSON.parse(editingFilter.filters)
          : editingFilter.filters;
      reset({
        name: editingFilter.name,
        description: editingFilter.description || "",
        industries: filterData.industries || [],
        company_size: filterData.company_size || "",
        regions: filterData.regions || [],
        technologies: filterData.technologies || [],
      });
    } else {
      reset({
        name: "",
        description: "",
        industries: [],
        company_size: "",
        regions: [],
        technologies: [],
      });
    }
  }, [editingFilter, reset]);

  useEffect(() => {
    const { industries, company_size, regions, technologies } = watchedFields;
    let estimate = 50000;

    if (industries?.length > 0)
      estimate *= Math.min(industries.length * 0.6, 2.5);
    if (company_size) {
      const sizeMultiplier = {
        "1-10": 0.3,
        "11-50": 0.5,
        "51-200": 0.7,
        "201-500": 0.4,
        "501-1000": 0.3,
        "1000+": 0.2,
      };
      estimate *= sizeMultiplier[company_size] || 0.5;
    }
    if (regions?.length > 0)
      estimate *= Math.min(regions.length * 0.4, 1.8);
    if (technologies?.length > 0)
      estimate *= Math.min(technologies.length * 0.3, 1.5);

    setEstimatedCount(Math.floor(Math.max(estimate, 100)));
  }, [watchedFields]);

  const onSubmit = (data) => {
    onSave(data, estimatedCount);
  };

  const clearAllFilters = () => {
    reset({
      name: watchedFields.name,
      description: watchedFields.description,
      industries: [],
      company_size: "",
      regions: [],
      technologies: [],
    });
  };

  const removeChip = (fieldName, value) => {
    setValue(
      fieldName,
      (watchedFields[fieldName] || []).filter((item) => item !== value)
    );
  };

  const addToArray = (fieldName, value) => {
    const currentArray = watchedFields[fieldName] || [];
    if (!currentArray.includes(value)) {
      setValue(fieldName, [...currentArray, value]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to ICP Filters</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Name *
              </label>
              <Controller
                name="name"
                control={control}
                rules={{ required: "Filter name is required" }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="e.g., Enterprise Tech Companies"
                  />
                )}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of this ICP"
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Filter Criteria
            </h3>
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RotateCcw size={16} />
              Clear All Filters
            </button>
          </div>
          <div className="space-y-8">
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="mr-2" size={18} /> Industries
              </h4>
              <ChipInput
                control={control}
                options={industryOptions}
                fieldName="industries"
                removeChip={removeChip}
                addToArray={addToArray}
              />
            </div>
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="mr-2" size={18} /> Company Size
              </h4>
              <Controller
                name="company_size"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {companySizeOptions.map((size) => (
                      <label key={size.value} className="relative cursor-pointer">
                        <input
                          type="radio"
                          {...field}
                          value={size.value}
                          checked={field.value === size.value}
                          className="sr-only"
                        />
                        <div
                          className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                            field.value === size.value
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="font-medium">{size.value} employees</div>
                          <div className="text-sm text-gray-600">
                            {size.label.split("(")[1]?.replace(")", "") || ""}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              />
            </div>
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="mr-2" size={18} /> Geographic Regions
              </h4>
              <ChipInput
                control={control}
                options={regionOptions}
                fieldName="regions"
                removeChip={removeChip}
                addToArray={addToArray}
              />
            </div>
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                <Cpu className="mr-2" size={18} /> Technologies Used
              </h4>
              <ChipInput
                control={control}
                options={technologyOptions}
                fieldName="technologies"
                removeChip={removeChip}
                addToArray={addToArray}
              />
            </div>
          </div>
        </div>

        <EstimatedResults
          estimatedCount={estimatedCount}
          watchedFields={watchedFields}
        />

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving
              ? "Saving..."
              : editingFilter
              ? "Update Filter"
              : "Save Filter"}
          </button>
        </div>
      </form>
    </div>
  );
}
