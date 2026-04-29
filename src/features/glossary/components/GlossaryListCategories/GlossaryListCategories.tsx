import { useEffect, useState } from 'react'

import { Dropdown, Option } from '@alien-worlds/uikit'
import { Flex } from '@chakra-ui/react'
import { GlossaryCategoriesOptions } from 'features/glossary/utils/glossaryConst'
import { uniq, map } from 'lodash'
import { useActions, useAppState } from 'store'

const GlossaryListCategories = () => {
  const {
    main: { glossaryDrawer },
  } = useAppState()

  const {
    main: { glossary: glossaryActions },
  } = useActions()

  const [articleCategories, setArticleCategories] = useState<Option[]>([])

  useEffect(() => {
    const categories = uniq(map(glossaryDrawer.list, (article) => article.termCategory))
    const mappedCategories = map(categories, (category) => ({ value: category, label: category }))

    const categoriesWithAllCategory = [GlossaryCategoriesOptions[0], ...mappedCategories]

    setArticleCategories(categoriesWithAllCategory)
  }, [glossaryDrawer.list])
  if (articleCategories.length === 0) return null
  return (
    <Flex width="full">
      <Dropdown
        defaultValue={articleCategories[0]}
        options={articleCategories}
        onChange={(item: Option) => {
          glossaryActions.setSelectedCategory(item.value)
        }}
        variant="simple"
        size="md"
      />
    </Flex>
  )
}

export { GlossaryListCategories }
