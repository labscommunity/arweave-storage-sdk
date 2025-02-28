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
    logout: () =>
      set((state) => {
        state.authState = initialAuthState
      })
    
  }
})

export default createAuthSlice
