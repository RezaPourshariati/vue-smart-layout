import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import type { FilterState, User } from '@/types'
import { createSlice } from '@reduxjs/toolkit'

const initialState: FilterState = {
  filteredUsers: [],
}

interface FilterPayload {
  users: User[]
  search: string
}

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    FILTER_USERS(state, action: PayloadAction<FilterPayload>) {
      const { users, search } = action.payload
      state.filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase())
        || user.email.toLowerCase().includes(search.toLowerCase()),
      )
    },
  },
})

export const { FILTER_USERS } = filterSlice.actions

export const selectUsers = (state: RootState) => state.filter.filteredUsers

export default filterSlice.reducer
