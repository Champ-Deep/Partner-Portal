import { useState, useEffect, useCallback } from "react";

export function useICPFilters() {
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchFilters = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/icp/filters");
      if (response.ok) {
        const data = await response.json();
        setFilters(data.filters || []);
      }
    } catch (error) {
      console.error("Error fetching filters:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const saveFilter = async (formData, estimatedCount, editingFilter) => {
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        filters: {
          industries: formData.industries,
          company_size: formData.company_size,
          regions: formData.regions,
          technologies: formData.technologies,
        },
        estimated_count: estimatedCount,
      };

      const url = editingFilter
        ? `/api/icp/filters/${editingFilter.id}`
        : "/api/icp/filters";
      const method = editingFilter ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchFilters();
        return true;
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save filter");
        return false;
      }
    } catch (error) {
      console.error("Error saving filter:", error);
      alert("Failed to save filter");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteFilter = async (filterId) => {
    if (!confirm("Are you sure you want to delete this ICP filter?")) {
      return;
    }
    try {
      const response = await fetch(`/api/icp/filters/${filterId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchFilters();
      } else {
        alert("Failed to delete filter");
      }
    } catch (error) {
      console.error("Error deleting filter:", error);
      alert("Failed to delete filter");
    }
  };

  return { filters, loading, saving, saveFilter, deleteFilter };
}
