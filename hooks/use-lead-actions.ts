import { useState } from "react";
import { Lead, LeadFormData, LeadUI } from "@/types/leadtypes";
import { createLead, updateLead } from "@/services/leads";

interface UseLeadActionsOptions {
  onSuccess: () => Promise<void>;
}

export function useLeadActions({ onSuccess }: UseLeadActionsOptions) {
  const [isFormOpen,   setIsFormOpen]   = useState(false);
  const [editingLead,  setEditingLead]  = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadUI | null>(null);

  const openAddForm = () => {
    setEditingLead(null);
    setIsFormOpen(true);
  };

  const openEditForm = (lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingLead(null);
  };

  const handleFormSubmit = async (formData: LeadFormData) => {
    if (editingLead) {
      await updateLead(editingLead.uuid, formData);  // uuid = crm_leads.id (real PK)
    } else {
      await createLead(formData);
    }
    await onSuccess();
    closeForm();
  };

  return {
    isFormOpen,
    editingLead,
    selectedLead,
    openAddForm,
    openEditForm,
    closeForm,
    setSelectedLead,
    handleFormSubmit,
  };
}
