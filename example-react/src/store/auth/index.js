const initialAuthState = {
  isLoggedIn: false,
  address: null,
  method: null
}

const createAuthSlice = (set) => ({
  authState: initialAuthState,
  authActions: {
    login: async (value) => {
      set((state) => {
        state.authState = value
      })
    },
    logout: () =>
      set((state) => {
        state.authState = initialAuthState
      })
  }
})

export default createAuthSlice
