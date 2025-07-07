import React, { useState } from 'react';
import { Card } from '@/components/ui/card';


interface OrganizationControlsCardProps {
  controls: string[];
  onAddControl: (controlName: string) => Promise<void>;
  onRemoveControl?: (controlName: string) => Promise<void>;
  loading?: boolean;
  organizationName?: string;
}

const OrganizationControlsCard: React.FC<OrganizationControlsCardProps> = ({
  controls,
  onAddControl,
  onRemoveControl,
  loading = false,
  organizationName = "Organization"
}) => {
  const [newControlName, setNewControlName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddControl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newControlName.trim()) return;

    setIsAdding(true);
    try {
      await onAddControl(newControlName.trim());
      setNewControlName(''); // Clear input on success
    } catch (error) {
      console.error('Error adding control:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveControl = async (controlName: string) => {
    if (onRemoveControl) {
      try {
        await onRemoveControl(controlName);
      } catch (error) {
        console.error('Error removing control:', error);
      }
    }
  };

  return (
    <Card className="bg-gray-300 text-black p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Organization Controls</h2>
        <span className="text-sm text-gray-600">
          {controls.length} control{controls.length !== 1 ? 's' : ''}
        </span>
      </div>

      <p className="mb-4 text-sm text-gray-700">
        <strong>{organizationName}</strong> security controls
      </p>

      {/* Add New Control Form */}
      <form onSubmit={handleAddControl} className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newControlName}
            onChange={(e) => setNewControlName(e.target.value)}
            placeholder="Enter new control name..."
            className="flex-1 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isAdding}
          />
          <button
            type="submit"
            disabled={isAdding || !newControlName.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-4 text-gray-600">
          Loading controls...
        </div>
      ) : (
        <>
          {/* Controls List */}
          {controls.length === 0 ? (
            <div className="text-center py-4 text-gray-600">
              No controls found. Add your first control above.
            </div>
          ) : (
            <div className="space-y-2">
              {controls.map((control, index) => (
                <div
                  key={`${control}-${index}`}
                  className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200"
                >
                  <span className="font-medium">{control}</span>
                  {onRemoveControl && (
                    <button
                      onClick={() => handleRemoveControl(control)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                      title={`Remove ${control}`}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Quick Add Suggestions */}
      {controls.length === 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Suggested controls:</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              'Web Application Firewall',
              'Input Sanitization',
              'Authentication Controls',
              'Network Segmentation'
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setNewControlName(suggestion)}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default OrganizationControlsCard;