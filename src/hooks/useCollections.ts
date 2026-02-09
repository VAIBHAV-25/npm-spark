import { useState, useEffect } from 'react';

export interface Collection {
  id: string;
  name: string;
  description: string;
  packages: string[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

const STORAGE_KEY = 'npm-spark-collections';

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCollections(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing collections:', error);
      }
    }
  }, []);

  const saveCollections = (newCollections: Collection[]) => {
    setCollections(newCollections);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCollections));
  };

  const createCollection = (name: string, description: string = '') => {
    const newCollection: Collection = {
      id: `col_${Date.now()}`,
      name,
      description,
      packages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false,
    };
    saveCollections([...collections, newCollection]);
    return newCollection;
  };

  const updateCollection = (id: string, updates: Partial<Collection>) => {
    const updated = collections.map((col) =>
      col.id === id ? { ...col, ...updates, updatedAt: new Date().toISOString() } : col
    );
    saveCollections(updated);
  };

  const deleteCollection = (id: string) => {
    saveCollections(collections.filter((col) => col.id !== id));
  };

  const addPackageToCollection = (collectionId: string, packageName: string) => {
    const updated = collections.map((col) => {
      if (col.id === collectionId && !col.packages.includes(packageName)) {
        return {
          ...col,
          packages: [...col.packages, packageName],
          updatedAt: new Date().toISOString(),
        };
      }
      return col;
    });
    saveCollections(updated);
  };

  const removePackageFromCollection = (collectionId: string, packageName: string) => {
    const updated = collections.map((col) => {
      if (col.id === collectionId) {
        return {
          ...col,
          packages: col.packages.filter((pkg) => pkg !== packageName),
          updatedAt: new Date().toISOString(),
        };
      }
      return col;
    });
    saveCollections(updated);
  };

  const isPackageInCollection = (collectionId: string, packageName: string) => {
    const collection = collections.find((col) => col.id === collectionId);
    return collection?.packages.includes(packageName) || false;
  };

  const getCollectionsForPackage = (packageName: string) => {
    return collections.filter((col) => col.packages.includes(packageName));
  };

  return {
    collections,
    createCollection,
    updateCollection,
    deleteCollection,
    addPackageToCollection,
    removePackageFromCollection,
    isPackageInCollection,
    getCollectionsForPackage,
  };
}
