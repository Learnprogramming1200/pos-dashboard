"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Check, Search, Store, MapPin, Phone, Mail } from 'lucide-react';
import { AdminTypes } from '@/types';

interface StoreSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (store: AdminTypes.storeTypes.Store) => void;
  selectedStore?: AdminTypes.storeTypes.Store | null;
  stores: AdminTypes.storeTypes.Store[];
}

export default function StoreSelectionModal({
  isOpen,
  onClose,
  onSelect,
  selectedStore,
  stores = []
}: StoreSelectionModalProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filteredStores, setFilteredStores] = React.useState<AdminTypes.storeTypes.Store[]>(stores);
  const [hoveredStore, setHoveredStore] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = stores.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.location.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStores(filtered);
    } else {
      setFilteredStores(stores);
    }
  }, [searchTerm, stores]);

  const handleStoreSelect = (store: AdminTypes.storeTypes.Store) => {
    onSelect(store);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent, store: AdminTypes.storeTypes.Store) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleStoreSelect(store);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Select Store
          </DialogTitle>
          <DialogDescription>
            Choose a store for label generation. This will determine the store information displayed on the labels.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search stores by name, address, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Store Display */}
          {selectedStore && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Selected Store:</span>
                  <span className="text-blue-800">{selectedStore.name}</span>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  {selectedStore.location.city}, {selectedStore.location.state}
                </Badge>
              </div>
            </div>
          )}

          {/* Stores List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredStores.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Store className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No stores found matching your search.</p>
              </div>
            ) : (
              filteredStores.map((store) => (
                <div
                  key={store._id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedStore?._id === store._id
                    ? 'border-blue-500 bg-blue-50'
                    : hoveredStore === store._id
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                  onClick={() => handleStoreSelect(store)}
                  onMouseEnter={() => setHoveredStore(store._id ?? null)}
                  onMouseLeave={() => setHoveredStore(null)}
                  onKeyDown={(e) => handleKeyPress(e, store)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Select store ${store.name}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {store.name}
                        </h3>
                        {selectedStore?._id === store._id && (
                          <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{store.location.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{store.location.city}, {store.location.state} {store.location.postalCode}</span>
                        </div>
                        {store.contactNumber && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            <span>{store.contactNumber}</span>
                          </div>
                        )}
                        {store.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{store.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex-shrink-0">
                      <Badge
                        variant={store.status ? 'default' : 'secondary'}
                        className={
                          store.status
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {store.status ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {selectedStore && (
              <Button onClick={() => handleStoreSelect(selectedStore)}>
                <Check className="w-4 h-4 mr-2" />
                Confirm Selection
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
