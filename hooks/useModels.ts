// hooks/useModels.ts
import { useState, useEffect, useCallback } from "react";

export interface Model {
  $id: string;
  name: string;
  description: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  userId: string;
  kindeUserId: string;
  isPublic: boolean;
  createdAt: string;
}

export interface ModelsResponse {
  success: boolean;
  models: Model[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UseModelsOptions {
  page?: number;
  limit?: number;
  search?: string;
  publicOnly?: boolean;
  autoFetch?: boolean;
}

export function useModels(options: UseModelsOptions = {}) {
  const {
    page = 1,
    limit = 10,
    search = "",
    publicOnly = false,
    autoFetch = true,
  } = options;

  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchModels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(publicOnly && { public: "true" }),
      });

      const response = await fetch(`/api/models?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch models");
      }

      const data: ModelsResponse = await response.json();

      setModels(data.models);
      setPagination({
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, publicOnly]);

  useEffect(() => {
    if (autoFetch) {
      fetchModels();
    }
  }, [fetchModels, autoFetch]);

  const refresh = useCallback(() => {
    fetchModels();
  }, [fetchModels]);

  return {
    models,
    loading,
    error,
    pagination,
    refresh,
    fetchModels,
  };
}

// hooks/useModel.ts
export function useModel(modelId: string | null) {
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModel = useCallback(async () => {
    if (!modelId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/models/${modelId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch model");
      }

      const data = await response.json();
      setModel(data.model);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [modelId]);

  useEffect(() => {
    fetchModel();
  }, [fetchModel]);

  const updateModel = useCallback(
    async (
      updates: Partial<Pick<Model, "name" | "description" | "isPublic">>
    ) => {
      if (!modelId) throw new Error("No model ID provided");

      try {
        const response = await fetch(`/api/models/${modelId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update model");
        }

        const data = await response.json();
        setModel(data.model);
        return data.model;
      } catch (err) {
        throw err;
      }
    },
    [modelId]
  );

  const deleteModel = useCallback(async () => {
    if (!modelId) throw new Error("No model ID provided");

    try {
      const response = await fetch(`/api/models/${modelId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete model");
      }

      setModel(null);
      return true;
    } catch (err) {
      throw err;
    }
  }, [modelId]);

  return {
    model,
    loading,
    error,
    updateModel,
    deleteModel,
    refresh: fetchModel,
  };
}

// hooks/useModelActions.ts
export function useModelActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateModel = useCallback(
    async (
      modelId: string,
      updates: Partial<Pick<Model, "name" | "description" | "isPublic">>
    ) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/models/${modelId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update model");
        }

        const data = await response.json();
        return data.model;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteModel = useCallback(async (modelId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/models/${modelId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete model");
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const duplicateModel = useCallback(
    async (modelId: string, newName: string) => {
      // This would require an additional API endpoint
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/models/${modelId}/duplicate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newName }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to duplicate model");
        }

        const data = await response.json();
        return data.model;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    updateModel,
    deleteModel,
    duplicateModel,
    loading,
    error,
  };
}
