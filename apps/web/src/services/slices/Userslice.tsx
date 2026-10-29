import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { UserProfile } from '../api/Userapi'

const userSlice = createSlice({
  name: 'user',
  initialState: null as UserProfile | null,
  reducers: {
    setuser: (_state, action: PayloadAction<UserProfile | null>) => action.payload,
  },
})

export const { setuser } = userSlice.actions
export default userSlice.reducer
