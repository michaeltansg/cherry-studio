import type { DropResult } from '@hello-pangea/dnd'
import { loggerService } from '@logger'
import {
  DraggableVirtualList,
  type DraggableVirtualListRef,
  useDraggableReorder
} from '@renderer/components/DraggableList'
import { ProviderAvatar } from '@renderer/components/ProviderAvatar'
import { useAllProviders, useProviders } from '@renderer/hooks/useProvider'
import { useTimer } from '@renderer/hooks/useTimer'
import type { Provider } from '@renderer/types'
import { getFancyProviderName, matchKeywordsInModel, matchKeywordsInProvider } from '@renderer/utils'
import type { MenuProps } from 'antd'
import { Dropdown, Input, Tag } from 'antd'
import { GripVertical, Search, UserPen } from 'lucide-react'
import type { FC } from 'react'
import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import useSWRImmutable from 'swr/immutable'

import ModelNotesPopup from './ModelNotesPopup'
import ProviderSetting from './ProviderSetting'

const logger = loggerService.withContext('ProviderList')

const SEARCH_WRAPPER_HEIGHT = 50

const getIsOvmsSupported = async (): Promise<boolean> => {
  try {
    const result = await window.api.ovms.isSupported()
    return result
  } catch (e) {
    logger.warn('Fetching isOvmsSupported failed. Fallback to false.', e as Error)
    return false
  }
}

const ProviderList: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const providers = useAllProviders()
  const { updateProviders } = useProviders()
  const { setTimeoutTimer } = useTimer()
  const [selectedProvider, _setSelectedProvider] = useState<Provider>(providers[0])
  const { t } = useTranslation()
  const [searchText, setSearchText] = useState<string>('')
  const [dragging, setDragging] = useState(false)
  const listRef = useRef<DraggableVirtualListRef>(null)

  const { data: isOvmsSupported } = useSWRImmutable('ovms/isSupported', getIsOvmsSupported)

  const setSelectedProvider = useCallback((provider: Provider) => {
    startTransition(() => _setSelectedProvider(provider))
  }, [])

  useEffect(() => {
    if (searchParams.get('id')) {
      const providerId = searchParams.get('id')
      const provider = providers.find((p) => p.id === providerId)
      if (provider) {
        setSelectedProvider(provider)
        const index = providers.findIndex((p) => p.id === providerId)
        if (index >= 0) {
          setTimeoutTimer(
            'scroll-to-selected-provider',
            () => listRef.current?.scrollToIndex(index, { align: 'center' }),
            100
          )
        }
      } else {
        setSelectedProvider(providers[0])
      }
      searchParams.delete('id')
      setSearchParams(searchParams)
    }
  }, [providers, searchParams, setSearchParams, setSelectedProvider, setTimeoutTimer])

  const getDropdownMenus = (_provider: Provider): MenuProps['items'] => {
    return [
      {
        label: t('settings.provider.notes.title'),
        key: 'notes',
        icon: <UserPen size={14} />,
        onClick: () => ModelNotesPopup.show({ provider: _provider })
      }
    ]
  }

  const filteredProviders = providers.filter((provider) => {
    if (provider.id === 'ovms' && !isOvmsSupported) {
      return false
    }

    const keywords = searchText.toLowerCase().split(/\s+/).filter(Boolean)
    const isProviderMatch = matchKeywordsInProvider(keywords, provider)
    const isModelMatch = provider.models.some((model) => matchKeywordsInModel(keywords, model))
    return isProviderMatch || isModelMatch
  })

  const { onDragEnd: handleReorder, itemKey } = useDraggableReorder({
    originalList: providers,
    filteredList: filteredProviders,
    onUpdate: updateProviders,
    itemKey: 'id'
  })

  const handleDragStart = useCallback(() => {
    setDragging(true)
  }, [])

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      setDragging(false)
      handleReorder(result)
    },
    [handleReorder]
  )

  return (
    <Container className="selectable">
      <ProviderListContainer>
        <SearchWrapper>
          <Input
            type="text"
            placeholder={t('settings.provider.search')}
            value={searchText}
            style={{ borderRadius: 'var(--list-item-border-radius)', height: 35 }}
            suffix={<Search size={14} />}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation()
                setSearchText('')
              }
            }}
            allowClear
            disabled={dragging}
          />
        </SearchWrapper>
        <DraggableVirtualList
          ref={listRef}
          list={filteredProviders}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          estimateSize={useCallback(() => 40, [])}
          itemKey={itemKey}
          overscan={3}
          style={{
            height: `calc(100% - ${SEARCH_WRAPPER_HEIGHT}px)`
          }}
          scrollerStyle={{
            padding: 8,
            paddingRight: 5
          }}
          itemContainerStyle={{ paddingBottom: 5 }}>
          {(provider) => (
            <Dropdown menu={{ items: getDropdownMenus(provider) }} trigger={['contextMenu']}>
              <ProviderListItem
                key={provider.id}
                className={provider.id === selectedProvider?.id ? 'active' : ''}
                onClick={() => setSelectedProvider(provider)}>
                <DragHandle>
                  <GripVertical size={12} />
                </DragHandle>
                <ProviderAvatar
                  style={{
                    width: 24,
                    height: 24
                  }}
                  provider={provider}
                />
                <ProviderItemName className="text-nowrap">{getFancyProviderName(provider)}</ProviderItemName>
                {provider.enabled && (
                  <Tag color="green" style={{ marginLeft: 'auto', marginRight: 0, borderRadius: 16 }}>
                    ON
                  </Tag>
                )}
              </ProviderListItem>
            </Dropdown>
          )}
        </DraggableVirtualList>
      </ProviderListContainer>
      <ProviderSetting providerId={selectedProvider.id} key={selectedProvider.id} />
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

const ProviderListContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-width: calc(var(--settings-width) + 10px);
  height: calc(100vh - var(--navbar-height));
  padding-bottom: 5px;
  border-right: 0.5px solid var(--color-border);
`

const ProviderListItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px 10px;
  width: 100%;
  border-radius: var(--list-item-border-radius);
  font-size: 14px;
  transition: all 0.2s ease-in-out;
  border: 0.5px solid transparent;
  user-select: none;
  cursor: pointer;
  &:hover {
    background: var(--color-background-soft);
  }
  &.active {
    background: var(--color-background-soft);
    border: 0.5px solid var(--color-border);
    font-weight: bold !important;
  }
`

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -8px;
  width: 12px;
  color: var(--color-text-3);
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  cursor: grab;

  ${ProviderListItem}:hover & {
    opacity: 1;
  }

  &:active {
    cursor: grabbing;
  }
`

const ProviderItemName = styled.div`
  margin-left: 10px;
  font-weight: 500;
`

const SearchWrapper = styled.div`
  height: ${SEARCH_WRAPPER_HEIGHT}px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 10px 8px;
`

export default ProviderList
