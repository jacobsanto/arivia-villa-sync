
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Save, Calendar } from 'lucide-react';
import { useRuleBasedCleaningSystem, CleaningAction } from '@/hooks/useRuleBasedCleaningSystem';
import { guestyService } from '@/services/guesty/guesty.service';

interface RuleBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  existingRule?: any;
}

export const RuleBuilder: React.FC<RuleBuilderProps> = ({ isOpen, onClose, onSave, existingRule }) => {
  const { actions, rules, createCleaningRule, updateCleaningRule } = useRuleBasedCleaningSystem();
  
  // Standard global rule configurations
  const GLOBAL_RULE_CONFIGS = {
    'SHORT STAY': { min: 1, max: 3, description: 'Short stays (1-3 nights)' },
    'MEDIUM STAY': { min: 4, max: 7, description: 'Medium stays (4-7 nights)' },
    'EXTENDED STAY': { min: 8, max: 999, description: 'Extended stays (8+ nights)' }
  };
  
  // Initialize form state
  const [ruleName, setRuleName] = useState(existingRule?.rule_name || '');
  const [isGlobal, setIsGlobal] = useState(existingRule?.is_global ?? true);
  const [stayRangeMin, setStayRangeMin] = useState(
    existingRule?.stay_length_range?.[0] || existingRule?.min_nights || 1
  );
  const [stayRangeMax, setStayRangeMax] = useState(
    existingRule?.stay_length_range?.[1] || existingRule?.max_nights || 7
  );
  const [actionsByDay, setActionsByDay] = useState<Record<string, string[]>>(existingRule?.actions_by_day || {});
  const [selectedProperties, setSelectedProperties] = useState<string[]>(existingRule?.assignable_properties || []);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchProperties = async () => {
      try {
        const listings = await guestyService.getGuestyListings();
        setProperties(listings);
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };

    if (isOpen) {
      fetchProperties();
    }
  }, [isOpen]);

  const actionsByCategory = actions.reduce((acc, action) => {
    if (!acc[action.category]) acc[action.category] = [];
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, CleaningAction[]>);

  const addActionToDay = (day: number, actionName: string) => {
    const dayKey = day.toString();
    setActionsByDay(prev => ({
      ...prev,
      [dayKey]: [...(prev[dayKey] || []), actionName]
    }));
  };

  const removeActionFromDay = (day: number, actionName: string) => {
    const dayKey = day.toString();
    setActionsByDay(prev => ({
      ...prev,
      [dayKey]: (prev[dayKey] || []).filter(a => a !== actionName)
    }));
  };

  const handleRuleSelection = (value: string) => {
    setRuleName(value);
    
    if (isGlobal && GLOBAL_RULE_CONFIGS[value]) {
      const config = GLOBAL_RULE_CONFIGS[value];
      setStayRangeMin(config.min);
      setStayRangeMax(config.max);
    }
  };

  const handleSave = async () => {
    if (!ruleName.trim()) {
      return;
    }

    // Prevent duplicate global rules (only for new rules)
    if (isGlobal && !existingRule) {
      const existingGlobalRule = rules.find(r => r.rule_name === ruleName && r.is_global);
      if (existingGlobalRule) {
        alert(`Global rule "${ruleName}" already exists. Please choose a different rule type.`);
        return;
      }
    }

    setLoading(true);
    try {
      const ruleData = {
        rule_name: ruleName,
        stay_length_range: [stayRangeMin, stayRangeMax],
        actions_by_day: actionsByDay,
        is_global: isGlobal,
        assignable_properties: selectedProperties,
        is_active: true,
        config_id: 'default',
        min_nights: stayRangeMin,
        max_nights: stayRangeMax
      };

      if (existingRule) {
        await updateCleaningRule(existingRule.id, ruleData);
      } else {
        await createCleaningRule(ruleData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving rule:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDayActions = (day: number) => {
    const dayKey = day.toString();
    const dayActions = actionsByDay[dayKey] || [];

    return (
      <Card key={day} className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <Label className="font-medium">Day {day}</Label>
          </div>
          <Select onValueChange={(value) => addActionToDay(day, value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Add action" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(actionsByCategory).map(([category, categoryActions]) => (
                <div key={category}>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                    {category}
                  </div>
                  {categoryActions.map(action => (
                    <SelectItem 
                      key={action.action_name} 
                      value={action.action_name}
                      disabled={dayActions.includes(action.action_name)}
                    >
                      {action.display_name}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          {dayActions.map(actionName => {
            const action = actions.find(a => a.action_name === actionName);
            return (
              <div key={actionName} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                <div>
                  <span className="font-medium">{action?.display_name}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    ({action?.estimated_duration}min)
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeActionFromDay(day, actionName)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
          {dayActions.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No actions scheduled for this day</p>
          )}
        </div>
      </Card>
    );
  };

  const isEditingGlobalRule = existingRule && existingRule.is_global;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingRule ? 'Edit Cleaning Rule' : 'Create New Cleaning Rule'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Rule Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rule-name">Rule Name</Label>
                {isGlobal && !isEditingGlobalRule ? (
                  <Select value={ruleName} onValueChange={handleRuleSelection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a global rule type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(GLOBAL_RULE_CONFIGS).map(([name, config]) => (
                        <SelectItem key={name} value={name}>
                          {name} - {config.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="rule-name"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="e.g., Custom Property Rule"
                    disabled={isEditingGlobalRule}
                  />
                )}
                {isEditingGlobalRule && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Global rule names cannot be modified
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-nights">Minimum Nights</Label>
                  <Input
                    id="min-nights"
                    type="number"
                    value={stayRangeMin}
                    onChange={(e) => setStayRangeMin(parseInt(e.target.value))}
                    min="1"
                    disabled={isGlobal && GLOBAL_RULE_CONFIGS[ruleName]}
                  />
                </div>
                <div>
                  <Label htmlFor="max-nights">Maximum Nights</Label>
                  <Input
                    id="max-nights"
                    type="number"
                    value={stayRangeMax}
                    onChange={(e) => setStayRangeMax(parseInt(e.target.value))}
                    min="1"
                    disabled={isGlobal && GLOBAL_RULE_CONFIGS[ruleName]}
                  />
                </div>
              </div>
              {isGlobal && GLOBAL_RULE_CONFIGS[ruleName] && (
                <p className="text-sm text-muted-foreground">
                  Stay ranges for global rules are predefined and cannot be modified
                </p>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-global"
                  checked={isGlobal}
                  onCheckedChange={(checked) => setIsGlobal(checked as boolean)}
                  disabled={isEditingGlobalRule}
                />
                <Label htmlFor="is-global">Apply to all properties (global rule)</Label>
                {isEditingGlobalRule && (
                  <span className="text-sm text-muted-foreground">(cannot be changed)</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Property Assignment */}
          {!isGlobal && (
            <Card>
              <CardHeader>
                <CardTitle>Property Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {properties.map(property => (
                    <div key={property.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`property-${property.id}`}
                        checked={selectedProperties.includes(property.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProperties(prev => [...prev, property.id]);
                          } else {
                            setSelectedProperties(prev => prev.filter(id => id !== property.id));
                          }
                        }}
                      />
                      <Label htmlFor={`property-${property.id}`} className="text-sm">
                        {property.title}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions by Day */}
          <Card>
            <CardHeader>
              <CardTitle>Cleaning Actions by Day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {Array.from({ length: Math.min(stayRangeMax, 7) }, (_, i) => i + 1).map(day => 
                  renderDayActions(day)
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !ruleName.trim()}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Rule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
