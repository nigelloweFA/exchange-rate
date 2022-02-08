const initialState = {
    fullName: "John Smith",
    loggedIn: false,
}
export function userReducer(state = initialState, action) {
    return state;
}

// selectors
export const getName = (state) => {
    return state.user.fullName.split(" ")[0].toUpperCase();
};
