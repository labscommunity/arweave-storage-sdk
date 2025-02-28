import { getStorageApi } from "../../utils/getStorageClient"

const initialAuthState = {
  isLoggedIn: false,
  address: null,
  profile: null
}

const createAuthSlice = (set) => ({
  authState: initialAuthState,
  authActions: {
    login: async (value) => {
      set((state) => {
        state.authState = value
      })
    },
    setProfile: (value) =>
      set((state) => {
        state.authState.profile = value
      }),
    fetchProfile: async () => {
      const storageApi = await getStorageApi()
      const profile = await storageApi.api.getProfile()
      if(profile.success){
        set((state) => {
          state.authState.profile = profile.data
        })
      }
    },
    logout: () =>
      set((state) => {
        state.authState = initialAuthState
      })
    
  }
})

export default createAuthSlice
