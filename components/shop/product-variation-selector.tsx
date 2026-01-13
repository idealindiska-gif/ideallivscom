'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Product, ProductVariation, ProductAttribute } from '@/types/woocommerce';

interface ProductVariationSelectorProps {
  product: Product;
  variations: ProductVariation[];
  onVariationChange?: (variation: ProductVariation | null) => void;
  className?: string;
}

export function ProductVariationSelector({
  product,
  variations,
  onVariationChange,
  className,
}: ProductVariationSelectorProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);

  // Extract attributes from variations if product.attributes is empty or invalid
  const [variationAttributes, setVariationAttributes] = useState<ProductAttribute[]>([]);

  useEffect(() => {
    console.log('🎨 ProductVariationSelector mounted');
    console.log('📦 Product:', product.name);
    console.log('📋 Product attributes:', product.attributes);
    console.log('🔢 Variations count:', variations.length);
    console.log('🔍 Variations:', variations);

    // Extract unique attribute names from variations
    if (variations.length > 0) {
      const attributeMap = new Map<string, { id: number; name: string }>();

      variations.forEach((variation) => {
        variation.attributes.forEach((attr) => {
          if (!attributeMap.has(attr.name)) {
            attributeMap.set(attr.name, {
              id: attr.id,
              name: attr.name,
            });
          }
        });
      });

      const extractedAttributes = Array.from(attributeMap.values()).map((attr) => ({
        id: attr.id,
        name: attr.name,
        position: 0,
        visible: true,
        variation: true,
        options: [],
      }));

      console.log('🔧 Extracted attributes from variations:', extractedAttributes);
      setVariationAttributes(extractedAttributes);
    }
  }, [product, variations]);

  // Get unique attribute values
  const getAttributeOptions = (attribute: ProductAttribute) => {
    // If the attribute has the options array (from product.attributes), use it primarily
    if (attribute.options && attribute.options.length > 0) {
      console.log(`🎯 Using defined options for "${attribute.name}":`, attribute.options);
      return attribute.options;
    }

    // Fallback: extract from variations (what was there before)
    const options = new Set<string>();
    variations.forEach((variation) => {
      const attr = variation.attributes.find((a) => a.name === attribute.name);
      if (attr) {
        options.add(attr.option);
      }
    });
    console.log(`🎯 Extracted options for "${attribute.name}":`, Array.from(options));
    return Array.from(options);
  };

  // Find matching variation based on selected attributes
  useEffect(() => {
    // Use extracted attributes if product.attributes is empty
    const baseAttributes = product.attributes && product.attributes.length > 0
      ? product.attributes
      : variationAttributes;

    // CRITICAL FIX: Only check variation attributes (filter out non-variation attributes)
    const attributesToCheck = baseAttributes.filter(attr => attr.variation);

    console.log('🔍 Checking variation match:', {
      allAttributes: baseAttributes.map(a => ({ name: a.name, variation: a.variation })),
      attributesToCheck: attributesToCheck.map(a => a.name),
      selectedAttributes,
      totalVariations: variations.length
    });

    const allAttributesSelected = attributesToCheck.every(
      (attr) => selectedAttributes[attr.name]
    );

    console.log('✅ All attributes selected?', allAttributesSelected, `(${Object.keys(selectedAttributes).length}/${attributesToCheck.length})`);

    // Prioritize variations with more specific attribute matches
    const sortedVariations = [...variations].sort((a, b) => b.attributes.length - a.attributes.length);

    const matchingVariation = sortedVariations.find((variation) => {
      // A variation matches if EVERY attribute it defines matching our current selection
      // (Empty attributes in a variation act as wildcards in WooCommerce)
      const matches = variation.attributes.every((attr) => {
        const match = selectedAttributes[attr.name] === attr.option;
        console.log(`  Checking ${variation.id} - ${attr.name}: ${selectedAttributes[attr.name]} === ${attr.option} ? ${match}`);
        return match;
      });
      return matches;
    });

    console.log('🎯 Best matching variation found:', matchingVariation?.id || 'none');

    setSelectedVariation(matchingVariation || null);
    onVariationChange?.(matchingVariation || null);
  }, [selectedAttributes, variations, product.attributes, variationAttributes, onVariationChange]);

  const handleAttributeChange = (attributeName: string, value: string) => {
    console.log(`🎨 Attribute changed: ${attributeName} = ${value}`);
    setSelectedAttributes((prev) => {
      const updated = {
        ...prev,
        [attributeName]: value,
      };
      console.log('📝 Updated selections:', updated);
      return updated;
    });
  };

  // Check if an option is available (in stock) for a given attribute
  const isOptionAvailable = (attributeName: string, option: string): boolean => {
    // Get all combinations that include this option
    const matchingVariations = variations.filter((variation) => {
      const attr = variation.attributes.find((a) => a.name === attributeName);

      // If variation has the attribute, it must match the option
      if (attr) {
        return attr.option === option;
      }

      // If variation has NO attributes at all, it's a wildcard match
      return variation.attributes.length === 0;
    });

    // Check if any matching variation is in stock
    return matchingVariations.some((v) => v.stock_status === 'instock');
  };

  // Use extracted attributes if product.attributes is empty
  const attributesToDisplay = (product.attributes && product.attributes.length > 0
    ? product.attributes
    : variationAttributes).filter(attr => attr.variation);

  if (!attributesToDisplay || attributesToDisplay.length === 0) {
    console.log('⚠️ No variation attributes to display');
    return null;
  }

  console.log('✅ Displaying attributes:', attributesToDisplay);

  return (
    <div className={cn('space-y-6', className)}>
      {attributesToDisplay.map((attribute) => {
        const options = getAttributeOptions(attribute);
        const isColorAttribute = attribute.name.toLowerCase().includes('color') ||
          attribute.name.toLowerCase().includes('colour');
        const isSizeAttribute = attribute.name.toLowerCase().includes('size');

        // Custom WooCommerce attributes
        const isEventBoxes = attribute.name.toLowerCase() === 'event boxes';
        const isMixOptions = attribute.name.toLowerCase() === 'mix options';
        const isWeight = attribute.name.toLowerCase() === 'weight';

        return (
          <div key={attribute.id || attribute.name} className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                {attribute.name}
                {selectedAttributes[attribute.name] && (
                  <span className="ml-2 font-normal text-muted-foreground">
                    : {selectedAttributes[attribute.name]}
                  </span>
                )}
              </Label>
            </div>

            {/* Event Boxes - Image Swatches */}
            {isEventBoxes && (
              <div className="flex flex-wrap gap-3">
                {options.map((option) => {
                  const isSelected = selectedAttributes[attribute.name] === option;
                  const isAvailable = isOptionAvailable(attribute.name, option);

                  // Map option names to image paths (you can customize these paths)
                  const imageMap: Record<string, string> = {
                    'Baby Boy': '/images/swatches/baby-boy.jpg',
                    'Baby Girl': '/images/swatches/baby-girl.jpg',
                    'Traditional Box': '/images/swatches/traditional-box.jpg',
                  };

                  return (
                    <button
                      key={option}
                      onClick={() => handleAttributeChange(attribute.name, option)}
                      disabled={!isAvailable}
                      className={cn(
                        'group relative flex flex-col items-center gap-2 rounded-lg border-2 p-2 transition-all',
                        isSelected
                          ? 'border-primary ring-2 ring-primary ring-offset-2'
                          : 'border-border hover:border-primary/50',
                        !isAvailable && 'cursor-not-allowed opacity-40'
                      )}
                      title={option}
                    >
                      <div className="relative h-20 w-20 overflow-hidden rounded-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageMap[option] || '/placeholder.jpg'}
                          alt={option}
                          className="h-full w-full object-cover"
                        />
                        {!isAvailable && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="h-px w-full rotate-45 bg-red-500" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium text-center">{option}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Mix Options - Label Swatches */}
            {isMixOptions && (
              <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                  const isSelected = selectedAttributes[attribute.name] === option;
                  const isAvailable = isOptionAvailable(attribute.name, option);

                  return (
                    <Button
                      key={option}
                      onClick={() => handleAttributeChange(attribute.name, option)}
                      disabled={!isAvailable}
                      variant={isSelected ? 'default' : 'outline'}
                      size="lg"
                      className={cn(
                        'min-w-[6rem] font-medium',
                        isSelected && 'bg-primary text-primary-foreground',
                        !isAvailable && 'relative opacity-40'
                      )}
                    >
                      {option}
                      {!isAvailable && (
                        <span className="absolute inset-x-0 top-1/2 h-px bg-destructive" />
                      )}
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Weight - Label Swatches */}
            {isWeight && (
              <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                  const isSelected = selectedAttributes[attribute.name] === option;
                  const isAvailable = isOptionAvailable(attribute.name, option);

                  return (
                    <Button
                      key={option}
                      onClick={() => handleAttributeChange(attribute.name, option)}
                      disabled={!isAvailable}
                      variant={isSelected ? 'default' : 'outline'}
                      size="default"
                      className={cn(
                        'min-w-[5rem] font-semibold',
                        isSelected && 'bg-primary text-primary-foreground border-primary',
                        !isAvailable && 'relative opacity-40'
                      )}
                    >
                      {option}
                      {!isAvailable && (
                        <span className="absolute inset-x-0 top-1/2 h-px bg-destructive" />
                      )}
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Color Swatches */}
            {isColorAttribute && !isEventBoxes && !isMixOptions && !isWeight && (
              <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                  const isSelected = selectedAttributes[attribute.name] === option;
                  const isAvailable = isOptionAvailable(attribute.name, option);

                  return (
                    <button
                      key={option}
                      onClick={() => handleAttributeChange(attribute.name, option)}
                      disabled={!isAvailable}
                      className={cn(
                        'group relative h-12 w-12 rounded-full border-2 transition-all',
                        isSelected
                          ? 'border-primary ring-2 ring-primary ring-offset-2'
                          : 'border-border hover:border-primary/50',
                        !isAvailable && 'cursor-not-allowed opacity-40'
                      )}
                      title={option}
                    >
                      <div
                        className="h-full w-full rounded-full"
                        style={{
                          backgroundColor: option.toLowerCase(),
                        }}
                      />
                      {!isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-px w-full rotate-45 bg-red-500" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Size Buttons */}
            {isSizeAttribute && !isEventBoxes && !isMixOptions && !isWeight && (
              <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                  const isSelected = selectedAttributes[attribute.name] === option;
                  const isAvailable = isOptionAvailable(attribute.name, option);

                  return (
                    <Button
                      key={option}
                      onClick={() => handleAttributeChange(attribute.name, option)}
                      disabled={!isAvailable}
                      variant={isSelected ? 'default' : 'outline'}
                      className={cn(
                        'min-w-[4rem]',
                        !isAvailable && 'relative opacity-40'
                      )}
                    >
                      {option}
                      {!isAvailable && (
                        <span className="absolute inset-x-0 top-1/2 h-px bg-destructive" />
                      )}
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Dropdown for other attributes */}
            {!isColorAttribute && !isSizeAttribute && !isEventBoxes && !isMixOptions && !isWeight && (
              <Select
                value={selectedAttributes[attribute.name] || ''}
                onValueChange={(value) => handleAttributeChange(attribute.name, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Choose ${attribute.name}`} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => {
                    const isAvailable = isOptionAvailable(attribute.name, option);
                    return (
                      <SelectItem
                        key={option}
                        value={option}
                        disabled={!isAvailable}
                      >
                        {option}
                        {!isAvailable && (
                          <span className="ml-2 text-muted-foreground">
                            (Out of stock)
                          </span>
                        )}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>
        );
      })}

      {/* Selected Variation Info */}
      {selectedVariation && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="space-y-2">
            {selectedVariation.sku && (
              <p className="text-sm text-muted-foreground">
                SKU: <span className="font-medium">{selectedVariation.sku}</span>
              </p>
            )}
            {selectedVariation.stock_status === 'instock' ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-green-600 text-green-600">
                  ✓ In Stock
                </Badge>
                {selectedVariation.stock_quantity && selectedVariation.stock_quantity < 10 && (
                  <span className="text-sm text-muted-foreground">
                    Only {selectedVariation.stock_quantity} left
                  </span>
                )}
              </div>
            ) : selectedVariation.stock_status === 'onbackorder' ? (
              <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                Available on Backorder
              </Badge>
            ) : (
              <Badge variant="outline" className="border-red-600 text-red-600">
                Out of Stock
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
