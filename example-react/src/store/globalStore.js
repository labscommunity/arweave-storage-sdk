import { enableMapSet } from 'immer'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { shallow } from 'zustand/shallow'
import { createWithEqualityFn } from 'zustand/traditional'

import createAuthSlice from './auth'
import createExplorerSlice from './explorer'

enableMapSet()

const withMiddlewares = (f) => devtools(immer(f))

export const useGlobalStore = createWithEqualityFn(
  withMiddlewares((...args) => ({
    ...createAuthSlice(...args),
    ...createExplorerSlice(...args)
  })),
  shallow
)
