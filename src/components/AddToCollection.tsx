import { useState } from 'react';
import { Button } from './ui/button';
import { useCollections } from '@/hooks/useCollections';
import { FolderPlus, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from './ui/input';

interface AddToCollectionProps {
  packageName: string;
}

export function AddToCollection({ packageName }: AddToCollectionProps) {
  const collections = useCollections();
  const [showNewForm, setShowNewForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const handleCreateAndAdd = () => {
    if (newCollectionName.trim()) {
      const newCollection = collections.createCollection(newCollectionName.trim());
      collections.addPackageToCollection(newCollection.id, packageName);
      setNewCollectionName('');
      setShowNewForm(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FolderPlus className="h-4 w-4" />
          Add to Collection
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {collections.collections.length === 0 && !showNewForm ? (
          <div className="p-3 text-center">
            <p className="text-sm text-muted-foreground mb-3">No collections yet</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowNewForm(true)}
              className="w-full gap-2"
            >
              <Plus className="h-3 w-3" />
              Create Collection
            </Button>
          </div>
        ) : showNewForm ? (
          <div className="p-3 space-y-2">
            <Input
              placeholder="Collection name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateAndAdd();
                }
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateAndAdd} disabled={!newCollectionName.trim()}>
                Create
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowNewForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {collections.collections.map((collection) => {
              const isAdded = collections.isPackageInCollection(collection.id, packageName);
              return (
                <DropdownMenuItem
                  key={collection.id}
                  onClick={() => {
                    if (isAdded) {
                      collections.removePackageFromCollection(collection.id, packageName);
                    } else {
                      collections.addPackageToCollection(collection.id, packageName);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">{collection.name}</span>
                    {isAdded && <Check className="h-4 w-4 text-primary ml-2 shrink-0" />}
                  </div>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowNewForm(true)}
              className="cursor-pointer text-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Collection
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
