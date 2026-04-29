/**
 * @fileoverview Example NFT Card component demonstrating the new architecture
 *
 * This component shows how to use the refactored inventory system
 * with proper error handling, type safety, and modular design.
 */

import React from 'react'

import { Box, Text, Image, VStack, HStack, Badge, Button } from '@chakra-ui/react'

import { useInventory } from '../../hooks/useInventory'
import { NFTCardProps } from '../../types'
import { InventoryErrorBoundary } from '../ErrorBoundary'

/**
 * Example NFT Card component using the new architecture
 *
 * @param props - Component props
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <NFTCardExample
 *   asset={processedAsset}
 *   config={{ showZoom: true }}
 *   onAction={(action, data) => console.log(action, data)}
 * />
 * ```
 */
export const NFTCardExample: React.FC<NFTCardProps> = ({ asset, config = {}, onAction }) => {
  const { showZoom = false, showActions = true, zoomCallback } = config

  // Handle asset actions
  const handleAction = (action: string, data: any) => {
    if (onAction) {
      onAction(action, data)
    }
  }

  // Handle zoom action
  const handleZoom = () => {
    if (zoomCallback) {
      zoomCallback()
    }
    handleAction('zoom', asset)
  }

  // Handle set action
  const handleSet = () => {
    handleAction('set', asset)
  }

  return (
    <InventoryErrorBoundary>
      <Box
        maxW="280px"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bg="gray.800"
        color="white"
        position="relative"
        _hover={{ transform: 'translateY(-2px)', transition: 'transform 0.2s' }}
      >
        {/* Image Section */}
        <Box position="relative">
          <Image
            src={asset.nftImage?.name || '/images/placeholder.png'}
            alt={asset.title?.name || 'NFT'}
            w="100%"
            h="200px"
            objectFit="cover"
            fallbackSrc="/images/placeholder.png"
          />

          {/* Rarity Badge */}
          {asset.rarity && (
            <Badge
              position="absolute"
              top="2"
              right="2"
              colorScheme={getRarityColor(asset.rarity.name)}
              variant="solid"
            >
              {asset.rarity.name.toUpperCase()}
            </Badge>
          )}

          {/* Shine Indicator */}
          {asset.shine && asset.shine.name !== 'stone' && (
            <Badge position="absolute" top="2" left="2" colorScheme="yellow" variant="outline">
              {asset.shine.name.toUpperCase()}
            </Badge>
          )}
        </Box>

        {/* Content Section */}
        <VStack p="4" spacing="3" align="stretch">
          {/* Title and Type */}
          <VStack spacing="1" align="stretch">
            <Text fontSize="lg" fontWeight="bold" textAlign="center" isTruncated>
              {asset.title?.name || 'Unknown'}
            </Text>

            <Text fontSize="sm" color="gray.400" textAlign="center">
              {asset.type?.name || 'Unknown Type'}
            </Text>
          </VStack>

          {/* Description */}
          {asset.description?.name && (
            <Text fontSize="sm" color="gray.300" textAlign="center" noOfLines={2}>
              {asset.description.name}
            </Text>
          )}

          {/* Stats/Powers */}
          {asset.cardPowers && asset.cardPowers.length > 0 && (
            <VStack spacing="2" align="stretch">
              <Text fontSize="xs" color="gray.400" fontWeight="bold">
                STATS
              </Text>
              {asset.cardPowers.slice(0, 3).map((power: any, index: number) => (
                <HStack key={index} justify="space-between">
                  <Text fontSize="xs" color="gray.300">
                    {power.label || power.type}
                  </Text>
                  <Text fontSize="xs" color="yellow.400" fontWeight="bold">
                    {power.value}
                  </Text>
                </HStack>
              ))}
            </VStack>
          )}

          {/* Mint Information */}
          {asset.mints && (
            <HStack justify="space-between">
              <Text fontSize="xs" color="gray.400">
                Mint #
              </Text>
              <Text fontSize="xs" color="blue.400" fontWeight="bold">
                {asset.mints.name}
              </Text>
            </HStack>
          )}

          {/* Copies Information */}
          {asset.cardcopies && (
            <HStack justify="space-between">
              <Text fontSize="xs" color="gray.400">
                Copies
              </Text>
              <Text fontSize="xs" color="green.400" fontWeight="bold">
                {asset.cardcopies}x
              </Text>
            </HStack>
          )}

          {/* Actions */}
          {showActions && (
            <VStack spacing="2" mt="2">
              {asset.type?.name === 'Land' && (
                <Button
                  size="sm"
                  colorScheme="green"
                  variant="outline"
                  w="full"
                  onClick={handleSet}
                >
                  Set Land
                </Button>
              )}

              {asset.type?.name === 'Avatar' && (
                <Button size="sm" colorScheme="blue" variant="outline" w="full" onClick={handleSet}>
                  Set Avatar
                </Button>
              )}

              {showZoom && (
                <Button size="sm" colorScheme="gray" variant="ghost" w="full" onClick={handleZoom}>
                  Zoom
                </Button>
              )}
            </VStack>
          )}
        </VStack>

        {/* In Bag Indicator */}
        {asset.isInBag && (
          <Box
            position="absolute"
            top="2"
            right="2"
            w="3"
            h="3"
            bg="green.500"
            borderRadius="full"
            border="2px solid"
            borderColor="white"
          />
        )}
      </Box>
    </InventoryErrorBoundary>
  )
}

/**
 * Gets the color scheme for rarity badges
 *
 * @param rarity - The rarity name
 * @returns Chakra UI color scheme
 */
const getRarityColor = (rarity: string): string => {
  const rarityColors: Record<string, string> = {
    common: 'gray',
    uncommon: 'green',
    rare: 'blue',
    epic: 'purple',
    legendary: 'orange',
    mythic: 'red',
    abundant: 'teal',
  }

  return rarityColors[rarity.toLowerCase()] || 'gray'
}

/**
 * Example usage component showing how to integrate the new architecture
 */
export const InventoryExample: React.FC = () => {
  const { assets, loading, error } = useInventory(
    [], // Your assets array
    'wallet123', // Your wallet ID
    [] // Your bag assets
  )

  const handleAssetAction = (action: string) => {
    switch (action) {
      case 'set':
        // Handle setting asset
        break
      case 'zoom':
        // Handle zooming asset
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  if (loading) {
    return <Text>Loading inventory...</Text>
  }

  if (error) {
    return <Text color="red.500">Error: {error}</Text>
  }

  return (
    <Box p="4">
      <Text fontSize="2xl" mb="4" fontWeight="bold">
        Inventory Example
      </Text>

      <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap="4">
        {assets.map((asset, index) => (
          <NFTCardExample
            key={asset.assetId?.name || index}
            asset={asset}
            config={{
              showZoom: true,
              showActions: true,
            }}
            onAction={handleAssetAction}
          />
        ))}
      </Box>

      {assets.length === 0 && (
        <Text textAlign="center" color="gray.500" mt="8">
          No assets found
        </Text>
      )}
    </Box>
  )
}

export default NFTCardExample
