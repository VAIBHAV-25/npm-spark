import { useState } from 'react';
import { Header } from '@/components/Header';
import { StarfieldEffect } from '@/components/StarfieldEffect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCollections } from '@/hooks/useCollections';
import {
  FolderOpen,
  Plus,
  Trash2,
  Edit,
  Package,
  Calendar,
  Share2,
  Download,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatRelativeDate } from '@/lib/npm-api';

export default function CollectionsPage() {
  const collections = useCollections();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = () => {
    if (newCollectionName.trim()) {
      collections.createCollection(newCollectionName.trim(), newCollectionDesc.trim());
      setNewCollectionName('');
      setNewCollectionDesc('');
      setShowCreateForm(false);
    }
  };

  const handleExport = (collectionId: string) => {
    const collection = collections.collections.find((c) => c.id === collectionId);
    if (!collection) return;

    const data = {
      name: collection.name,
      description: collection.description,
      packages: collection.packages,
      createdAt: collection.createdAt,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collection.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <StarfieldEffect />
      
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 80%)`
        }}
      />

      <div className="relative z-10">
        <Header />
        
        <main className="container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8 animate-fade-in-up">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <FolderOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm text-primary font-medium">Package Collections</span>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  My Collections
                </h1>
                <p className="text-muted-foreground">
                  Organize packages into curated lists and stacks
                </p>
              </div>
              <Button onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Collection
              </Button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
              <div className="glass-card p-6 mb-6 animate-fade-in">
                <h3 className="font-semibold mb-4">Create New Collection</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Collection Name
                    </label>
                    <Input
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="e.g., My React Stack 2026"
                      className="bg-secondary"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Description (optional)
                    </label>
                    <Textarea
                      value={newCollectionDesc}
                      onChange={(e) => setNewCollectionDesc(e.target.value)}
                      placeholder="Describe your collection..."
                      className="bg-secondary"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreate} disabled={!newCollectionName.trim()}>
                      Create Collection
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Collections List */}
            {collections.collections.length === 0 ? (
              <div className="glass-card p-12 text-center animate-fade-in-up animation-delay-200">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Collections Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first collection to organize packages
                </p>
                <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Collection
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {collections.collections.map((collection, idx) => (
                  <div
                    key={collection.id}
                    className="glass-card p-6 animate-fade-in-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {collection.name}
                        </h3>
                        {collection.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {collection.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {collection.packages.length} packages
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Updated {formatRelativeDate(collection.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleExport(collection.id)}
                          title="Export collection"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => collections.deleteCollection(collection.id)}
                          title="Delete collection"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Packages */}
                    {collection.packages.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {collection.packages.map((pkg) => (
                          <Link
                            key={pkg}
                            to={`/package/${encodeURIComponent(pkg)}`}
                            className="chip hover:bg-primary/20 hover:text-primary"
                          >
                            {pkg}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No packages added yet. Visit a package page to add it to this collection.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Starter Kits Section */}
            <div className="mt-12 glass-card p-6 animate-fade-in-up animation-delay-400">
              <h3 className="text-lg font-semibold mb-4">Popular Starter Kits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StarterKit
                  name="React Full Stack"
                  packages={['react', 'react-dom', 'vite', 'tailwindcss', 'react-router-dom']}
                  description="Modern React development stack"
                />
                <StarterKit
                  name="Node.js Backend"
                  packages={['express', 'typescript', 'prisma', 'zod', 'dotenv']}
                  description="Backend API development"
                />
                <StarterKit
                  name="Testing Suite"
                  packages={['vitest', 'testing-library', 'playwright', 'msw']}
                  description="Comprehensive testing tools"
                />
                <StarterKit
                  name="Data Visualization"
                  packages={['d3', 'recharts', 'chart.js', 'plotly.js']}
                  description="Charts and graphs"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StarterKit({
  name,
  packages,
  description,
}: {
  name: string;
  packages: string[];
  description: string;
}) {
  return (
    <div className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
      <h4 className="font-semibold mb-1">{name}</h4>
      <p className="text-xs text-muted-foreground mb-3">{description}</p>
      <div className="flex flex-wrap gap-1">
        {packages.map((pkg) => (
          <Link
            key={pkg}
            to={`/package/${encodeURIComponent(pkg)}`}
            className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20"
          >
            {pkg}
          </Link>
        ))}
      </div>
    </div>
  );
}
