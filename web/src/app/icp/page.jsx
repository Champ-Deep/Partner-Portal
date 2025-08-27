"use client";
import { useState } from "react";
import useUser from "@/utils/useUser";
import { useICPFilters } from "@/hooks/useICPFilters";
import Header from "@/components/icp/Header";
import Loader from "@/components/icp/Loader";
import ICPFilterList from "@/components/icp/ICPFilterList";
import ICPBuilderForm from "@/components/icp/ICPBuilderForm";

export default function ICPPage() {
  const { data: user, loading: userLoading } = useUser();
  const {
    filters,
    loading: filtersLoading,
    saving,
    saveFilter,
    deleteFilter,
  } = useICPFilters();

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingFilter, setEditingFilter] = useState(null);

  const handleNew = () => {
    setEditingFilter(null);
    setShowBuilder(true);
  };

  const handleEdit = (filter) => {
    setEditingFilter(filter);
    setShowBuilder(true);
  };

  const handleCloseBuilder = () => {
    setEditingFilter(null);
    setShowBuilder(false);
  };

  const handleSave = async (formData, estimatedCount) => {
    const success = await saveFilter(formData, estimatedCount, editingFilter);
    if (success) {
      handleCloseBuilder();
    }
  };

  if (userLoading || filtersLoading) {
    return <Loader />;
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/account/signin";
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main>
        {showBuilder ? (
          <ICPBuilderForm
            editingFilter={editingFilter}
            onClose={handleCloseBuilder}
            onSave={handleSave}
            saving={saving}
          />
        ) : (
          <ICPFilterList
            filters={filters}
            onNew={handleNew}
            onEdit={handleEdit}
            onDelete={deleteFilter}
          />
        )}
      </main>
    </div>
  );
}
